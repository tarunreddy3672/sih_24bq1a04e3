import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb.js';
import User from '@/lib/models/User.js';
import { getUserByEmail } from '@/lib/queries.js';
import { getOTPStore } from '../send/route.js';

export async function POST(request) {
  try {
    const { email, otp, purpose = 'register', name, password, role, classOrSubject } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpStore = getOTPStore();
    const record = otpStore.get(normalizedEmail);

    if (!record) {
      return NextResponse.json({ error: 'No OTP found for this email. Please request a new code.' }, { status: 400 });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json({ error: 'OTP has expired. Please request a new code.' }, { status: 400 });
    }
    if (record.otp !== String(otp).trim()) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
    }

    // OTP valid — consume it
    otpStore.delete(normalizedEmail);

    // ── Registration flow ──────────────────────────────────────────────────
    if (purpose === 'register') {
      if (!name || !password) {
        return NextResponse.json({ error: 'Name and password are required.' }, { status: 400 });
      }

      const allowedRoles = ['student', 'faculty', 'admin'];
      const userRole = allowedRoles.includes(role) ? role : 'student';
      const passwordHash = await bcrypt.hash(password, 12);

      const db = await connectToDatabase();
      if (db) {
        const exists = await User.findOne({ email: normalizedEmail });
        // Only block if it's a real persisted account (has passwordHash)
        if (exists && exists.passwordHash) {
          return NextResponse.json({ error: 'Account already exists.' }, { status: 409 });
        }
        const newUser = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          role: userRole,
          classOrSubject: classOrSubject || (userRole === 'student' ? 'CSE-A' : userRole === 'faculty' ? 'Digital Electronics' : 'Administration'),
          passwordHash,
          faceEmbedding: [],
        });
        return NextResponse.json({
          success: true,
          message: 'Account created successfully! You can now sign in.',
          user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email, role: newUser.role },
        }, { status: 201 });
      }

      // Demo/in-memory fallback
      return NextResponse.json({
        success: true,
        message: 'Demo mode: Account verified. Connect MongoDB to persist.',
        user: { id: 'demo-' + Date.now(), name: name.trim(), email: normalizedEmail, role: userRole },
      }, { status: 201 });
    }

    // ── Login OTP flow ─────────────────────────────────────────────────────
    if (purpose === 'login') {
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: 'OTP verified.',
        user: {
          id: user._id?.toString() || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          classOrSubject: user.classOrSubject,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown purpose.' }, { status: 400 });
  } catch (error) {
    console.error('[OTP verify]', error.message);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
