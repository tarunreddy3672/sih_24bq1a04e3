import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import connectToDatabase from '@/lib/mongodb.js';
import SubjectAssignment from '@/lib/models/SubjectAssignment.js';
import User from '@/lib/models/User.js';

export async function GET(request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  const filter = section ? { section } : {};
  const assignments = await SubjectAssignment.find(filter).populate('facultyId', 'name email classOrSubject').lean();
  return NextResponse.json({ assignments });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!['admin', 'faculty'].includes(session?.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { section, subject, facultyId } = await request.json();
  if (!section || !subject) {
    return NextResponse.json({ error: 'section and subject are required' }, { status: 400 });
  }

  await connectToDatabase();
  const assignment = await SubjectAssignment.findOneAndUpdate(
    { section },
    { subject, facultyId: facultyId || null, updatedAt: new Date() },
    { upsert: true, returnDocument: 'after' }
  );
  return NextResponse.json({ success: true, assignment });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { section } = await request.json();
  await connectToDatabase();
  await SubjectAssignment.deleteOne({ section });
  return NextResponse.json({ success: true });
}
