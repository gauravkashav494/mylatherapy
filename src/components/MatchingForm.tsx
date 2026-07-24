import { useState, type CSSProperties } from 'react';

const CONCERNS = ['Anxiety', 'Depression', 'Trauma', 'Relationships', 'Couples', 'Child/Teen', 'Family', 'Other'];
const AREAS = ['Santa Monica', 'West LA', 'Beverly Hills', 'Encino', 'Studio City', 'Pasadena', 'Echo Park', 'Online (anywhere in CA)'];

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid var(--border-5)',
  borderRadius: 12,
  padding: '11px 13px',
  fontSize: 14.5,
  fontFamily: "var(--sans)",
  background: 'var(--white)',
  color: 'var(--ink)',
};
const labelStyle: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--forest-ink)', marginBottom: 6 };

export default function MatchingForm() {
  const [picked, setPicked] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const toggle = (c: string) =>
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  if (sent) {
    return (
      <div style={{ background: 'var(--cream)', borderRadius: 22, padding: '48px 36px', boxShadow: '0 26px 56px -30px rgba(0,0,0,.5)', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--forest-mid)' }} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11" /></svg>
        </div>
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, margin: '0 0 8px', color: 'var(--forest-ink)' }}>You're on your way.</h3>
        <p style={{ fontSize: 15, color: 'var(--muted)', margin: 0 }}>Thanks — our matching specialist will reach out within 24 hours to hand-pick your therapist.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', borderRadius: 22, padding: '36px 36px 32px', boxShadow: '0 26px 56px -30px rgba(0,0,0,.5)' }}>
      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 27, lineHeight: 1.08, margin: '0 0 8px', color: 'var(--forest-ink)' }}>Let's find your perfect therapist.&nbsp;</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, lineHeight: 1.45, color: 'var(--muted-4)', margin: '0 0 20px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--mist)', border: '1px solid var(--mint-3)', color: 'var(--sage-ink)', fontSize: 10, flex: 'none', lineHeight: 1 }}>✓</span>
        <span>Every therapist personally trained by <strong style={{ color: 'var(--forest-ink)', fontWeight: 700, fontFamily: 'Newsreader,serif', fontStyle: 'italic', textDecoration: 'underline 1.5px var(--terracotta)', textUnderlineOffset: 3 }}>Brooke Sprowl, LCSW</strong> · 20 years in practice</span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={labelStyle}>First name *</label><input required type="text" placeholder="First name" style={inputStyle} /></div>
          <div><label style={labelStyle}>Email *</label><input required type="email" placeholder="you@email.com" style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Phone <span style={{ color: 'var(--muted-5)', fontWeight: 400 }}>(optional)</span></label>
          <input type="tel" placeholder="(310) 000-0000" style={inputStyle} />
        </div>

        <div style={{ fontSize: 12.5, letterSpacing: '.04em', fontWeight: 700, color: 'var(--forest-ink)', margin: '0 0 10px' }}>What's bringing you in? *</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 18 }} className="mf-chips">
          {CONCERNS.map((c) => {
            const on = picked.includes(c);
            return (
              <label
                key={c}
                onClick={() => toggle(c)}
                className={on ? '' : 'chip-toggle'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', borderRadius: 999, padding: '10px 6px',
                  minHeight: 42, lineHeight: 1.15,
                  background: on ? 'var(--forest)' : 'var(--white)',
                  border: `1px solid ${on ? 'var(--forest)' : 'var(--border)'}`,
                  color: on ? 'var(--white)' : 'var(--ink-2)',
                }}
              >
                {c}
              </label>
            );
          })}
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 12.5, letterSpacing: '.04em', fontWeight: 700, color: 'var(--forest-ink)', margin: '0 0 10px' }}>Preferred area</label>
          <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
            <option value="">Choose a location…</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ border: 'none', cursor: 'pointer', width: '100%', background: 'var(--terracotta)', color: 'var(--white)', fontWeight: 600, fontSize: 16, fontFamily: "var(--sans)", padding: 15, borderRadius: 999, boxShadow: '0 14px 30px -12px rgba(0,0,0,.5)' }}>
          Find my therapist →
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12.5, color: 'var(--muted-4)', marginTop: 13 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)', flex: 'none' }} />
          free consultation · no obligation · first session guaranteed
        </div>
      </form>

      <style>{`
        @media (max-width: 640px) { .mf-chips { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  );
}
