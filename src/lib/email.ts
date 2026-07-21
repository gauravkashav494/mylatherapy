/**
 * Email — port of bsq-quiz-backend.php's wp_mail admin/visitor emails, sent via
 * SMTP (nodemailer). If SMTP env vars are blank, emails are skipped and logged
 * (the GHL webhook still fires), so the quiz works with or without SMTP.
 *
 * NOTE: the delayed abandon-reminder (wp-cron "send after 2 min unless the
 * visitor finishes") has no serverless equivalent without Vercel Cron + a
 * persistent store. It is intentionally NOT implemented here; the GHL webhook
 * receives the partial capture and your GHL workflow handles that nurture.
 * The `reminder` email template below is kept so a future Cron endpoint can use it.
 */
import nodemailer from 'nodemailer';
import { riskLevel, riskPrefix, type Payload } from './ghl';

function env(key: string, def = ''): string {
  const fromProc = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  const fromMeta = (import.meta as any).env ? (import.meta as any).env[key] : undefined;
  const v = fromProc ?? fromMeta;
  return (v === undefined || v === null || v === '') ? def : String(v);
}

const MAIL = {
  host: env('SMTP_HOST'),
  port: parseInt(env('SMTP_PORT', '587'), 10),
  secure: env('SMTP_SECURE', 'false') === 'true',
  user: env('SMTP_USER'),
  pass: env('SMTP_PASS'),
  fromEmail: env('MAIL_FROM_EMAIL', 'noreply@mylatherapy.com'),
  fromName: env('MAIL_FROM_NAME', 'My LA Therapy'),
  admins: env('ADMIN_EMAILS', 'hi@mylatherapy.com').split(',').map((s) => s.trim()).filter(Boolean),
  slotMinutes: parseInt(env('GHL_SLOT_MINUTES', '45'), 10),
};

function mailConfigured(): boolean {
  return !!(MAIL.host && MAIL.user && MAIL.pass);
}

let _tx: nodemailer.Transporter | null = null;
function transport(): nodemailer.Transporter {
  if (!_tx) {
    _tx = nodemailer.createTransport({
      host: MAIL.host,
      port: MAIL.port,
      secure: MAIL.secure,
      auth: { user: MAIL.user, pass: MAIL.pass },
    });
  }
  return _tx;
}

async function send(
  to: string | string[],
  subject: string,
  opts: { html?: string; text?: string; urgent?: boolean }
): Promise<boolean> {
  if (!mailConfigured()) {
    console.warn('[quiz] SMTP not configured — email skipped: ' + subject);
    return false;
  }
  try {
    await transport().sendMail({
      from: `${MAIL.fromName} <${MAIL.fromEmail}>`,
      to,
      subject,
      html: opts.html,
      text: opts.text,
      priority: opts.urgent ? 'high' : 'normal',
    });
    return true;
  } catch (e) {
    console.error('[quiz] email failed: ' + subject, e);
    return false;
  }
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmt(slot: string, tz: string, opts: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(new Date(slot));
  } catch { return ''; }
}

/* ---------------- ADMIN EMAIL (port of bsq2_send_admin_email) ---------------- */

