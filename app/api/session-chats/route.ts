import { NextRequest, NextResponse } from 'next/server';
import { db, sessionchattable } from '../../../config/db';
import { eq, desc } from 'drizzle-orm';

// GET /api/session-chats?user=<userId>
export async function GET(req: NextRequest) {
  try {
    const user = req.nextUrl.searchParams.get('user') || 'Anonymous';

    // Fetch latest 20 sessions for the user (newest first)
    const rows = await db
      .select()
      .from(sessionchattable)
      .where(eq(sessionchattable.createdBy, user))
      .orderBy(desc(sessionchattable.createdAt))
      .limit(20);

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('[session-chats] GET error', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
