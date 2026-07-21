/**
 * POST /api/free-slots — port of bsq2_handle_free_slots().
 * Body: { month: "YYYY-MM", timezone? }
 * Returns the WP-style shape { success, data:{ dates, timezone } } so the
 * frontend JS works unchanged.
 */
import type { APIRoute } from 'astro';
import { GHL, configured, ghlApi, tz as getTz } from '../../lib/ghl';

export const prerender = false;

function ok(data: any) {
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
function fail(message: string, code = 500) {
  return new Response(JSON.stringify({ success: false, data: { message, code } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

/** Wall-clock parts of an instant, as seen in `tz`. */
function tzParts(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(date).reduce((a: any, p) => { a[p.type] = p.value; return a; }, {});
  let h = parseInt(parts.hour, 10); if (h === 24) h = 0;
  return { y: +parts.year, mo: +parts.month, d: +parts.day, h, mi: +parts.minute, s: +parts.second };
}

/** UTC epoch ms for a wall-clock time (y,mo,d,h,mi,s) interpreted in `tz`. */
function wallToMs(y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string): number {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  const seen = tzParts(new Date(guess), tz);
  const seenMs = Date.UTC(seen.y, seen.mo - 1, seen.d, seen.h, seen.mi, seen.s);
  return guess - (seenMs - guess);
}

function daysInMonth(y: number, mo: number): number {
  return new Date(y, mo, 0).getDate(); // mo is 1-based; day 0 => last day of month mo
}

// Warm-instance slot cache (serverless equivalent of the 120s transient).
const cache = new Map<string, { at: number; data: Record<string, string[]> }>();
const CACHE_MS = 120000;

export const POST: APIRoute = async ({ request }) => {
  if (!configured()) return fail("The calendar isn't connected yet.", 500);

  let body: any;
  try { body = await request.json(); } catch { return fail('Invalid request.', 400); }

  const month = String(body.month || '');
  if (!/^\d{4}-\d{2}$/.test(month)) return fail('Invalid month.', 400);

  const tzid = await getTz();
  const now = new Date();
  const nowP = tzParts(now, tzid);

  // month floor / ceiling, computed at 00:00 so the clock never rides along
  // (this is the "July bug" fix from the PHP — compare dates, not datetimes).
  const monthFloor = wallToMs(nowP.y, nowP.mo, 1, 0, 0, 0, tzid);
  let cy = nowP.y, cmo = nowP.mo + GHL.maxMonths;
  while (cmo > 12) { cmo -= 12; cy++; }
  const ceiling = wallToMs(cy, cmo, 1, 0, 0, 0, tzid);

  const [Y, M] = month.split('-').map(Number);
  const first = wallToMs(Y, M, 1, 0, 0, 0, tzid);
  if (first > ceiling || first < monthFloor) {
    return ok({ dates: {}, timezone: tzid });
  }

  let start = first;
  const end = wallToMs(Y, M, daysInMonth(Y, M), 23, 59, 59, tzid);
  const earliest = now.getTime() + GHL.minNotice * 60000;
  if (start < earliest) start = earliest;
  if (start > end) return ok({ dates: {}, timezone: tzid });

  const ckey = GHL.calendarId + '|' + month + '|' + tzid;
  const cached = cache.get(ckey);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return ok({ dates: cached.data, timezone: tzid, cached: true });
  }

  const res = await ghlApi(
    'GET',
    '/calendars/' + encodeURIComponent(GHL.calendarId) + '/free-slots',
    GHL.verCalendar,
    null,
    { startDate: String(start), endDate: String(end), timezone: tzid }
  );

  if (res.error) return fail("We couldn't load open times just now.", 502);
  if (res.code >= 400) {
    const msg = (res.code === 401 || res.code === 403)
      ? 'The calendar connection needs re-authorizing.'
      : "We couldn't load open times just now.";
    return fail(msg, res.code);
  }

  const dates: Record<string, string[]> = {};
  const cutoff = earliest;
  for (const key of Object.keys(res.body)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue; // skips traceId etc.
    const value = res.body[key];
    let slots: any[] = Array.isArray(value?.slots) ? value.slots : (Array.isArray(value) ? value : []);
    const keep: string[] = [];
    for (const slot of slots) {
      if (typeof slot !== 'string') continue;
      const ts = Date.parse(slot);
      if (ts && ts >= cutoff) keep.push(slot);
    }
    if (keep.length) dates[key] = keep;
  }

  cache.set(ckey, { at: Date.now(), data: dates });
  return ok({ dates, timezone: tzid });
};
