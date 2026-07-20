import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

/* ==========================================================================
 * QuizForm — faithful rebuild of the mylatherapy.com/test-quiz "bsq" app.
 * Proof band + a two-column card (constant green rail / changing cream field)
 * that moves through: capture → path fork → (book-a-call calendar | 6-question
 * quiz) → confirmation. All markup uses the site's own .bsq class names and the
 * ported .bsq stylesheet, so it matches the live design 1:1.
 * ======================================================================== */

type Screen = 'capture' | 'path' | 'call' | 'quiz' | 'done';

const CONCERNS = ['Anxiety', 'Depression', 'Trauma', 'Relationships', 'Couples', 'Child/Teen', 'Family', 'Other'];
const LOCATIONS = ['Santa Monica', 'West LA', 'Beverly Hills', 'Encino', 'Studio City', 'Pasadena', 'Echo Park', 'Online (anywhere in CA)'];

const Q1 = [
  ['Someone who gently challenges me', 'Insight plus accountability — not just a sounding board.'],
  ['A warm, steady presence', 'Feeling safe and unhurried matters most right now.'],
  ["Deep expertise in what I'm facing", 'Specialized training in my specific concern.'],
  ['Practical tools & between-session work', 'Homework, frameworks, things to try in real life.'],
  ['Shared identity or lived experience', 'Someone who gets my background without explaining.'],
];
const SUPPORT = ['Anxiety', 'Depression', 'Trauma', 'Communication', 'Couples', 'Grief and loss', 'Anger', 'Self-esteem', 'Other'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];
const PRONOUNS = ['She/Her', 'He/Him', 'They/Them', 'Other'];
const FOCUS = ['Quality of life', 'Healthier relationships', 'Feeling proud of myself', 'Better communication', 'Decreasing anxiety', 'Improving mood', 'Feeling confident', 'Healthy boundaries', 'Managing feelings'];
const FLAGS: [string, string][] = [
  ['My relationship with alcohol or other substances has been hard to manage', 'alcohol or other substances have been hard to manage'],
  ["I've hurt myself on purpose", 'hurting yourself on purpose'],
  ["I've had experiences other people didn't seem to share — like hearing or seeing things others couldn't", "experiences others didn't seem to share"],
  ['There have been times when anger or conflict led to someone getting hurt, or to legal trouble', 'anger or conflict leading to harm or legal trouble'],
  ["I've contacted someone after they asked me not to, or kept track of where they are without them knowing", "contacting or tracking someone who didn't want it"],
];
const FLAG_NONE = 'None of these apply';
const RISK: { v: string; urgent?: boolean }[] = [
  { v: 'No' },
  { v: 'Yes, but more than a year ago' },
  { v: 'Yes, within the past year' },
  { v: 'Yes, within the past month', urgent: true },
  { v: "Yes, this is how I'm feeling right now", urgent: true },
];

const STARS = '★★★★★';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SLOT_TIMES = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'];

