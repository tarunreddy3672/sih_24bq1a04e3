/**
 * WhatsApp / SMS Alert Utility — Twilio
 * ──────────────────────────────────────
 * Env vars required:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_NUMBER   e.g. "whatsapp:+14155238886"  (Twilio sandbox)
 *   TWILIO_SMS_NUMBER        e.g. "+14155238886"           (SMS fallback)
 *   ALERT_THRESHOLD_PCT      default 75
 *
 * Dedup: one alert per student per calendar day (checked via alertSentAt on AttendanceRecord).
 */

const ACCOUNT_SID   = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN    = process.env.TWILIO_AUTH_TOKEN;
const WA_FROM       = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
const SMS_FROM      = process.env.TWILIO_SMS_NUMBER      || '';
const THRESHOLD     = Number(process.env.ALERT_THRESHOLD_PCT || 75);

/**
 * Send a single WhatsApp message via Twilio REST API (no SDK needed).
 * Falls back to SMS if guardianPhone doesn't start with "whatsapp:".
 */
async function sendTwilioMessage(to, body) {
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    console.warn('[alerts] Twilio env vars not set — message not sent:', body);
    return { sid: 'DEMO_NO_TWILIO', status: 'skipped' };
  }

  const toWA  = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const toSMS = to.replace('whatsapp:', '');

  // Try WhatsApp first
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: WA_FROM, To: toWA, Body: body }).toString(),
      }
    );
    const data = await res.json();
    if (data.sid) return { sid: data.sid, status: 'whatsapp' };
    throw new Error(data.message || 'WhatsApp send failed');
  } catch (waErr) {
    // SMS fallback
    if (!SMS_FROM) throw waErr;
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: SMS_FROM, To: toSMS, Body: body }).toString(),
      }
    );
    const data = await res.json();
    if (!data.sid) throw new Error(data.message || 'SMS send failed');
    return { sid: data.sid, status: 'sms' };
  }
}

/**
 * Build a plain, factual alert message — no marketing tone.
 */
function buildMessage({ studentName, attendancePct, riskTier, reason }) {
  const lines = [
    `EduVision Attendance Alert`,
    `Student: ${studentName}`,
    `Attendance: ${attendancePct}% (minimum required: ${THRESHOLD}%)`,
  ];
  if (riskTier === 'High') lines.push(`Risk level: High`);
  if (reason) lines.push(`Reason: ${reason}`);
  lines.push(`Please contact the institution for details.`);
  return lines.join('\n');
}

/**
 * Check if an alert was already sent today for this student (dedup).
 * @param {Date|null} alertSentAt
 */
function alreadySentToday(alertSentAt) {
  if (!alertSentAt) return false;
  const sent  = new Date(alertSentAt);
  const today = new Date();
  return (
    sent.getFullYear() === today.getFullYear() &&
    sent.getMonth()    === today.getMonth()    &&
    sent.getDate()     === today.getDate()
  );
}

/**
 * Main entry point — called after attendance is committed.
 * Checks each student's attendance %, sends alert if below threshold
 * and no alert has been sent today.
 *
 * @param {Array} studentRecords  - array of { studentId, name, guardianPhone, attendancePct, riskTier, riskReasons, alertSentAt }
 * @param {Function} updateAlertSentAt - async (studentId) => void  — persists the dedup timestamp
 * @returns {Array} results
 */
export async function sendAttendanceAlerts(studentRecords, updateAlertSentAt) {
  const results = [];

  for (const s of studentRecords) {
    const shouldAlert =
      s.guardianPhone &&
      (s.attendancePct < THRESHOLD || s.riskTier === 'High') &&
      !alreadySentToday(s.alertSentAt);

    if (!shouldAlert) {
      results.push({ studentId: s.studentId, sent: false, reason: alreadySentToday(s.alertSentAt) ? 'dedup' : 'threshold_ok' });
      continue;
    }

    const body = buildMessage({
      studentName:   s.name,
      attendancePct: s.attendancePct,
      riskTier:      s.riskTier,
      reason:        s.riskReasons?.[0] || '',
    });

    try {
      const result = await sendTwilioMessage(s.guardianPhone, body);
      if (updateAlertSentAt) await updateAlertSentAt(s.studentId);
      results.push({ studentId: s.studentId, sent: true, channel: result.status, sid: result.sid });
    } catch (err) {
      console.error(`[alerts] Failed to send alert for ${s.name}:`, err.message);
      results.push({ studentId: s.studentId, sent: false, error: err.message });
    }
  }

  return results;
}
