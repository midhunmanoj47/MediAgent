import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const VAPI_API_KEY = process.env.VAPI_API_KEY || "YOUR_VAPI_API_KEY";
  const body = await req.json();

  const vapiRes = await fetch('https://api.vapi.ai/call/web', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VAPI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await vapiRes.json();
  return NextResponse.json(data, { status: vapiRes.status });
}

export const dynamic = 'force-dynamic'; 