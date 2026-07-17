import { useState, type CSSProperties } from 'react';

const CHIPS = ['Anxiety', 'Depression', 'Trauma', 'Relationships', 'Burnout'];
const CONCERNS = ['Anxiety & OCD', 'Depression & Mood', 'Trauma & C-PTSD', 'Relationships & Couples', 'Codependency & Boundaries', 'Self-Worth & Shame', 'Stress & Burnout', 'Grief & Life Transitions', 'Other'];
const AREAS = ['Santa Monica', 'West LA', 'Beverly Hills', 'Encino', 'Studio City', 'Pasadena', 'Echo Park', 'Online (anywhere in CA)'];

const label: CSSProperties = { display: 'block', fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--forest-ink)', marginBottom: 8 };
const field: CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-5)', borderRadius: 12,
  padding: '12px 14px', fontSize: 14.5, fontFamily: 'var(--sans)', background: 'var(--cream)', color: 'var(--ink)',
};

export default function TeamMatchForm() {
  const [picked, setPicked] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const toggle = (c: string) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const card: CSSProperties = { background: 'var(--white)', borderRadius: 22, padding: '34px 34px 30px', boxShadow: '0 26px 60px -34px rgba(33,58,48,.45)' };

  if (sent) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '52px 34px' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--forest-mid)' }} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11" /></svg>
        </div>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 26, margin: '0 0 8px', color: 'var(--forest-ink)' }}>Request received.</h3>
        <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>Thanks — our matching specialist will reach out within 24 hours to set up your free 15-minute call.</p>
      </div>
    );
  }

  return (
    <div style={card}>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div><label style={label}>First name</label><input required type="text" placeholder="Your name" style={field} /></div>
          <div><label style={label}>Email</label><input required type="email" placeholder="you@email.com" style={field} /></div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={label}>Phone <span style={{ color: 'var(--muted-5)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input type="tel" placeholder="(310) 000-0000" style={field} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={label}>What brings you in?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CHIPS.map((c) => {
              const on = picked.includes(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggle(c)}
                  className={on ? '' : 'tm-chip'}
                  style={{
                    cursor: 'pointer', fontSize: 13.5, fontWeight: 600, borderRadius: 999, padding: '9px 16px',
                    fontFamily: 'var(--sans)',
                    background: on ? 'var(--forest)' : 'var(--white)',
                    border: `1px solid ${on ? 'var(--forest)' : 'var(--border-5)'}`,
                    color: on ? 'var(--white)' : 'var(--forest-ink)',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <select defaultValue="" style={{ ...field, appearance: 'none', cursor: 'pointer', marginTop: 10 }}>
            <option value="">Choose a concern…</option>
            {CONCERNS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={label}>Where would you like to meet?</label>
          <select defaultValue="" style={{ ...field, appearance: 'none', cursor: 'pointer' }}>
            <option value="">Choose a location…</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={label}>Anything you'd like us to know? <span style={{ color: 'var(--muted-5)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <textarea rows={3} placeholder="A sentence or two is plenty." style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <button type="submit" className="btn btn-primary" style={{ border: 'none', cursor: 'pointer', width: '100%', background: 'var(--terracotta)', color: 'var(--white)', fontWeight: 600, fontSize: 16, fontFamily: 'var(--sans)', padding: 16, borderRadius: 999, boxShadow: '0 14px 30px -12px rgba(0,0,0,.4)' }}>
          Request my match
        </button>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted-4)', marginTop: 14 }}>
          Free 15-minute call · No obligation · <span style={{ color: 'var(--terracotta)' }}>First session is on us if the fit isn't right.</span>
        </div>
      </form>

      <style>{`
        .tm-chip { transition: background-color .15s ease, border-color .15s ease, color .15s ease; }
        .tm-chip:hover { border-color: var(--forest); color: var(--forest); }
      `}</style>
    </div>
  );
}