export default function QuizForm() {
  const [screen, setScreen] = useState<Screen>('capture');
  const [q, setQ] = useState(1);
  const [booked, setBooked] = useState(false);

  // capture
  const [first, setFirst] = useState('');
  const [email, setEmail] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  // quiz
  const [fit, setFit] = useState<string[]>([]);
  const [support, setSupport] = useState<string[]>([]);
  const [motivation, setMotivation] = useState<number | null>(null);
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [pronouns, setPronouns] = useState<string[]>([]);
  const [age, setAge] = useState('');
  const [firstTime, setFirstTime] = useState('');
  const [focus, setFocus] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [flags, setFlags] = useState<string[]>([]);
  const [risk, setRisk] = useState('');
  // calendar
  const now = useMemo(() => new Date(), []);
  const [calMonth, setCalMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState('');

  const [err, setErr] = useState('');

  const name = first.trim() || 'there';
  const riskUrgent = RISK.find((r) => r.v === risk)?.urgent;

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const go = (s: Screen) => { setErr(''); setScreen(s); };

  /* ---------------- CAPTURE ---------------- */
  const captureNext = () => {
    if (!first.trim()) return setErr('Please add your first name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setErr('Please enter a valid email.');
    if (concerns.length === 0) return setErr("Please choose at least one thing that's bringing you in.");
    go('path');
  };

  /* ---------------- QUIZ ---------------- */
  const quizNext = () => {
    if (q === 3 && !firstTime) return setErr('Please let us know if this is your first time in therapy.');
    if (q === 4 && !contactMethod) return setErr('Please tell us how to reach you.');
    if (q === 5 && flags.length === 0) return setErr('Please pick one — or choose “None of these apply.”');
    if (q === 6 && !risk) return setErr('Please choose the option that fits best.');
    setErr('');
    if (q < 6) { setQ(q + 1); return; }
    setBooked(false); go('done');
  };
  const quizBack = () => { setErr(''); if (q > 1) setQ(q - 1); else go('path'); };

  const toggleFlag = (v: string) => {
    if (v === FLAG_NONE) setFlags(flags.includes(v) ? [] : [FLAG_NONE]);
    else setFlags(flags.includes(v) ? flags.filter((x) => x !== v) : [...flags.filter((x) => x !== FLAG_NONE), v]);
  };

  /* ---------------- CALENDAR ---------------- */
  const dayOpen = (d: Date) => {
    const dow = d.getDay();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return dow >= 1 && dow <= 5 && d > t; // weekdays, future
  };
  const confirmCall = () => {
    if (!selDay || !slot) return setErr('Please pick a date and time.');
    setErr(''); setBooked(true); go('done');
  };
  const whenText = selDay
    ? `${DAYS[selDay.getDay()]}, ${MONTHS[selDay.getMonth()].slice(0, 3)} ${selDay.getDate()} at ${slot}`
    : '';

  /* ---------------- RAIL ---------------- */
  const Testi = ({ quote, cite }: { quote: string; cite: string }) => (
    <div className="bsq-testi">
      <div className="bsq-testi-stars">{STARS}</div>
      <blockquote>{quote}</blockquote>
      <cite>— {cite}</cite>
    </div>
  );
  const Thanks = () => (
    <div className="bsq-thanks"><i>✓</i><span>Thanks, <b>{name}</b> — your details are in.</span></div>
  );
  const Ticks = ({ n }: { n: number }) => (
    <div className="bsq-ticks">{Array.from({ length: n }).map((_, i) => <i key={i} />)}</div>
  );

  const rail = (): ReactNode => {
    if (screen === 'capture') return (
      <div className="bsq-rail">
        <div className="bsq-rail-mid">
          <div className="bsq-rail-eyebrow">Hand-matched, on us</div>
          <h3>Stop searching. We’ll do it for you.</h3>
          <div className="bsq-steps">
            <div className="bsq-step"><span>1</span><div><b>You share what’s going on</b><em>A few details — that’s this form.</em></div></div>
            <div className="bsq-step"><span>2</span><div><b>We hand-match you</b><em>To the specialist who fits — usually same day.</em></div></div>
            <div className="bsq-step"><span>3</span><div><b>You meet, and decide</b><em>Love your therapist, or your money back.</em></div></div>
          </div>
        </div>
        <Testi quote="“I was in therapy on and off for 20 years. Brooke did more in one session than years of work with my previous therapists.”" cite="Client, Santa Monica" />
      </div>
    );
    if (screen === 'path') return (
      <div className="bsq-rail">
        <Ticks n={2} /><Thanks />
        <div className="bsq-rail-eyebrow">One last thing</div>
        <h3>You’re one step from your match.</h3>
        <p>Either way, a real person reviews your details and hand-selects your therapist — guaranteed.</p>
        <Testi quote="“Brooke has the true gift of insight and compassion — getting straight to the heart of your blind spots in a way that’s truly changed my life.”" cite="Client, Santa Monica" />
      </div>
    );
    if (screen === 'call') return (
      <div className="bsq-rail">
        <Ticks n={1} />
        <div className="bsq-rail-eyebrow">Your free consult</div>
        <h3>Let’s get you on the calendar.</h3>
        <p>A real 30-minute conversation to understand exactly what you’re working through — so we can match you with a therapist who specializes in your concerns and fits your schedule, your style, and your life.</p>
        <Testi quote="“You did more in 45 minutes than my last therapist did in a year!”" cite="D.L., Hollywood Hills" />
      </div>
    );
    if (screen === 'quiz') return (
      <div className="bsq-rail">
        <Ticks n={1} />
        <div className="bsq-rail-eyebrow">Two minutes, tops</div>
        <h3>A few questions to find your fit.</h3>
        <p>A few quick questions about what you’re facing and how you like to work — so we match you with a therapist who specializes in your concerns and fits your schedule, your style, and your life.</p>
        <Testi quote="“I felt very seen, understood, and supported — Brooke went right to the source of the issue while staying so gentle and kind.”" cite="J.R., Brentwood" />
      </div>
    );
    // done
    return (
      <div className="bsq-rail">
        <Ticks n={3} /><Thanks />
        <div className="bsq-rail-eyebrow">All set</div>
        <h3>{booked ? 'Your call is booked.' : 'We’re finding your match.'}</h3>
        <p>{booked
          ? 'We’ll come to the call already knowing your details — and you’ll leave it matched.'
          : 'A real person on our team is reviewing your details now and will hand-select the right therapist for you — usually within 24–48 hours.'}</p>
        <Testi quote="“Brooke has the true gift of insight and compassion — getting straight to the heart of your blind spots in a way that’s truly changed my life.”" cite="Client, Santa Monica" />
      </div>
    );
  };

  /* ---------------- PILL / CHOICE HELPERS ---------------- */
  const Pill = ({ v, arr, set, cls = '' }: { v: string; arr: string[]; set: (x: string[]) => void; cls?: string }) => (
    <label className={`bsq-pill${arr.includes(v) ? ' on' : ''} ${cls}`} onClick={(e) => { e.preventDefault(); toggle(arr, set, v); }}>{v}</label>
  );

  /* ---------------- FIELD ---------------- */
  const field = (): ReactNode => {
    if (screen === 'capture') return (
      <div className="bsq-field">
        <h3>Let’s find your perfect match.</h3>
        <div className="bsq-trust"><i>✓</i><span>Every therapist trained by our founder&nbsp;<b>Brooke Sprowl, LCSW</b> <span className="sep">·</span> 20 years in practice</span></div>
        <div className="bsq-row">
          <div><label className="bsq-label">First name *</label><input type="text" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" autoComplete="given-name" /></div>
          <div><label className="bsq-label">Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" /></div>
        </div>
        <div className="bsq-group-label">What’s bringing you in? *</div>
        <div className="bsq-pills">{CONCERNS.map((c) => <Pill key={c} v={c} arr={concerns} set={setConcerns} />)}</div>
        <div style={{ marginBottom: 24 }}>
          <div className="bsq-group-label">Preferred location</div>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Choose a location…</option>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        {err && <p className="bsq-err standalone show">{err}</p>}
        <button type="button" className="bsq-cta" onClick={captureNext}>Continue →</button>
        <div className="bsq-micro">Free &amp; confidential · Love your therapist or your money back · 6,500+ matched</div>
      </div>
    );

    if (screen === 'path') return (
      <div className="bsq-field">
        <h3>How would you like to get matched?</h3>
        <p className="bsq-lede">Both are free. Most people are matched within 24–48 hours.</p>
        <div className="bsq-paths">
          <button type="button" className="bsq-path primary" onClick={() => go('call')}>
            <span className="bsq-path-icon">📅</span>
            <span className="bsq-path-body">
              <span className="bsq-path-top"><b>Talk it through</b><span className="bsq-badge">Most popular</span></span>
              <p>Book a free 30-min call. We get to know you and guide you to the right specialist.</p>
              <small>Best if you’d like a person to walk you through it.</small>
            </span>
            <span className="bsq-path-arrow">→</span>
          </button>
          <button type="button" className="bsq-path" onClick={() => { setQ(1); go('quiz'); }}>
            <span className="bsq-path-icon warm">✦</span>
            <span className="bsq-path-body">
              <span className="bsq-path-top"><b>Match me now</b></span>
              <p>Answer a few more questions and we’ll hand-select your match — no call needed.</p>
              <small>Best if you’d rather start on your own.</small>
            </span>
            <span className="bsq-path-arrow">→</span>
          </button>
        </div>
        <div className="bsq-micro">Not sure? <b onClick={() => go('call')}>Start with a call</b> — you can always switch.</div>
      </div>
    );

    if (screen === 'call') {
      const y = calMonth.getFullYear(), m = calMonth.getMonth();
      const firstDow = new Date(y, m, 1).getDay();
      const daysIn = new Date(y, m + 1, 0).getDate();
      const cells: (Date | null)[] = [];
      for (let i = 0; i < firstDow; i++) cells.push(null);
      for (let d = 1; d <= daysIn; d++) cells.push(new Date(y, m, d));
      const prevDisabled = y === now.getFullYear() && m === now.getMonth();
      const isSel = (d: Date) => selDay && d.toDateString() === selDay.toDateString();
      return (
        <div className="bsq-field">
          <h3>Book your free 30-minute call.</h3>
          <p className="bsq-lede">Pick a day and time — we’ll hand-match you by the end of the call.</p>
          <div className="bsq-cal-grid">
            <div>
              <div className="bsq-cal-cap">Choose a date</div>
              <div className="bsq-cal">
                <div className="bsq-cal-head">
                  <span className="bsq-cal-month">{MONTHS[m]} {y}</span>
                  <span className="bsq-cal-nav">
                    <button type="button" disabled={prevDisabled} onClick={() => setCalMonth(new Date(y, m - 1, 1))} aria-label="Previous month">‹</button>
                    <button type="button" onClick={() => setCalMonth(new Date(y, m + 1, 1))} aria-label="Next month">›</button>
                  </span>
                </div>
                <div className="bsq-cal-days">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="bsq-dow">{d}</div>)}
                  {cells.map((d, i) => {
                    if (!d) return <div key={i} className="bsq-day" />;
                    const open = dayOpen(d);
                    return <div key={i} className={`bsq-day${open ? ' open' : ''}${isSel(d) ? ' on' : ''}`} onClick={() => { if (open) { setSelDay(d); setSlot(''); } }}>{d.getDate()}</div>;
                  })}
                </div>
              </div>
            </div>
            <div>
              <div className="bsq-cal-cap">{selDay ? `${MONTHS[selDay.getMonth()].slice(0, 3)} ${selDay.getDate()}` : 'Pick a date first'}</div>
              <div className="bsq-slots">
                {selDay
                  ? SLOT_TIMES.map((t) => <button type="button" key={t} className={`bsq-slot${slot === t ? ' on' : ''}`} onClick={() => setSlot(t)}>{t}</button>)
                  : <div className="bsq-cal-note">Select a highlighted day to see open times.</div>}
              </div>
            </div>
          </div>
          {err && <p className="bsq-err standalone show">{err}</p>}
          <div className="bsq-actions">
            <button type="button" className="bsq-back" onClick={() => go('path')}>← Back</button>
            <button type="button" className="bsq-cta" disabled={!selDay || !slot} onClick={confirmCall}>Confirm my call →</button>
          </div>
          <div className="bsq-micro">Free · 30 min · reschedule anytime</div>
        </div>
      );
    }

    if (screen === 'quiz') return (
      <div className="bsq-field">
        {/* Q1 */}
        {q === 1 && (<div className="bsq-q on">
          <div className="bsq-qmark">Question 1 of 6</div>
          <h3>What matters most to you in a therapist?</h3>
          <p className="bsq-lede">Choose any that resonate — it helps us pair you with the right person.</p>
          <div className="bsq-choices">
            {Q1.map(([t, d]) => (
              <label key={t} className={`bsq-choice${fit.includes(t) ? ' on' : ''}`} onClick={(e) => { e.preventDefault(); toggle(fit, setFit, t); }}>
                <span className="bsq-choice-box">✓</span><span><b>{t}</b><em>{d}</em></span>
              </label>
            ))}
          </div>
        </div>)}

        {/* Q2 */}
        {q === 2 && (<div className="bsq-q on">
          <div className="bsq-qmark">Question 2 of 6</div>
          <h3>What do you most need support with?</h3>
          <p className="bsq-lede">Pick any that apply, then tell us how ready you feel.</p>
          <div className="bsq-pills c3">{SUPPORT.map((s) => <Pill key={s} v={s} arr={support} set={setSupport} />)}</div>
          <div className="bsq-likert">
            <div className="bsq-group-label">How motivated do you feel to work on this?</div>
            <div className="bsq-scale">
              {Array.from({ length: 11 }).map((_, i) => (
                <label key={i} onClick={(e) => { e.preventDefault(); setMotivation(i); }}>
                  <span style={motivation === i ? { background: 'var(--terracotta)', borderColor: 'var(--terracotta)', color: '#fff' } : undefined}>{i}</span>
                </label>
              ))}
            </div>
            <div className="bsq-scale-caps"><span>Not at all</span><span>Somewhat</span><span>I’m ready for a change</span></div>
          </div>
        </div>)}

        {/* Q3 */}
        {q === 3 && (<div className="bsq-q on">
          <div className="bsq-qmark">Question 3 of 6</div>
          <h3>When can you meet?</h3>
          <p className="bsq-lede">So we only match you with therapists who have room for you.</p>
          <div className="bsq-group-label">Days you’re available</div>
          <div className="bsq-pills flow">{DAYS.map((d) => <Pill key={d} v={d} arr={days} set={setDays} />)}</div>
          <div className="bsq-group-label">Times that work best</div>
          <div className="bsq-pills c3">{TIMES.map((t) => <Pill key={t} v={t} arr={times} set={setTimes} />)}</div>
          <div className="bsq-group-label">Pronouns <span>(select any)</span></div>
          <div className="bsq-pills flow">{PRONOUNS.map((p) => <Pill key={p} v={p} arr={pronouns} set={setPronouns} />)}</div>
          <div className="bsq-row">
            <div><label className="bsq-label">Age</label><input type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Your age" /></div>
            <div>
              <span className="bsq-label">First time in therapy? *</span>
              <div className="bsq-radios" style={{ marginBottom: 0 }}>
                {['Yes', 'No'].map((v) => <label key={v} className={`bsq-radio${firstTime === v ? ' on' : ''}`} onClick={(e) => { e.preventDefault(); setFirstTime(v); }}>{v}</label>)}
              </div>
            </div>
          </div>
        </div>)}

        {/* Q4 */}
        {q === 4 && (<div className="bsq-q on">
          <div className="bsq-qmark">Question 4 of 6</div>
          <h3>What would you like to focus on?</h3>
          <p className="bsq-lede">Then just two more — and we start hand-picking your therapist.</p>
          <div className="bsq-pills c3">{FOCUS.map((f) => <Pill key={f} v={f} arr={focus} set={setFocus} />)}</div>
          <div className="bsq-row one">
            <div>
              <label className="bsq-label">Tell us more about what you need support with <span style={{ fontWeight: 400, color: 'var(--muted)', fontStyle: 'italic' }}>(optional)</span></label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Share as much or as little as you'd like…" />
            </div>
          </div>
          <div className="bsq-group-label">Should we email or call you back? *</div>
          <div className="bsq-radios">
            {['Email', 'Call'].map((v) => <label key={v} className={`bsq-radio${contactMethod === v ? ' on' : ''}`} onClick={(e) => { e.preventDefault(); setContactMethod(v); }}>{v}</label>)}
          </div>
        </div>)}

        {/* Q5 */}
        {q === 5 && (<div className="bsq-q on">
          <div className="bsq-qmark">Question 5 of 6</div>
          <h3>Do any of these feel true for you — now or at any point in the past?</h3>
          <p className="bsq-lede">Check any that apply. This stays confidential — it only helps us match you with someone properly trained for it. There are no wrong answers here.</p>
          <div className="bsq-choices tight">
            {FLAGS.map(([v]) => (
              <label key={v} className={`bsq-choice${flags.includes(v) ? ' on' : ''}`} onClick={(e) => { e.preventDefault(); toggleFlag(v); }}>
                <span className="bsq-choice-box">✓</span><span><b>{v}</b></span>
              </label>
            ))}
            <label className={`bsq-choice${flags.includes(FLAG_NONE) ? ' on' : ''}`} onClick={(e) => { e.preventDefault(); toggleFlag(FLAG_NONE); }}>
              <span className="bsq-choice-box">✓</span><span><b>{FLAG_NONE}</b></span>
            </label>
          </div>
          {FLAGS.filter(([v]) => flags.includes(v)).map(([v, short]) => (
            <div key={v} className="bsq-followup">
              <div className="bsq-followup-q">You mentioned <i>{short}</i>. Anything you’d like your therapist to know? <span style={{ fontWeight: 400 }}>(optional)</span></div>
              <textarea placeholder="Only if you'd like to share…" />
            </div>
          ))}
        </div>)}

        {/* Q6 */}
        {q === 6 && (<div className="bsq-q on">
          <div className="bsq-qmark">Question 6 of 6</div>
          <h3>Have you ever come close to acting on thoughts of ending your life — making a plan, or taking steps toward it?</h3>
          <p className="bsq-lede">We ask everyone. Answering honestly doesn’t disqualify you from anything — it just makes sure the therapist we pick is the right fit.</p>
          <div className="bsq-choices tight">
            {RISK.map(({ v }) => (
              <label key={v} className={`bsq-choice${risk === v ? ' on' : ''}`} onClick={(e) => { e.preventDefault(); setRisk(v); }}>
                <span className="bsq-choice-box round">✓</span><span><b>{v}</b></span>
              </label>
            ))}
          </div>
          <div className={`bsq-crisis${riskUrgent ? ' show' : ''}`}>
            <b>Thank you for telling us.</b>
            <p>We’ll flag this so the right person reaches out to you first. In the meantime, if things feel urgent, the 988 Suicide &amp; Crisis Lifeline is free, confidential, and open 24/7 — call or text <a href="tel:988">988</a>. If you’re in immediate danger, please call 911.</p>
          </div>
        </div>)}

        {err && <p className="bsq-err standalone show">{err}</p>}
        <div className="bsq-actions">
          <button type="button" className="bsq-back" onClick={quizBack}>← Back</button>
          <button type="button" className="bsq-cta" onClick={quizNext}>{q < 6 ? 'Continue →' : 'Find my match →'}</button>
        </div>
        <div className="bsq-micro">About 90 seconds · matched instantly</div>
      </div>
    );

    // done
    return (
      <div className="bsq-field bsq-done">
        <div className="bsq-done-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg>
        </div>
        <h3>{booked ? <>You’re on the calendar, <span className="bsq-name">{name}</span>.</> : <>You’re all set, <span className="bsq-name">{name}</span>.</>}</h3>
        <p className="bsq-lede" style={{ maxWidth: 380 }}>
          {booked
            ? `${whenText}. A confirmation is on its way to ${email.trim() || 'your inbox'}.`
            : 'We’ve got everything we need. Keep an eye on your inbox — we’ll email you as soon as your match is ready.'}
        </p>
        {!booked && <div className="bsq-micro">Need to talk sooner? <b onClick={() => { setBooked(false); go('call'); }}>Book a free call</b> instead.</div>}
      </div>
    );
  };

  return (
    <div className="bsq">
      <style>{BSQ_CSS}</style>

      <section className="bsq-proof">
        <div className="bsq-proof-in">
          <div className="bsq-eyebrow">Every match, personally</div>
          <div className="bsq-proof-h">Twenty years of clinical experience <em>behind every match.</em></div>
          <div className="bsq-stats">
            <div className="bsq-stat"><b><i>★</i> 4.9</b><span>average rating</span></div>
            <div className="bsq-stat-sep" />
            <div className="bsq-stat"><b>6,500+</b><span>clients matched</span></div>
            <div className="bsq-stat-sep" />
            <div className="bsq-stat"><b>100%</b><span>match guarantee</span></div>
          </div>
        </div>
      </section>

      <div className="bsq-stage">
        <div className="bsq-card">
          {rail()}
          {field()}
        </div>
      </div>
    </div>
  );
}

