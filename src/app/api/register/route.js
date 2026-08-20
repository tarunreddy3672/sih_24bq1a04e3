import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb.js';
import { getUserByEmail } from '@/lib/queries.js';
import User from '@/lib/models/User.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, classOrSubject } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const allowedRoles = ['student', 'faculty', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    // Await connection before any DB ops
    const db = await connectToDatabase();

    if (db) {
      // Check if email already exists in MongoDB (only real accounts with passwordHash)
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser && existingUser.passwordHash) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: userRole,
        classOrSubject:
          classOrSubject ||
          (userRole === 'student' ? 'CSE-A' : userRole === 'faculty' ? 'Digital Electronics' : 'Administration'),
        passwordHash,
        faceEmbedding: [],
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully! You can now sign in.',
          user: {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        },
        { status: 201 }
      );
    } else {
      // MongoDB not available — check demo in-memory store via queries layer
      const existing = await getUserByEmail(email.trim());
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }

      // In demo mode: simulate success (in-memory only, not persisted)
      return NextResponse.json(
        {
          success: true,
          message:
            'Demo mode: Account registered in memory. Connect MongoDB Atlas to persist accounts.',
          user: {
            id: 'demo-' + Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            role: userRole,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
