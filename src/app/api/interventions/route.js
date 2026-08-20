import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import connectToDatabase from '@/lib/mongodb.js';
import Intervention from '@/lib/models/Intervention.js';
import StudentScore from '@/lib/models/StudentScore.js';
import { isValidObjectId } from '@/lib/queries.js';

// GET /api/interventions?studentId=xxx
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role || 'faculty';
    if (role !== 'faculty' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ interventions: [] });
    const filter = studentId && isValidObjectId(studentId) ? { studentId } : {};
    const interventions = await Intervention.find(filter)
      .sort({ createdAt: -1 })
      .populate('facultyId', 'name')
      .lean();
    return NextResponse.json({ interventions });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/interventions
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role || 'faculty';
    const facultyId = session?.user?.id;
    if (role !== 'faculty' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { studentId, type, reason, notes } = await request.json();
    if (!studentId || !type || !reason) {
      return NextResponse.json({ error: 'studentId, type and reason are required' }, { status: 400 });
    }
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    let riskScoreAtCreation = 0;
    let riskFactors = [];
    if (isValidObjectId(studentId)) {
      const score = await StudentScore.findOne({ studentId }).lean();
      if (score) { riskScoreAtCreation = score.riskScore || 0; riskFactors = score.riskFactors || []; }
    }

    const intervention = await Intervention.create({
      studentId,
      facultyId: isValidObjectId(facultyId) ? facultyId : undefined,
      type,
      reason,
      notes: notes || '',
      riskFactors,
      riskScoreAtCreation,
      status: 'active',
    });
    return NextResponse.json({ success: true, intervention });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/interventions — update status/outcome
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role || 'faculty';
    if (role !== 'faculty' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { interventionId, status, outcome } = await request.json();
    if (!interventionId || !isValidObjectId(interventionId)) {
      return NextResponse.json({ error: 'Valid interventionId required' }, { status: 400 });
    }
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    const update = { status };
    if (outcome) update.outcome = outcome;
    if (status === 'completed') update.resolvedAt = new Date();
    const updated = await Intervention.findByIdAndUpdate(interventionId, { $set: update }, { returnDocument: 'after' }).lean();
    return NextResponse.json({ success: true, intervention: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