/* Ported verbatim from the live mylatherapy.com/test-quiz stylesheet (scoped under .bsq). */
const BSQ_CSS = `
.bsq{
  --green:#1f3a30;--green-deep:#213A30;--cream:#F6F1E9;--cream-2:#E9DDC7;--cream-3:#E5E0D6;
  --terracotta:#C2774B;--terracotta-dark:#A9633C;--gold:#E7B894;--ink:#221E1A;--muted:#6f6557;--muted-2:#8a8074;
  --border:#E4DBCC;--border-input:#d8cdbb;--rail-body:#C7D3C7;--rail-mute:#B9C7BC;--rail-name:#8AA593;--mint:#EAF0EA;--white:#fff;
  --f-display:'Newsreader',Georgia,serif;--f-body:'Hanken Grotesk',-apple-system,'Helvetica Neue',Arial,sans-serif;
  font-family:var(--f-body);color:var(--ink);-webkit-font-smoothing:antialiased;overflow-x:hidden;
}
.bsq *,.bsq *::before,.bsq *::after{box-sizing:border-box;}
.bsq-proof,.bsq-stage{position:relative;width:100vw;max-width:100vw;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;}
.bsq-proof{background:linear-gradient(180deg,var(--cream) 0%,var(--cream-2) 100%);padding:74px 50px 34px;}
.bsq-proof-in{max-width:860px;margin:0 auto;text-align:center;}
.bsq-eyebrow{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--terracotta);font-weight:600;margin-bottom:14px;}
.bsq-proof-h{font-family:var(--f-display);font-weight:500;font-size:40px;line-height:1.1;color:var(--green);margin:0;}
.bsq-proof-h em{font-style:italic;color:var(--terracotta);}
.bsq-stats{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:24px;border-top:1px solid rgba(194,119,75,.28);padding-top:20px;}
.bsq-stat{padding:0 24px;display:flex;align-items:baseline;gap:7px;}
.bsq-stat b{font-family:var(--f-display);font-size:20px;font-weight:500;color:var(--green);}
.bsq-stat b i{color:var(--terracotta);font-style:normal;}
.bsq-stat span{font-size:12.5px;color:var(--muted);}
.bsq-stat-sep{width:1px;height:22px;background:rgba(194,119,75,.28);}
.bsq-stage{background:var(--cream-2);padding:0 28px 46px;}
.bsq-card{max-width:1080px;margin:0 auto;background:var(--cream);border:1px solid var(--border);border-radius:28px;overflow:hidden;display:grid;grid-template-columns:.82fr 1.18fr;min-height:581px;box-shadow:0 24px 60px -34px rgba(33,58,48,.4);}
.bsq-rail{background:var(--green);color:#EAE3D6;padding:44px 38px 46px;display:flex;flex-direction:column;}
.bsq-ticks{display:flex;gap:8px;margin-bottom:22px;}
.bsq-ticks i{width:34px;height:5px;border-radius:3px;background:var(--gold);display:block;}
.bsq-rail-eyebrow{font-family:var(--f-display);font-style:italic;font-size:16px;color:var(--gold);margin:0 0 14px;}
.bsq-rail h3{font-family:var(--f-display);font-weight:500;font-size:33px;line-height:1.12;margin:0 0 14px;color:var(--white);}
.bsq-rail p{font-size:14.5px;line-height:1.6;color:var(--rail-body);margin:0 0 14px;}
.bsq-rail p:last-of-type{margin-bottom:0;}
.bsq-rail-mid{flex:1;display:flex;flex-direction:column;justify-content:center;}
.bsq-steps{display:flex;flex-direction:column;gap:18px;}
.bsq-step{display:flex;gap:14px;align-items:flex-start;}
.bsq-step > span{font-family:var(--f-display);font-size:18px;color:var(--gold);line-height:1;flex:none;}
.bsq-step b{display:block;font-weight:600;font-size:15px;color:var(--white);margin-bottom:2px;}
.bsq-step em{display:block;font-style:normal;font-size:13.5px;color:var(--rail-mute);line-height:1.5;}
.bsq-thanks{display:flex;align-items:center;gap:9px;font-size:13px;line-height:1.45;color:#A9BBA9;margin:0 0 14px;}
.bsq-thanks > i{width:24px;height:24px;border-radius:50%;background:#2C7A4E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;flex:none;font-style:normal;line-height:1;}
.bsq-thanks > span{flex:1;min-width:0;}
.bsq-thanks b{color:var(--white);font-weight:600;}
.bsq-testi{margin-top:auto;border-top:1px solid rgba(255,255,255,.13);padding-top:22px;}
.bsq-testi-stars{color:var(--gold);font-size:13px;letter-spacing:2px;margin-bottom:8px;}
.bsq-testi blockquote{margin:0;font-family:var(--f-display);font-size:16.5px;line-height:1.5;color:#EAE3D6;}
.bsq-testi cite{display:block;font-style:normal;font-size:13px;color:var(--rail-name);margin-top:8px;}
.bsq-field{padding:46px 44px;display:flex;flex-direction:column;justify-content:center;}
.bsq-field h3{font-family:var(--f-display);font-weight:500;font-size:25px;margin:0 0 5px;color:var(--green);line-height:1.2;}
.bsq-lede{font-size:13.5px;color:var(--muted);margin:0 0 18px;line-height:1.5;}
.bsq-qmark{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--terracotta);font-weight:700;margin-bottom:8px;}
.bsq-trust{display:flex;align-items:center;gap:8px;font-size:12px;line-height:1.45;color:var(--muted);margin:0 0 18px;flex-wrap:wrap;}
.bsq-trust > i{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:var(--mint);border:1px solid #d4e0d2;color:#3a6552;font-size:10px;flex:none;font-style:normal;line-height:1;}
.bsq-trust b{color:var(--green);font-weight:500;font-family:var(--f-display);font-size:14px;font-style:italic;text-decoration:underline 1.5px var(--terracotta);text-underline-offset:3px;}
.bsq-trust span.sep{color:var(--terracotta);}
.bsq-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.bsq-row.one{grid-template-columns:1fr;}
.bsq-label{display:block;font-size:12.5px;font-weight:600;color:var(--green);margin-bottom:6px;}
.bsq input[type=text],.bsq input[type=email],.bsq input[type=number],.bsq select,.bsq textarea{width:100%;border:1px solid var(--border-input);border-radius:12px;padding:11px 13px;font-size:14.5px;font-family:var(--f-body);background:var(--white);color:var(--ink);outline:none;transition:border-color .15s,box-shadow .15s;}
.bsq select{padding:13px;appearance:none;cursor:pointer;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f6557' stroke-width='2.2' stroke-linecap='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right 14px center;background-size:15px;}
.bsq textarea{min-height:92px;resize:vertical;}
.bsq input:focus,.bsq select:focus,.bsq textarea:focus{border-color:var(--terracotta);box-shadow:0 0 0 3px rgba(194,119,75,.14);}
.bsq-group-label{font-size:12.5px;letter-spacing:.04em;font-weight:700;color:var(--green);margin:0 0 10px;}
.bsq-group-label span{font-weight:400;color:var(--muted);letter-spacing:0;font-style:italic;}
.bsq-pills{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:24px;}
.bsq-pills.c3{grid-template-columns:repeat(3,1fr);}
.bsq-pills.flow{display:flex;flex-wrap:wrap;}
.bsq-pill{display:flex;align-items:center;justify-content:center;text-align:center;font-weight:600;font-size:14px;border-radius:999px;padding:11px 14px;min-height:46px;line-height:1.15;background:var(--white);border:1px solid var(--border);color:#2c2c28;cursor:pointer;transition:border-color .15s,background .15s,color .15s;}
.bsq-pills.flow .bsq-pill{min-height:0;padding:9px 16px;}
.bsq-pill:hover{border-color:var(--terracotta);}
.bsq-pill.on{background:var(--green);border-color:var(--green);color:var(--white);}
.bsq-choices{display:flex;flex-direction:column;gap:12px;margin-bottom:22px;}
.bsq-choices.tight{gap:9px;}
.bsq-choice{display:flex;align-items:flex-start;gap:14px;cursor:pointer;background:var(--white);border:1px solid var(--border);border-radius:14px;padding:15px 18px;transition:border-color .15s,background .15s;}
.bsq-choice:hover{border-color:var(--terracotta);}
.bsq-choice-box{width:22px;height:22px;border-radius:6px;background:var(--white);border:1.5px solid #cdbfa8;flex:none;margin-top:1px;display:flex;align-items:center;justify-content:center;color:transparent;font-size:13px;line-height:1;}
.bsq-choice-box.round{border-radius:50%;}
.bsq-choice b{display:block;font-family:var(--f-display);font-size:18px;font-weight:500;color:var(--green);line-height:1.25;}
.bsq-choices.tight .bsq-choice{padding:13px 16px;}
.bsq-choices.tight .bsq-choice b{font-size:16px;}
.bsq-choice em{display:block;font-style:normal;font-size:13px;color:var(--muted);margin-top:3px;line-height:1.45;}
.bsq-choice.on{background:var(--mint);border:1.5px solid var(--green);}
.bsq-choice.on .bsq-choice-box{background:var(--green);border-color:var(--green);color:var(--white);}
.bsq-followup{background:#FBF8F2;border:1px solid var(--border);border-left:3px solid var(--terracotta);border-radius:12px;padding:15px 17px;margin-bottom:11px;}
.bsq-followup-q{font-size:13.5px;line-height:1.5;color:var(--green);font-weight:600;margin-bottom:9px;}
.bsq-followup-q i{font-style:italic;font-weight:500;color:var(--terracotta);}
.bsq-followup textarea{min-height:66px;font-size:14px;}
.bsq-crisis{display:none;background:var(--mint);border:1px solid #cfdccd;border-radius:12px;padding:14px 16px;margin-bottom:16px;}
.bsq-crisis.show{display:block;}
.bsq-crisis b{display:block;font-family:var(--f-display);font-size:16px;font-weight:500;color:var(--green);margin-bottom:5px;}
.bsq-crisis p{margin:0;font-size:13px;line-height:1.55;color:#4a5c4f;}
.bsq-crisis a{color:var(--green);font-weight:600;}
.bsq-radios{display:flex;gap:9px;margin-bottom:22px;flex-wrap:wrap;}
.bsq-radio{cursor:pointer;background:var(--white);border:1px solid var(--border);border-radius:999px;padding:10px 22px;font-size:14px;font-weight:600;color:#2c2c28;transition:border-color .15s,background .15s,color .15s;}
.bsq-radio:hover{border-color:var(--terracotta);}
.bsq-radio.on{background:var(--green-deep);border-color:var(--green-deep);color:var(--white);}
.bsq-likert{margin-bottom:22px;}
.bsq-scale{display:flex;gap:5px;}
.bsq-scale label{flex:1;cursor:pointer;}
.bsq-scale span{display:flex;align-items:center;justify-content:center;height:34px;border-radius:9px;background:var(--white);border:1px solid var(--border);font-size:12.5px;font-weight:600;color:var(--muted);transition:background .15s,color .15s,border-color .15s;}
.bsq-scale-caps{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted-2);margin-top:7px;}
.bsq-actions{display:flex;gap:12px;}
.bsq-cta{border:none;cursor:pointer;width:100%;flex:1;background:var(--terracotta);color:var(--white);font-weight:600;font-size:16px;font-family:var(--f-body);padding:16px;border-radius:999px;box-shadow:0 14px 30px -12px rgba(33,58,48,.5);transition:opacity .15s,transform .1s;}
.bsq-cta:hover{opacity:.92;background:var(--terracotta-dark);}
.bsq-cta:active{transform:scale(.995);}
.bsq-cta[disabled]{opacity:.45;cursor:not-allowed;box-shadow:none;}
.bsq-back{cursor:pointer;background:var(--white);border:1px solid var(--border);color:var(--green);font-weight:600;font-size:15px;font-family:var(--f-body);padding:15px 26px;border-radius:999px;flex:none;transition:border-color .15s;}
.bsq-back:hover{border-color:var(--terracotta);}
.bsq-micro{text-align:center;font-size:12.5px;color:var(--muted-2);margin-top:13px;}
.bsq-micro b{color:var(--terracotta);cursor:pointer;}
.bsq-paths{display:flex;flex-direction:column;gap:13px;}
.bsq-path{text-align:left;cursor:pointer;background:var(--white);border:1.5px solid var(--border);border-radius:18px;padding:20px 22px;display:flex;gap:16px;align-items:flex-start;font-family:var(--f-body);width:100%;transition:border-color .15s,box-shadow .15s;}
.bsq-path:hover{border-color:var(--terracotta);}
.bsq-path.primary{border-color:var(--green);box-shadow:0 10px 26px -16px rgba(33,58,48,.5);}
.bsq-path-icon{width:44px;height:44px;border-radius:12px;background:var(--mint);display:flex;align-items:center;justify-content:center;font-size:21px;flex:none;}
.bsq-path-icon.warm{background:#F3EADF;color:var(--terracotta);}
.bsq-path-body{flex:1;}
.bsq-path-top{display:flex;align-items:center;gap:9px;margin-bottom:4px;flex-wrap:wrap;}
.bsq-path-top b{font-family:var(--f-display);font-size:19px;font-weight:500;color:var(--green);}
.bsq-badge{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--green);background:var(--gold);border-radius:999px;padding:2px 8px;}
.bsq-path-body p{margin:0;font-size:13.5px;line-height:1.5;color:#5C544B;}
.bsq-path-body small{display:block;font-size:12px;color:var(--muted-2);margin-top:6px;}
.bsq-path-arrow{font-size:19px;color:var(--terracotta);align-self:center;flex:none;}
.bsq-cal-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:18px;align-items:start;margin-bottom:18px;}
.bsq-cal-cap{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted-2);margin-bottom:8px;}
.bsq-cal{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:16px;position:relative;}
.bsq-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.bsq-cal-month{font-family:var(--f-display);font-size:17px;color:var(--green);}
.bsq-cal-nav{display:flex;gap:6px;}
.bsq-cal-nav button{width:26px;height:26px;border-radius:7px;border:1px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:14px;cursor:pointer;line-height:1;}
.bsq-cal-nav button[disabled]{color:#bbb;cursor:default;}
.bsq-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.bsq-dow{text-align:center;font-size:10px;font-weight:700;color:#a99e8e;padding-bottom:4px;}
.bsq-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:9px;font-size:13px;font-weight:600;background:transparent;color:#c3b6a2;border:1px solid transparent;cursor:default;font-family:var(--f-body);}
.bsq-day.open{background:var(--white);color:var(--green);border-color:var(--border);cursor:pointer;}
.bsq-day.open:hover{border-color:var(--terracotta);}
.bsq-day.on{background:var(--terracotta);color:var(--white);border-color:transparent;}
.bsq-slots{max-height:340px;overflow:auto;padding-right:2px;}
.bsq-slot{display:block;width:100%;text-align:center;cursor:pointer;background:var(--white);color:#2c2c28;border:1px solid var(--border);border-radius:10px;padding:11px;font-size:13.5px;font-weight:600;margin-bottom:8px;font-family:var(--f-body);transition:border-color .15s,background .15s,color .15s;}
.bsq-slot:hover{border-color:var(--terracotta);}
.bsq-slot.on{background:var(--green-deep);border-color:var(--green-deep);color:var(--white);}
.bsq-cal-note{font-size:12.5px;color:var(--muted-2);line-height:1.5;}
.bsq-err{color:var(--terracotta);font-size:12.5px;line-height:1.35;margin:-14px 0 14px;display:none;}
.bsq-err.show{display:block;}
.bsq-err.standalone{margin:0 0 14px;}
.bsq-done{text-align:center;align-items:center;}
.bsq-done-icon{width:56px;height:56px;border-radius:50%;background:var(--white);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--terracotta);margin:0 auto 20px;}
.bsq-done h3{font-size:28px;}
@media (max-width:900px){
  .bsq-proof{padding:48px 24px 26px;}
  .bsq-proof-h{font-size:29px;}
  .bsq-stage{padding:0 16px 32px;}
  .bsq-card{grid-template-columns:1fr;border-radius:20px;min-height:0;}
  .bsq-rail{padding:32px 24px;}
  .bsq-rail h3{font-size:26px;}
  .bsq-field{padding:32px 24px;}
  .bsq-row{grid-template-columns:1fr;}
  .bsq-pills{grid-template-columns:repeat(2,1fr);}
  .bsq-cal-grid{grid-template-columns:1fr;}
  .bsq-slots{max-height:none;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
  .bsq-slot{margin-bottom:0;}
  .bsq-stats{gap:6px;}
  .bsq-stat{padding:0 12px;}
  .bsq-stat-sep{display:none;}
}
`;
