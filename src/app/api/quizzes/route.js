import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import { getQuizzes, getQuizById, createQuiz, submitQuizAttempt, getQuizAttemptsByStudent } from '@/lib/queries.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('id');
    const subject = searchParams.get('subject');
    const studentHistory = searchParams.get('history');

    const session = await getServerSession(authOptions);

    if (studentHistory) {
      const studentId = session?.user?.id || '64f1a2b3c4d5e6f7a8b9c001';
      const history = await getQuizAttemptsByStudent(studentId);
      return NextResponse.json({ history });
    }

    if (quizId) {
      const quiz = await getQuizById(quizId, true);
      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }
      return NextResponse.json({ quiz });
    }

    const quizzes = await getQuizzes(subject || undefined);
    return NextResponse.json({ quizzes });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { action } = body;

    // 1. Submit Quiz Attempt
    if (action === 'submit') {
      const { quizId, selectedAnswers } = body;
      if (!quizId || !selectedAnswers || !Array.isArray(selectedAnswers)) {
        return NextResponse.json({ error: 'Invalid quiz submission parameters' }, { status: 400 });
      }

      // Identify student from session or fallback demo
      const studentId = session?.user?.id || '64f1a2b3c4d5e6f7a8b9c001';

      // Server-side scoring & weak topic calculation
      const result = await submitQuizAttempt({
        quizId,
        studentId,
        selectedAnswers,
      });

      return NextResponse.json({ success: true, result });
    }

    // 2. Create Quiz (Faculty or Admin only)
    if (action === 'create') {
      const userRole = session?.user?.role || 'faculty'; // Allow demo faculty fallback if unauthenticated demo
      if (userRole !== 'faculty' && userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized: Faculty or Admin role required' }, { status: 403 });
      }

      const { subject, questions } = body;
      if (!subject || !questions || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: 'Subject and questions array are required' }, { status: 400 });
      }

      // Validate question structure
      for (const q of questions) {
        if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || q.correctAnswer === undefined || !q.topic) {
          return NextResponse.json({ error: 'Each question must have question text, options, correctAnswer index, and topic' }, { status: 400 });
        }
      }

      const createdBy = session?.user?.id || '64f1a2b3c4d5e6f7a8b9c004';
      const created = await createQuiz({
        subject,
        questions,
        createdBy,
      });

      return NextResponse.json({ success: true, quiz: created });
    }

    return NextResponse.json({ error: 'Unknown action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