export async function sendAdminEmail(data: Payload, type: 'complete' | 'partial' | 'booked' = 'complete'): Promise<boolean> {
  const name = ((data.firstName || '') + ' ' + (data.lastName || '')).trim();
  const flag = riskPrefix(data);
  const level = riskLevel(data);
  const tz = data.timezone || 'America/Los_Angeles';

  let screening = '\n--- Screening ---\n';
  screening += 'Flagged items  : ' + (data.clinicalFlags || '—') + '\n';
  if (data.clinicalDetails) screening += 'Their notes    :\n' + data.clinicalDetails + '\n';
  screening += 'Risk history   : ' + (data.riskHistory || '—') + '\n';
  if (data.riskDetails) screening += 'Risk notes     :\n' + data.riskDetails + '\n';
  if (level === 'urgent') screening += '\n*** This person indicated recent or current suicidal intent. Reach out first. ***\n';

  let subject: string;
  let body: string;

  if (type === 'partial') {
    subject = flag + 'New Lead (In progress) — Therapist Matching Quiz';
    body  = 'A visitor started the matching quiz but did not finish:\n\n';
    body += 'Match method  : ' + (data.matchMethod || '') + '\n';
    body += 'Name          : ' + name + '\n';
    body += 'Email         : ' + (data.email || '') + '\n';
    body += 'Concerns      : ' + (data.concerns || '') + '\n';
    body += 'Location      : ' + (data.location || '') + '\n';
    body += 'Therapist fit : ' + (data.therapistFit || '') + '\n';
    body += 'Pronouns      : ' + (data.pronouns || '') + '\n';
    body += 'Age           : ' + (data.age || '') + '\n';
    body += 'Days          : ' + (data.days || '') + '\n';
    body += 'Times         : ' + (data.times || '') + '\n';
    body += 'Page          : ' + (data.pageUrl || '') + '\n';
    body += 'Captured at   : ' + (data.capturedAt || '') + '\n';
    if (data.clinicalFlags || data.riskHistory) body += screening;
    body += '\nThis is a partial submission — the visitor may still complete the quiz.\n';
  } else if (type === 'booked') {
    subject = flag + 'New Call Booked — Therapist Matching Quiz';
    const when = data.slot ? fmt(data.slot, tz, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : '';
    body  = 'A visitor booked a matching call:\n\n';
    body += 'When           : ' + when + '\n';
    body += 'Name           : ' + name + '\n';
    body += 'Email          : ' + (data.email || '') + '\n';
    body += 'Concerns       : ' + (data.concerns || '') + '\n';
    body += 'Location       : ' + (data.location || '') + '\n';
    body += 'Appointment ID : ' + (data.appointmentId || '') + '\n';
    body += 'Contact ID     : ' + (data.contactId || '') + '\n';
    body += 'Page           : ' + (data.pageUrl || '') + '\n';
    if (data.clinicalFlags || data.riskHistory) body += screening;
  } else {
    subject = flag + 'New Completed Submission — Therapist Matching Quiz';
    body = 'A visitor completed the matching quiz:\n\n';
    if (level === 'urgent') body += '*** This person indicated recent or current suicidal intent. Reach out first. ***\n\n';
    for (const k of Object.keys(data)) {
      let v: any = data[k];
      if (Array.isArray(v)) v = v.join(', ');
      const label = k.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      body += label + ': ' + (v ?? '') + '\n';
    }
  }

  if (!MAIL.admins.length) { console.warn('[quiz] no admin recipients configured'); return false; }
  return send(MAIL.admins, subject, { text: body, urgent: level === 'urgent' });
}

/* ---------------- VISITOR EMAIL (port of bsq2_send_user_email) ---------------- */

function emailShell(eyebrow: string, heading: string, inner: string): string {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' + esc(heading) + '</title></head>'
    + '<body style="margin:0;padding:24px;background:#F6F1E9;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#221E1A;">'
    +   '<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E4DBCC;border-radius:20px;padding:34px;box-shadow:0 24px 60px -34px rgba(33,58,48,.4);">'
    +     '<p style="font-style:italic;color:#C2774B;margin:0 0 8px;font-size:15px;">' + esc(eyebrow) + '</p>'
    +     '<h1 style="font-family:Georgia,serif;font-weight:500;font-size:26px;color:#1f3a30;margin:0 0 14px;line-height:1.15;">' + heading + '</h1>'
    +     inner
    +     '<p style="font-size:12.5px;color:#8a8074;margin:22px 0 0;">Every therapist personally chosen by Brooke Sprowl, LCSW.</p>'
    +   '</div></body></html>';
}

function crisisBlock(): string {
  return '<div style="margin:20px 0 0;padding:16px 18px;background:#EAF0EA;border:1px solid #cfdccd;border-radius:14px;">'
    + '<p style="margin:0 0 5px;font-family:Georgia,serif;font-size:16px;color:#1f3a30;">You don&rsquo;t have to wait for us to reach out.</p>'
    + '<p style="margin:0;font-size:13px;line-height:1.55;color:#4a5c4f;">If things feel urgent before we speak, the 988 Suicide &amp; Crisis Lifeline is free, confidential, and open 24/7 &mdash; call or text <a href="tel:988" style="color:#1f3a30;font-weight:600;">988</a>. If you&rsquo;re in immediate danger, please call 911.</p>'
    + '</div>';
}

export async function sendUserEmail(data: Payload, type: 'confirm' | 'booked' | 'reminder' = 'confirm'): Promise<boolean> {
  const email = data.email || '';
  if (!email) return false;

  const name = esc(data.firstName ? data.firstName : 'there');
  const link = data.pageUrl ? data.pageUrl : 'https://mylatherapy.com/';
  const tz = data.timezone || 'America/Los_Angeles';
  const p = 'style="font-size:15px;line-height:1.6;color:#5C544B;margin:0 0 10px;"';
  const crisis = riskLevel(data) === 'urgent' ? crisisBlock() : '';

  let subject: string;
  let message: string;

  if (type === 'reminder') {
    subject = 'Finish your match — your therapist is one step away';
    const inner = '<p ' + p + '>Hi ' + name + ',</p>'
      + '<p ' + p + '>You started your therapist match but didn&rsquo;t quite finish. It only takes a minute &mdash; once it&rsquo;s done, a real person on our team hand-selects the right therapist for you.</p>'
      + '<p style="text-align:center;margin:26px 0 6px;"><a href="' + esc(link) + '" style="display:inline-block;background:#C2774B;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;">Finish my match</a></p>'
      + crisis;
    message = emailShell('Hand-matched, on us', 'You&rsquo;re one step from your match.', inner);
  } else if (type === 'booked') {
    const when = data.slot ? fmt(data.slot, tz, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : '';
    subject = 'Your call is booked' + (when ? ' — ' + when : '');
    const inner = '<p ' + p + '>Hi ' + name + ',</p>'
      + '<p ' + p + '>You&rsquo;re on the calendar for a free ' + MAIL.slotMinutes + '-minute matching call.</p>'
      + '<p style="margin:18px 0;padding:16px 18px;background:#EAF0EA;border:1px solid #d4e0d2;border-radius:14px;font-family:Georgia,serif;font-size:18px;color:#1f3a30;">' + esc(when) + '</p>'
      + '<p ' + p + '>We&rsquo;ll come to the call already knowing your details &mdash; and you&rsquo;ll leave it matched. Need to move it? Just reply to this email.</p>'
      + crisis;
    message = emailShell('Your free consult', 'Your call is booked.', inner);
  } else {
    subject = "You're all set — we're finding your match";
    const inner = '<p ' + p + '>Hi ' + name + ',</p>'
      + '<p ' + p + '>Thank you &mdash; we&rsquo;ve got everything we need. A real person on our team is reviewing your details now and will hand-select the right therapist for you, usually within 24&ndash;48 hours.</p>'
      + '<p ' + p + '>Keep an eye on your inbox &mdash; we&rsquo;ll email you as soon as your match is ready.</p>'
      + crisis;
    message = emailShell('All set', 'We&rsquo;re finding your match.', inner);
  }

  return send(email, subject, { html: message });
}
