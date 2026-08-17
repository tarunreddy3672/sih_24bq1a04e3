import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb.js';
import User from '@/lib/models/User.js';
import Quiz from '@/lib/models/Quiz.js';
import Streak from '@/lib/models/Streak.js';
import Feedback from '@/lib/models/Feedback.js';
import AttendanceRecord from '@/lib/models/AttendanceRecord.js';
import { DEMO_USERS, DEMO_QUIZZES, DEMO_STREAKS } from '@/lib/seed-data.js';

export async function POST() {
  const db = await connectToDatabase();
  if (!db) {
    return NextResponse.json({
      message: 'MongoDB URI not connected. Operating in high-performance local demo mode with in-memory store.',
      seeded: false,
    });
  }

  try {
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    for (const u of DEMO_USERS) {
      await User.findOneAndUpdate(
        { email: u.email },
        {
          name: u.name,
          email: u.email,
          role: u.role,
          classOrSubject: u.classOrSubject,
          faceEmbedding: u.faceEmbedding || [],
          passwordHash: defaultPasswordHash,
        },
        { upsert: true, new: true }
      );
    }

    const faculty = await User.findOne({ role: 'faculty' });
    const student = await User.findOne({ role: 'student' });

    if (faculty) {
      for (const q of DEMO_QUIZZES) {
        await Quiz.findOneAndUpdate(
          { subject: q.subject },
          {
            subject: q.subject,
            questions: q.questions,
            createdBy: faculty._id,
          },
          { upsert: true }
        );
      }
    }

    if (student) {
      await Streak.findOneAndUpdate(
        { studentId: student._id },
        {
          currentStreak: 14,
          longestStreak: 21,
          badges: ['14-Day Consistency Master', 'VLSI Quiz Champion', 'Perfect Morning Attendance'],
        },
        { upsert: true }
      );

      if (faculty) {
        await AttendanceRecord.create({
          studentId: student._id,
          facultyId: faculty._id,
          date: new Date(),
          status: 'present',
          confidenceScore: 97,
        });

        await Feedback.create({
          studentId: null,
          subjectOrFacultyId: 'Digital Electronics & VLSI',
          rating: 5,
          comment: 'Very engaging practical sessions!',
          anonymized: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with SIH demonstration data.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
