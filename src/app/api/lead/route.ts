import { NextResponse } from 'next/server';
import { leadSchema } from '@/lib/lead';

export const runtime = 'nodejs';

// In-memory limiter (acceptable for v1): 5 requests / 10 min / IP.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = 5;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQ) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { _: ['Invalid JSON'] } }, { status: 400 });
  }

  // Honeypot: bots fill `company`. Pretend success and drop.
  if (typeof body === 'object' && body && typeof (body as { company?: unknown }).company === 'string' && (body as { company: string }).company.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? '_');
      (errors[k] ??= []).push(issue.message);
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const { company: _company, ...lead } = parsed.data;
  void _company;
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    console.info('[lead]', JSON.stringify(lead));
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: 'Webhook failed' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Webhook failed' }, { status: 502 });
  }
}
