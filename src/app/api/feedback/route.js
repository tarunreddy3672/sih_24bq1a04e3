import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import { submitFeedback, getAggregatedFeedback } from '@/lib/queries.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectOrFacultyId = searchParams.get('target');

    const feedbackData = await getAggregatedFeedback(subjectOrFacultyId || undefined);
    return NextResponse.json({ feedback: feedbackData });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { subjectOrFacultyId, rating, comment, anonymized } = body;

    if (!subjectOrFacultyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid subject/faculty and rating (1-5) are required' }, { status: 400 });
    }

    const studentId = session?.user?.id || '64f1a2b3c4d5e6f7a8b9c001';

    const feedback = await submitFeedback({
      studentId,
      subjectOrFacultyId,
      rating: Number(rating),
      comment: comment || '',
      anonymized: anonymized !== false,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
