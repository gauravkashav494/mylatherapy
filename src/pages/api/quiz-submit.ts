/**
 * POST /api/quiz-submit — port of bsq2_handle_submit().
 * Body: { step: "partial" | "complete", payload, isUpdate? }
 *  - partial : fire the GHL webhook (lead capture). The delayed abandon-reminder
 *              is handled by GHL, not here (no serverless cron). See lib/email.ts.
 *  - complete: fire the webhook + send admin + visitor confirmation emails.
 */
import type { APIRoute } from 'astro';
import { sendToGhl, type Payload } from '../../lib/ghl';
import { sendAdminEmail, sendUserEmail } from '../../lib/email';

export const prerender = false;

function ok(data: any) {
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
function fail(message: string, code = 500) {
  return new Response(JSON.stringify({ success: false, data: { message, code } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function parsePayload(raw: any): Payload | null {
  if (!raw) return null;
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return null; } }
  return typeof raw === 'object' ? raw : null;
}

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return fail('Invalid payload.', 400); }

  const step = String(body.step || 'complete');
  const payload = parsePayload(body.payload);
  if (!payload) return fail('Invalid payload.', 400);

  if (step === 'partial') {
    if (!payload.email || !/^\S+@\S+\.\S+$/.test(payload.email)) return fail('A valid email is required.', 422);
    await sendToGhl(payload);
    return ok({ stage: 'partial' });
  }

  await sendToGhl(payload);
  await sendAdminEmail(payload, 'complete');
  await sendUserEmail(payload, 'confirm');
  return ok({ stage: 'complete' });
};
