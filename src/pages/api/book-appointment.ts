/**
 * POST /api/book-appointment — port of bsq2_handle_book().
 * Body: { slot, timezone?, payload }
 * Upserts the GHL contact, creates the appointment, then fires the webhook +
 * admin/visitor emails before responding (serverless can't defer past response).
 */
import type { APIRoute } from 'astro';
import { GHL, configured, ghlApi, tz as getTz, sourceLabel, riskLevel, sendToGhl, type Payload } from '../../lib/ghl';
import { sendAdminEmail, sendUserEmail } from '../../lib/email';

export const prerender = false;

function ok(data: any) {
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
function fail(message: string, code = 500) {
  return new Response(JSON.stringify({ success: false, data: { message, code } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function parsePayload(raw: any): Payload {
  if (!raw) return {};
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return {}; } }
  return raw;
}

export const POST: APIRoute = async ({ request }) => {
  if (!configured()) return fail("The calendar isn't connected yet.", 500);

  let body: any;
  try { body = await request.json(); } catch { return fail('Invalid request.', 400); }

  const payload = parsePayload(body.payload);
  const slot = String(body.slot || '');

  if (!payload.email || !/^\S+@\S+\.\S+$/.test(payload.email)) return fail('A valid email is required.', 422);
  if (!slot || isNaN(Date.parse(slot))) return fail('Pick a time first.', 400);

  const tzid = await getTz();
  const start = new Date(slot);
  const end = new Date(start.getTime() + GHL.slotMinutes * 60000);
  if (start.getTime() < Date.now()) return fail('That time has passed. Pick another.', 409);

  /* ---------- 1. Upsert the contact ---------- */
  const tags = ['concierge-quiz', 'booked-call'];
  const risk = riskLevel(payload);
  if (risk === 'urgent') tags.push('risk-urgent');
  else if (risk === 'disclosed') tags.push('risk-disclosed');

  const contactBody: any = {
    locationId: GHL.locationId,
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    name: ((payload.firstName || '') + ' ' + (payload.lastName || '')).trim(),
    email: payload.email,
    timezone: tzid,
    source: sourceLabel({ stage: 'call_booked' }),
    tags,
  };
  if (payload.pageUrl) contactBody.website = payload.pageUrl;

  const c = await ghlApi('POST', '/contacts/upsert', GHL.verContact, contactBody);
  if (c.error || c.code >= 400) return fail("We couldn't save your details. Try again in a moment.", 502);

  const contactId = c.body?.contact?.id || c.body?.id || c.body?.contact?.contactId || '';
  if (!contactId) return fail("We couldn't save your details. Try again in a moment.", 502);

  /* ---------- 2. Create the appointment ---------- */
  const apptBody: any = {
    calendarId: GHL.calendarId,
    locationId: GHL.locationId,
    contactId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    title: 'Matching call — ' + ((payload.firstName || '') + ' ' + (payload.lastName || '')).trim(),
    appointmentStatus: 'confirmed',
    ignoreDateRange: false,
    toNotify: true,
  };
  if (GHL.assignedUserId) apptBody.assignedUserId = GHL.assignedUserId;

  const a = await ghlApi('POST', '/calendars/events/appointments', GHL.verCalendar, apptBody);
  if (a.error || a.code >= 400) return fail("That time was just taken. Pick another and we'll lock it in.", 409);

  const appointmentId = a.body?.id || a.body?.appointment?.id || '';

  /* ---------- 3. Attribution + webhook + emails ---------- */
  payload.stage = 'call_booked';
  payload.matchMethod = 'call';
  payload.slot = start.toISOString();
  payload.appointmentId = appointmentId;
  payload.contactId = contactId;
  payload.timezone = tzid;

  await sendToGhl(payload);
  await sendAdminEmail(payload, 'booked');
  await sendUserEmail(payload, 'booked');

  return ok({ stage: 'call_booked', appointmentId, startTime: payload.slot, timezone: tzid });
};
