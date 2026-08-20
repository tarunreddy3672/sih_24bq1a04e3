/**
 * Student 360 — Central Context Aggregator
 * ──────────────────────────────────────────
 * Returns a complete, structured learning context for a student.
 * Used by: AI chat, study plan, faculty drilldown, risk engine, admin analytics.
 *
 * All data comes from real DB models with in-memory fallback where applicable.
 */

import connectToDatabase from './mongodb.js';
import { getUser, getAttendanceByStudent, getQuizAttemptsByStudent, getStreak } from './queries.js';
import { getScore } from './successScoreEngine.js';
import LearningPlan from './models/LearningPlan.js';
import Intervention from './models/Intervention.js';

/**
 * Build a compact AI-safe context summary (≤ 300 tokens).
 * Never includes raw PII beyond name and role.
 */
function buildAIContext(data) {
  const { user, attendance, quizSummary, streak, score, activePlan, activeIntervention } = data;

  return {
    studentName:    user.name,
    classOrSubject: user.classOrSubject,
    language:       user.languagePreference || 'en',
    attendance: {
      percentage:  attendance.overallPercentage,
      trend:       attendance.trend,
      totalClasses: attendance.totalClasses,
    },
    academic: {
      avgQuizScore: quizSummary.avgScore,
      totalAttempts: quizSummary.totalAttempts,
      weakTopics:   quizSummary.weakTopics.slice(0, 5),
      recentScores: quizSummary.recentScores.slice(0, 3),
    },
    streak: {
      current: streak.currentStreak,
      longest: streak.longestStreak,
    },
    successScore: score?.successScore ?? null,
    riskTier:     score?.riskTier     ?? 'Low',
    riskFactors:  score?.riskFactors  ?? [],
    trend:        score?.trend        ?? 'stable',
    activePlan:   activePlan ? {
      weakTopics:  activePlan.weakTopics,
      focusAreas:  activePlan.focusAreas,
      generatedAt: activePlan.generatedAt,
    } : null,
    activeIntervention: activeIntervention ? {
      type:   activeIntervention.type,
      reason: activeIntervention.reason,
      status: activeIntervention.status,
    } : null,
  };
}

/**
 * Calculate attendance trend from records.
 * Compares last 2 weeks vs prior 2 weeks.
 */
function calcAttendanceTrend(records) {
  const now          = Date.now();
  const twoWeeksAgo  = now - 14 * 86400000;
  const fourWeeksAgo = now - 28 * 86400000;

  const recent = records.filter(r => new Date(r.date) >= new Date(twoWeeksAgo));
  const prev   = records.filter(r => {
    const d = new Date(r.date);
    return d >= new Date(fourWeeksAgo) && d < new Date(twoWeeksAgo);
  });

  const recentPct = recent.length
    ? Math.round(recent.filter(r => r.status === 'present').length / recent.length * 100)
    : null;
  const prevPct = prev.length
    ? Math.round(prev.filter(r => r.status === 'present').length / prev.length * 100)
    : null;

  let trend = 'stable';
  if (recentPct !== null && prevPct !== null) {
    if (recentPct - prevPct >= 5)  trend = 'improving';
    if (recentPct - prevPct <= -5) trend = 'declining';
  }

  return { recentPct, prevPct, trend };
}

/**
 * Aggregate quiz attempt data into a summary.
 */
function buildQuizSummary(attempts) {
  if (!attempts.length) {
    return { avgScore: 0, totalAttempts: 0, weakTopics: [], recentScores: [], topicFrequency: {} };
  }

  const avgScore = Math.round(
    attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length
  );

  const topicFrequency = {};
  attempts.forEach(a => {
    (a.weakTopics || []).forEach(t => {
      topicFrequency[t] = (topicFrequency[t] || 0) + 1;
    });
  });

  const weakTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, missedCount]) => ({ topic, missedCount }));

  const recentScores = attempts
    .slice(0, 5)
    .map(a => ({
      score:     a.score,
      subject:   a.quizId?.subject || 'General',
      createdAt: a.createdAt,
    }));

  return { avgScore, totalAttempts: attempts.length, weakTopics, recentScores, topicFrequency };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Get the complete Student 360 context for a student.
 *
 * @param {string} studentId
 * @returns {Promise<object|null>}
 */
export async function getStudent360(studentId) {
  if (!studentId) return null;

  try {
    // Fetch all data in parallel
    const [user, attendanceRecords, quizAttempts, streak, score] = await Promise.all([
      getUser(studentId),
      getAttendanceByStudent(studentId),
      getQuizAttemptsByStudent(studentId),
      getStreak(studentId),
      getScore(studentId),
    ]);

    if (!user) return null;

    // Attendance stats
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const totalClasses = attendanceRecords.length || 0;
    const overallPercentage = totalClasses
      ? Math.round((presentCount / totalClasses) * 100)
      : 0;
    const { recentPct, prevPct, trend: attTrend } = calcAttendanceTrend(attendanceRecords);

    const attendance = {
      overallPercentage,
      totalClasses,
      presentCount,
      absentCount: totalClasses - presentCount,
      trend: attTrend,
      recentPct,
      prevPct,
      recent: attendanceRecords.slice(0, 14),
    };

    const quizSummary = buildQuizSummary(quizAttempts);

    // Active learning plan and intervention (DB only — no fallback needed)
    let activePlan         = null;
    let activeIntervention = null;

    try {
      const db = await connectToDatabase();
      if (db) {
        [activePlan, activeIntervention] = await Promise.all([
          LearningPlan.findOne({ studentId, status: 'active' }).sort({ generatedAt: -1 }).lean(),
          Intervention.findOne({ studentId, status: { $in: ['pending', 'active'] } }).sort({ createdAt: -1 }).lean(),
        ]);
      }
    } catch (e) {
      // Non-fatal — plan and intervention are optional enrichment
      console.warn('[student360] plan/intervention fetch error:', e.message);
    }

    const data = {
      user: {
        _id:                user._id,
        name:               user.name,
        email:              user.email,
        role:               user.role,
        classOrSubject:     user.classOrSubject,
        subjects:           user.subjects || [],
        labs:               user.labs || [],
        guardianPhone:      user.guardianPhone || '',
        languagePreference: user.languagePreference || 'en',
        faceRegistered:     Array.isArray(user.faceEmbedding) && user.faceEmbedding.length > 0,
        accessibilitySettings: user.accessibilitySettings || {},
      },
      attendance,
      quizSummary,
      quizAttempts,
      streak: streak || { currentStreak: 0, longestStreak: 0, badges: [] },
      score,
      activePlan,
      activeIntervention,
    };

    // Attach compact AI-safe context
    data.aiContext = buildAIContext(data);

    return data;
  } catch (err) {
    console.error('[student360] getStudent360 error:', err.message);
    return null;
  }
}
