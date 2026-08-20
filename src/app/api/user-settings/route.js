import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import connectToDatabase from '@/lib/mongodb.js';
import User from '@/lib/models/User.js';
import { isValidObjectId } from '@/lib/queries.js';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await connectToDatabase();
    if (!db || !isValidObjectId(userId)) {
      return NextResponse.json({ settings: { languagePreference: 'en', accessibilitySettings: { fontSize: 'normal', highContrast: false, reducedMotion: false } } });
    }

    const user = await User.findById(userId).select('languagePreference accessibilitySettings').lean();
    return NextResponse.json({
      settings: {
        languagePreference: user?.languagePreference || 'en',
        accessibilitySettings: user?.accessibilitySettings || { fontSize: 'normal', highContrast: false, reducedMotion: false },
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const db = await connectToDatabase();
    if (!db || !isValidObjectId(userId)) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    const update = {};
    if (body.languagePreference) update.languagePreference = body.languagePreference;
    if (body.accessibilitySettings) update.accessibilitySettings = body.accessibilitySettings;

    await User.findByIdAndUpdate(userId, { $set: update });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
