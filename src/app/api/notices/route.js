import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import { createNotice, getNoticesForStudent, getNoticesByFaculty } from '@/lib/queries.js';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const role      = session?.user?.role || 'student';
    const userId    = session?.user?.id   || '64f1a2b3c4d5e6f7a8b9c001';
    const studentId = searchParams.get('studentId');

    if (role === 'faculty' || role === 'admin') {
      // Faculty: get all notices they sent, or notices for a specific student
      if (studentId) {
        const notices = await getNoticesForStudent(studentId);
        return NextResponse.json({ notices });
      }
      const notices = await getNoticesByFaculty(userId);
      return NextResponse.json({ notices });
    }
    // Student: get their own notices
    const notices = await getNoticesForStudent(userId);
    return NextResponse.json({ notices });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session  = await getServerSession(authOptions);
    const userRole = session?.user?.role || 'faculty';
    if (userRole !== 'faculty' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    const { studentId, type, subject, message } = body;
    if (!studentId || !subject || !message) {
      return NextResponse.json({ error: 'studentId, subject and message are required' }, { status: 400 });
    }
    const facultyId = session?.user?.id || '64f1a2b3c4d5e6f7a8b9c004';
    const notice = await createNotice({ studentId, facultyId, type, subject, message });
    return NextResponse.json({ success: true, notice });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
