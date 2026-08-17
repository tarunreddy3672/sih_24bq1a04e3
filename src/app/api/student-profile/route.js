import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import { getStudentProfile } from '@/lib/queries.js';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || 'admin';

    // Allow Admin or self-inspection
    const { searchParams } = new URL(request.url);
    const targetStudentId = searchParams.get('studentId') || '64f1a2b3c4d5e6f7a8b9c001';

    if (userRole !== 'admin' && session?.user?.id !== targetStudentId) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required for student drilldown' }, { status: 403 });
    }

    const profile = await getStudentProfile(targetStudentId);
    if (!profile) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
