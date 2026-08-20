/**
 * At-Risk Student Predictor
 * ─────────────────────────
 * Pure JS weighted scoring formula — no external ML runtime.
 * Inputs:  rolling attendance % (last 2 weeks), quiz score delta (last 3), streak breaks
 * Output:  { tier: 'Low'|'Medium'|'High', score: 0-100, reasons: string[] }
 *
 * Scoring weights (total 100 pts):
 *   Attendance drop (2-week)  → up to 50 pts
 *   Quiz score trend          → up to 30 pts
 *   Streak breaks             → up to 20 pts
 *
 * Thresholds:
 *   score >= 60  → High risk
 *   score >= 30  → Medium risk
 *   score <  30  → Low risk
 */

/**
 * @param {object} params
 * @param {number} params.attendancePct2w   - attendance % over last 2 weeks (0-100)
 * @param {number} params.attendancePctPrev - attendance % in the 2 weeks before that (0-100)
 * @param {number[]} params.lastThreeQuizScores - array of up to 3 recent quiz scores (0-100), oldest first
 * @param {number} params.streakBreaksLast14Days - number of streak breaks in last 14 days
 * @returns {{ tier: string, score: number, reasons: string[] }}
 */
export function predictRisk({ attendancePct2w, attendancePctPrev, lastThreeQuizScores, streakBreaksLast14Days }) {
  const reasons = [];
  let riskScore = 0;

  // ── 1. Attendance drop (weight: 50) ──────────────────────────────────────
  const attDrop = attendancePctPrev - attendancePct2w;   // positive = dropped
  if (attendancePct2w < 75) {
    riskScore += 50;
    reasons.push(`Attendance is ${attendancePct2w}% — below the 75% minimum threshold`);
  } else if (attDrop >= 15) {
    riskScore += 40;
    reasons.push(`Attendance dropped from ${attendancePctPrev}% to ${attendancePct2w}% in 2 weeks (−${attDrop}%)`);
  } else if (attDrop >= 8) {
    riskScore += 25;
    reasons.push(`Attendance declined from ${attendancePctPrev}% to ${attendancePct2w}% (−${attDrop}%)`);
  } else if (attDrop >= 3) {
    riskScore += 10;
    reasons.push(`Minor attendance dip: ${attendancePctPrev}% → ${attendancePct2w}%`);
  }

  // ── 2. Quiz score trend (weight: 30) ─────────────────────────────────────
  const scores = (lastThreeQuizScores || []).filter(s => typeof s === 'number');
  if (scores.length >= 2) {
    const first = scores[0];
    const last  = scores[scores.length - 1];
    const delta = last - first;   // negative = declining
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avgScore < 50) {
      riskScore += 30;
      reasons.push(`Average quiz score is ${Math.round(avgScore)}% — critically low`);
    } else if (delta <= -20) {
      riskScore += 25;
      reasons.push(`Quiz scores declining: ${first}% → ${last}% (−${Math.abs(delta)}% over last 3 quizzes)`);
    } else if (delta <= -10) {
      riskScore += 15;
      reasons.push(`Quiz performance trending down: ${first}% → ${last}%`);
    } else if (avgScore < 65) {
      riskScore += 10;
      reasons.push(`Quiz average of ${Math.round(avgScore)}% is below the class median`);
    }
  } else if (scores.length === 0) {
    riskScore += 15;
    reasons.push('No quiz attempts recorded in the current period');
  }

  // ── 3. Streak breaks (weight: 20) ────────────────────────────────────────
  const breaks = streakBreaksLast14Days || 0;
  if (breaks >= 5) {
    riskScore += 20;
    reasons.push(`${breaks} streak breaks in the last 14 days — consistent disengagement`);
  } else if (breaks >= 3) {
    riskScore += 12;
    reasons.push(`${breaks} streak breaks in the last 14 days`);
  } else if (breaks >= 1) {
    riskScore += 5;
    reasons.push(`${breaks} streak break(s) in the last 14 days`);
  }

  // ── Tier classification ───────────────────────────────────────────────────
  const clampedScore = Math.min(100, riskScore);
  const tier = clampedScore >= 60 ? 'High' : clampedScore >= 30 ? 'Medium' : 'Low';

  if (reasons.length === 0) {
    reasons.push('All indicators within normal range');
  }

  return { tier, score: clampedScore, reasons };
}

/**
 * Batch-predict risk for a list of students.
 * Each student object must have the fields expected by predictRisk().
 * Returns the same array with { riskTier, riskScore, riskReasons } appended.
 */
export function batchPredictRisk(students) {
  return students.map(s => {
    const result = predictRisk({
      attendancePct2w:        s.attendancePct2w        ?? 90,
      attendancePctPrev:      s.attendancePctPrev       ?? 90,
      lastThreeQuizScores:    s.lastThreeQuizScores     ?? [],
      streakBreaksLast14Days: s.streakBreaksLast14Days  ?? 0,
    });
    return { ...s, riskTier: result.tier, riskScore: result.score, riskReasons: result.reasons };
  });
}
