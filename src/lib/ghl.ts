/**
 * GoHighLevel backend — port of bsq-quiz-backend.php's GHL layer.
 * Config comes from env (process.env at runtime on Vercel, import.meta.env in dev).
 * Keeps the same behaviour: dynamic timezone resolution, source labels, risk
 * triage, and the outbound webhook.
 */

function env(key: string, def = ''): string {
  const fromProc = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  const fromMeta = (import.meta as any).env ? (import.meta as any).env[key] : undefined;
  const v = fromProc ?? fromMeta;
  return (v === undefined || v === null || v === '') ? def : String(v);
}

export const GHL = {
  token:          env('GHL_TOKEN'),
  locationId:     env('GHL_LOCATION_ID'),
  calendarId:     env('GHL_CALENDAR_ID'),
  webhook:        env('GHL_WEBHOOK'),
  tzFallback:     env('GHL_TIMEZONE', 'America/Los_Angeles'),
  slotMinutes:    parseInt(env('GHL_SLOT_MINUTES', '45'), 10),
  assignedUserId: env('GHL_ASSIGNED_USER_ID'),
  minNotice:      parseInt(env('GHL_MIN_NOTICE_MINUTES', '60'), 10),
  maxMonths:      parseInt(env('GHL_MAX_MONTHS_AHEAD', '3'), 10),
  apiBase:        'https://services.leadconnectorhq.com',
  verCalendar:    '2021-04-15',
  verContact:     '2021-07-28',
  verLocation:    '2021-07-28',
  httpTimeout:    15000,
};

export type Payload = Record<string, any>;
type ApiResult = { code: number; body: any; error?: string };

/** Mirror of bsq2_configured(). */
export function configured(): boolean {
  return !!(GHL.token && !GHL.token.includes('PASTE_YOUR') && GHL.locationId && GHL.calendarId);
}

/** Mirror of bsq2_api() — fetch with auth + version headers, tolerant JSON parse. */
export async function ghlApi(
  method: string,
  path: string,
  version: string,
  body: any = null,
  query: Record<string, string> | null = null
): Promise<ApiResult> {
  let url = GHL.apiBase + path;
  if (query) {
    const qs = new URLSearchParams(query).toString();
    url += (url.includes('?') ? '&' : '?') + qs;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GHL.httpTimeout);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: 'Bearer ' + GHL.token,
        Version: version,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body !== null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const raw = await res.text();
    let json: any = {};
    try { json = raw ? JSON.parse(raw) : {}; } catch { json = {}; }
    if (res.status >= 400) console.error('[quiz] GHL ' + res.status + ' on ' + path + ': ' + raw.slice(0, 500));
    return { code: res.status, body: (json && typeof json === 'object') ? json : {} };
  } catch (e: any) {
    console.error('[quiz] GHL transport error on ' + path + ': ' + (e?.message || e));
    return { code: 0, body: {}, error: String(e?.message || e) };
  } finally {
    clearTimeout(timer);
  }
}

/** Only accept real IANA identifiers (Region/City), never fixed offsets. */
export function validTz(tz: any): boolean {
  if (typeof tz !== 'string' || !tz || !tz.includes('/')) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; }
}

/** Calendar tz first, then sub-account tz — mirror of bsq2_resolve_tz(). */
async function resolveTz(): Promise<string> {
  if (!configured()) return '';

  const c = await ghlApi('GET', '/calendars/' + encodeURIComponent(GHL.calendarId), GHL.verCalendar);
  if (!c.error && c.code < 400) {
    const cal = c.body.calendar || c.body;
    for (const k of ['timezone', 'timeZone', 'calendarTimezone']) {
      if (cal?.[k] && validTz(cal[k])) return cal[k];
    }
  }

  const l = await ghlApi('GET', '/locations/' + encodeURIComponent(GHL.locationId), GHL.verLocation);
  if (!l.error && l.code < 400) {
    const loc = l.body.location || l.body;
    for (const k of ['timezone', 'timeZone']) {
      if (loc?.[k] && validTz(loc[k])) return loc[k];
    }
  } else if (!l.error && (l.code === 401 || l.code === 403)) {
    console.warn('[quiz] tz: /locations ' + l.code + ' — token likely missing locations.readonly scope.');
  }
  return '';
}

// Warm-instance memo (serverless equivalent of the 12h transient).
let _tzMemo: string | null = null;
let _tzAt = 0;
export async function tz(): Promise<string> {
  const now = Date.now();
  if (_tzMemo && now - _tzAt < 12 * 3600 * 1000) return _tzMemo;
  let t = '';
  try { t = await resolveTz(); } catch { t = ''; }
  if (!validTz(t)) {
    t = GHL.tzFallback;
    console.warn('[quiz] tz: FALLBACK to constant — ' + t);
  }
  _tzMemo = t; _tzAt = now;
  return t;
}

/** Mirror of bsq2_source_label(). */
export function sourceLabel(payload: Payload): string {
  switch (payload.stage || '') {
    case 'call_booked':   return 'Website - Concierge Quiz (call booked)';
    case 'quiz_complete': return 'Website - Concierge Quiz (matched)';
    case 'lead_capture':  return 'Website - Concierge Quiz (in progress)';
    default:              return 'Website - Concierge Quiz';
  }
}

/** Mirror of bsq2_risk_level(): '' | 'disclosed' | 'urgent'. */
export function riskLevel(data: Payload): '' | 'disclosed' | 'urgent' {
  const risk = String(data.riskHistory || '').trim();
  if (!risk) return '';
  if (risk.toLowerCase().indexOf('yes') !== 0) return '';
  const low = risk.toLowerCase();
  if (low.includes('past month') || low.includes('right now')) return 'urgent';
  return 'disclosed';
}

/** Mirror of bsq2_risk_prefix(). */
export function riskPrefix(data: Payload): string {
  switch (riskLevel(data)) {
    case 'urgent':    return '[URGENT — REVIEW FIRST] ';
    case 'disclosed': return '[Risk history disclosed] ';
    default:          return '';
  }
}

/** Mirror of bsq2_send_to_ghl(): stamp source, POST the webhook. */
export async function sendToGhl(payload: Payload): Promise<boolean> {
  if (!payload.source) payload.source = sourceLabel(payload);
  if (!GHL.webhook) { console.warn('[quiz] GHL webhook not configured.'); return false; }
  try {
    const res = await fetch(GHL.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('[quiz] GHL webhook ' + res.status);
    return res.ok;
  } catch (e: any) {
    console.error('[quiz] GHL webhook error: ' + (e?.message || e));
    return false;
  }
}
