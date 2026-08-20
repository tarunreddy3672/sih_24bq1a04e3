/**
 * Student Success Score Engine
 * ─────────────────────────────
 * Deterministic weighted calculation — no LLM involved.
 *
 * Weights (total 100):
 *   Attendance   25%  — overall attendance % this semester
 *   Academic     30%  — average quiz score across all attempts
 *   Assignments  20%  — streak as proxy (until assignment model exists)
 *   Engagement   15%  — quiz attempt frequency (attempts per week)
 *   Consistency  10%  — current streak length normalised to 30 days
 *
 * Risk mapping (inverse of success):
 *   successScore >= 70  → Low risk
 *   successScore >= 45  → Medium risk
 *   successScore <  45  → High risk
 *
 * Risk score = 100 - successScore (clamped 0-100)
 */

import connectToDatabase from './mongodb.js';
import AttendanceRecord from './models/AttendanceRecord.js';
import QuizAttempt from './models/QuizAttempt.js';
import Streak from './models/Streak.js';
import StudentScore from './models/StudentScore.js';

// ── Signal calculators ────────────────────────────────────────────────────────

function calcAttendanceSignal(records) {
  if (!records.length) return 50; // neutral when no data
  const present = records.filter(r => r.status === 'present').length;
  return Math.round((present / records.length) * 100);
}

function calcAcademicSignal(attempts) {
  if (!attempts.length) return 50;
  const avg = attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length;
  return Math.round(avg);
}

function calcAssignmentSignal(streak) {
  // Proxy: streak > 0 means student is actively engaging daily
  // Normalise: 14+ days streak = 100, 0 days = 0
  const s = streak?.currentStreak ?? 0;
  return Math.min(100, Math.round((s / 14) * 100));
}

function calcEngagementSignal(attempts) {
  // Attempts per week over last 4 weeks — target is 2/week = 100
  if (!attempts.length) return 0;
  const fourWeeksAgo = new Date(Date.now() - 28 * 86400000);
  const recent = attempts.filter(a => new Date(a.createdAt) >= fourWeeksAgo);
  const perWeek = recent.length / 4;
  return Math.min(100, Math.round((perWeek / 2) * 100));
}

function calcConsistencySignal(streak) {
  // Normalise longestStreak to 30 days
  const s = streak?.longestStreak ?? 0;
  return Math.min(100, Math.round((s / 30) * 100));
}

// ── Composite score ───────────────────────────────────────────────────────────

function computeSuccessScore(breakdown) {
  return Math.round(
    breakdown.attendance  * 0.25 +
    breakdown.academic    * 0.30 +
    breakdown.assignments * 0.20 +
    breakdown.engagement  * 0.15 +
    breakdown.consistency * 0.10
  );
}

// ── Risk derivation ───────────────────────────────────────────────────────────

function deriveRisk(successScore, breakdown, attendanceRecords, quizAttempts) {
  const riskScore = Math.max(0, 100 - successScore);
  const riskTier  = successScore >= 70 ? 'Low' : successScore >= 45 ? 'Medium' : 'High';
  const factors   = [];

  if (breakdown.attendance < 75) {
    const pct = breakdown.attendance;
    factors.push(`Attendance is ${pct}% — below the 75% minimum threshold`);
  } else if (breakdown.attendance < 85) {
    factors.push(`Attendance at ${breakdown.attendance}% — approaching risk threshold`);
  }

  if (breakdown.academic < 50) {
    factors.push(`Average quiz score is ${breakdown.academic}% — critically low`);
  } else if (breakdown.academic < 65) {
    factors.push(`Quiz average of ${breakdown.academic}% is below the class median`);
  }

  // Detect declining quiz trend (last 3 attempts)
  if (quizAttempts.length >= 2) {
    const sorted = [...quizAttempts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const last3  = sorted.slice(-3);
    const first  = last3[0].score;
    const last   = last3[last3.length - 1].score;
    if (last - first <= -15) {
      factors.push(`Quiz scores declining: ${first}% → ${last}% over last ${last3.length} attempts`);
    }
  }

  if (breakdown.engagement < 25) {
    factors.push('Very low quiz engagement — fewer than 1 attempt per 2 weeks');
  }

  if (breakdown.consistency < 20) {
    factors.push('Low study consistency — streak history shows irregular engagement');
  }

  if (factors.length === 0) {
    factors.push('All indicators within normal range');
  }

  return { riskScore, riskTier, riskFactors: factors };
}

// ── Trend calculation ─────────────────────────────────────────────────────────

function calcTrend(current, previous) {
  if (previous === null || previous === undefined) return 'stable';
  const delta = current - previous;
  if (delta >= 3)  return 'improving';
  if (delta <= -3) return 'declining';
  return 'stable';
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Recalculate and persist the success + risk score for a student.
 * Safe to call fire-and-forget — all errors are caught internally.
 *
 * @param {string} studentId
 * @returns {Promise<object|null>} updated StudentScore document or null on failure
 */
export async function recalculate(studentId) {
  if (!studentId) return null;

  try {
    const db = await connectToDatabase();
    if (!db) return null;

    // Fetch all required data in parallel
    const [attendanceRecords, quizAttempts, streak] = await Promise.all([
      AttendanceRecord.find({ studentId }).lean(),
      QuizAttempt.find({ studentId }).sort({ createdAt: -1 }).lean(),
      Streak.findOne({ studentId }).lean(),
    ]);

    // Calculate each signal
    const breakdown = {
      attendance:  calcAttendanceSignal(attendanceRecords),
      academic:    calcAcademicSignal(quizAttempts),
      assignments: calcAssignmentSignal(streak),
      engagement:  calcEngagementSignal(quizAttempts),
      consistency: calcConsistencySignal(streak),
    };

    const successScore = computeSuccessScore(breakdown);
    const { riskScore, riskTier, riskFactors } = deriveRisk(
      successScore, breakdown, attendanceRecords, quizAttempts
    );

    // Load existing record to preserve history and prev values
    let existing = await StudentScore.findOne({ studentId });

    const prevSuccessScore = existing?.successScore ?? null;
    const prevRiskScore    = existing?.riskScore    ?? null;
    const trend            = calcTrend(successScore, prevSuccessScore);

    // Build history snapshot (keep last 10)
    const historyEntry = { successScore, riskScore, calculatedAt: new Date() };
    const history = existing?.history ?? [];
    const updatedHistory = [...history, historyEntry].slice(-10);

    const update = {
      studentId,
      successScore,
      prevSuccessScore,
      breakdown,
      riskScore,
      prevRiskScore,
      riskTier,
      riskFactors,
      trend,
      history: updatedHistory,
      calculatedAt: new Date(),
    };

    const result = await StudentScore.findOneAndUpdate(
      { studentId },
      { $set: update },
      { upsert: true, returnDocument: 'after' }
    );

    return result;
  } catch (err) {
    console.error('[successScoreEngine] recalculate error:', err.message);
    return null;
  }
}

/**
 * Batch recalculate for multiple students.
 * @param {string[]} studentIds
 */
export async function batchRecalculate(studentIds) {
  if (!studentIds?.length) return;
  await Promise.all(studentIds.map(id => recalculate(id)));
}

/**
 * Get the latest stored score for a student (no recalculation).
 * Falls back to a neutral object if no record exists yet.
 * @param {string} studentId
 */
export async function getScore(studentId) {
  if (!studentId) return null;
  try {
    const db = await connectToDatabase();
    if (!db) return null;
    return await StudentScore.findOne({ studentId }).lean();
  } catch (err) {
    console.error('[successScoreEngine] getScore error:', err.message);
    return null;
  }
}
