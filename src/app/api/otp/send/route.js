import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/queries.js';
import { sendOTPEmail } from '@/lib/mailer.js';

// In-memory OTP store: { email -> { otp, expiresAt, name, purpose } }
// In production use Redis or a DB collection
const otpStore = new Map();

export function getOTPStore() { return otpStore; }

export async function POST(request) {
  try {
    const { email, name, purpose = 'register' } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // For registration: block only if email exists in real DB (ignore in-memory demo users)
    if (purpose === 'register') {
      const existing = await getUserByEmail(normalizedEmail);
      // Only block if it's a real DB record (has _id as ObjectId string, not a hardcoded demo _id)
      if (existing && existing.passwordHash) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
      }
    }

    // For login: require email to exist
    if (purpose === 'login') {
      const existing = await getUserByEmail(normalizedEmail);
      if (!existing) {
        return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
      }
    }

    // Rate limit: 1 OTP per 60 seconds
    const existing = otpStore.get(normalizedEmail);
    if (existing && Date.now() < existing.expiresAt - 9 * 60 * 1000) {
      return NextResponse.json({ error: 'Please wait 60 seconds before requesting a new code.' }, { status: 429 });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(normalizedEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
      name: name || '',
      purpose,
    });

    const result = await sendOTPEmail(normalizedEmail, otp, name);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}.`,
      // Only expose preview in dev (console fallback)
      ...(result.preview ? { preview: result.preview } : {}),
    });
  } catch (error) {
    console.error('[OTP send]', error.message);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
