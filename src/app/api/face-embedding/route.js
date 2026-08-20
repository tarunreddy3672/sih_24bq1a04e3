import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import connectToDatabase from '@/lib/mongodb.js';
import User from '@/lib/models/User.js';

// GET /api/face-embedding?section=CSE-A
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    if (!section) return NextResponse.json({ error: 'section required' }, { status: 400 });

    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ students: [] });

    const students = await User.find(
      { role: 'student', classOrSubject: section },
      { name: 1, email: 1, classOrSubject: 1, faceEmbedding: 1 }
    ).lean();

    return NextResponse.json({ students });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/face-embedding  body: { embedding: number[] }
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { embedding } = await request.json();
    if (!Array.isArray(embedding) || embedding.length !== 128) {
      return NextResponse.json({ error: 'Invalid embedding — must be 128-element array' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    await User.findByIdAndUpdate(session.user.id, { faceEmbedding: embedding });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
