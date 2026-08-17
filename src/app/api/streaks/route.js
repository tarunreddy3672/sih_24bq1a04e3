import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import { getStreak, updateStreak } from '@/lib/queries.js';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    // Student can access their own streak or fallback demo student
    const studentId = session?.user?.id || '64f1a2b3c4d5e6f7a8b9c001';
    const streak = await getStreak(studentId);
    return NextResponse.json({ streak });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch streak' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = session.user.id;
    const updated = await updateStreak(studentId, true);
    return NextResponse.json({ success: true, streak: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update streak' }, { status: 500 });
  }
}
