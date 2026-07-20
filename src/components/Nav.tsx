import { useState, useEffect, type CSSProperties } from 'react';

/* ---- menu data (from the original "Site Nav" component) ---- */
type Item = { label: string; href: string; highlight?: boolean };

const mk = (labels: string[], highlight = false): Item[] => labels.map((label) => ({ label, href: '#', highlight }));

const WHO_HELP: Item[] = [
  'C-Suite, Tech & Founders', 'Industry Executives', 'Young Professionals', 'Artists & Creatives',
  'Perfectionists & People-Pleasers', 'Overwhelmed Overachievers', 'Empaths & HSPs', 'Spiritual Seekers',
].map((label) => ({ label, href: '/who-we-help' }));
const SPECIALTIES = mk([
  'Anxiety & OCD', 'Depression & Mood', 'Trauma & C-PTSD', 'Relationships & Couples',
  'Codependency & Boundaries', 'Stress & Burnout', 'Grief & Life Transitions', 'Self-Worth & Shame',
]);
const METHODS = mk([
  'Nervous System-Based Therapy', 'EMDR', 'Somatic Therapy', 'CBT & DBT',
  'IFS & Parts Work', 'Attachment-Focused Therapy', 'Experiential Therapy', 'Hypnotherapy',
]);
const THERAPY: Item[] = [
  { label: 'Individual Therapy', href: '/types-of-therapy#fmt-individual' },
  { label: 'Couples Therapy', href: '/types-of-therapy#fmt-couples' },
  { label: 'Family Therapy', href: '/types-of-therapy#fmt-family' },
  { label: 'Child & Teen Therapy', href: '/types-of-therapy#fmt-child-teen' },
  { label: 'Group Therapy', href: '/types-of-therapy#fmt-group' },
];
const COACHING = mk(['Executive Coaching', 'Creative Coaching'], true);
const CONSULTING = mk(['Business Consulting', 'Brand & Marketing Consulting'], true);
const LOCATIONS: Item[] = [
  ...['Santa Monica', 'West LA', 'Beverly Hills', 'Encino', 'Studio City', 'Echo Park', 'Pasadena'].map((label) => ({ label, href: '/locations' })),
  { label: 'Online Therapy', href: '/locations', highlight: true },
];
const WHY_LINKS: Item[] = [
  { label: 'Our Team', href: '/our-team' },
  { label: 'Our Guarantee', href: '#' },
  { label: 'Our Approach', href: '#' },
  { label: 'The Journal (Blog)', href: '/blog' },
  { label: 'Reviews', href: '#' },
  { label: 'Meet Brooke Sprowl', href: '#' },
  { label: 'Press', href: '#' },
];

const NAV = [
  { key: 'who', label: 'Who We Help', href: '/who-we-help' },
  { key: 'specialties', label: 'Specialties', href: '/specialties' },
  { key: 'methods', label: 'Methods', href: '#methods' },
  { key: 'services', label: 'Services', href: '/types-of-therapy' },
  { key: 'locations', label: 'Locations', href: '/locations' },
  { key: 'why', label: 'Why Us', href: '#' },
] as const;

const POPULAR = ['Anxiety', 'Trauma', 'Couples', 'EMDR', 'Santa Monica'];

/* ---- shared style fragments ---- */
const panel: CSSProperties = {
  pointerEvents: 'auto',
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  boxShadow: '0 24px 50px -22px rgba(33,58,48,.45)',
  padding: '18px 20px',
};
const kicker: CSSProperties = {
  fontSize: 11,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--sand-text)',
  fontWeight: 700,
  marginBottom: 12,
};
const allLink: CSSProperties = { fontSize: 14, color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' };
const subhead: CSSProperties = { fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sage-mid)', fontWeight: 700, margin: '2px 0 6px' };
const subheadIt: CSSProperties = { color: 'var(--sand-text-2)', fontWeight: 500, textTransform: 'none', letterSpacing: 0, fontStyle: 'italic', fontFamily: 'var(--serif)' };

function PanelLinks({ items, cols }: { items: Item[]; cols: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '4px 10px' }}>
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          className="nav-pill"
          style={{
            fontSize: 14,
            color: it.highlight ? 'var(--forest)' : 'var(--taupe)',
            padding: '9px 12px',
            borderRadius: 9,
            textDecoration: 'none',
            background: it.highlight ? 'var(--mint)' : undefined,
            fontWeight: it.highlight ? 500 : 400,
          }}
        >
          {it.label}
        </a>
      ))}
    </div>
  );
}

function Caret() {
  return <span style={{ fontSize: 10, color: 'var(--sage)' }}>▾</span>;
}

const SearchIcon = ({ size = 19, stroke = 'currentColor' }: { size?: number; stroke?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ stroke }} strokeWidth={2.1} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

export default function Nav() {
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobileSub, setMobileSub] = useState<string | null>(null);

  const mobileSections: { key: string; label: string; items: Item[] }[] = [
    { key: 'who', label: 'Who We Help', items: WHO_HELP },
    { key: 'specialties', label: 'Specialties', items: SPECIALTIES },
    { key: 'methods', label: 'Methods', items: METHODS },
    { key: 'services', label: 'Services', items: [...THERAPY, ...COACHING, ...CONSULTING] },
    { key: 'locations', label: 'Locations', items: LOCATIONS },
    { key: 'why', label: 'Why Us', items: [...WHY_LINKS, { label: 'Visit Soul Salon', href: '#', highlight: true }] },
  ];

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 60, fontFamily: "var(--sans)" }} onMouseLeave={() => setOpen(null)}>
      <header
        style={{
          background: 'rgba(246,241,233,.96)',
          backdropFilter: 'saturate(1.2) blur(6px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1360,
          margin: '0 auto',
          padding: '16px 34px',
        }}
        className="pad-fluid"
      >
        <a href="#top" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', flex: 'none' }}>
          <img src="/images/logo-full.svg" alt="My LA Therapy" style={{ height: 30, width: 'auto', display: 'block' }} />
        </a>

        {/* desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hide-lg-down">
          {NAV.map((n) => (
            <span
              key={n.key}
              onMouseEnter={() => setOpen(n.key)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--taupe)',
                padding: '8px 0',
              }}
            >
              <a href={n.href} style={{ textDecoration: 'none', color: 'inherit' }}>{n.label}</a>
              <Caret />
              {open === n.key && (
                <span style={{ position: 'absolute', left: 0, right: 13, bottom: 2, height: 2, background: 'var(--terracotta)', borderRadius: 2 }} />
              )}
            </span>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setSearch((s) => !s)}
            aria-label="Search"
            className="hide-lg-down"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              flex: 'none',
              color: 'var(--forest)',
            }}
          >
            <SearchIcon />
          </button>
          <a
            href="#book"
            className="btn btn-primary hide-sm-down"
            style={{
              textDecoration: 'none',
              background: 'var(--terracotta)',
              color: 'var(--cream)',
              fontWeight: 600,
              fontSize: 14.5,
              padding: '11px 22px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              boxShadow: '0 10px 24px -10px rgba(33,58,48,.6)',
            }}
          >
            Find My Therapist
          </a>
          {/* hamburger */}
          <button
            aria-label="Menu"
            onClick={() => setMobile((m) => !m)}
            className="nav-hamburger"
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 6,
            }}
          >
            <span style={{ width: 22, height: 2, background: 'var(--forest)', borderRadius: 2 }} />
            <span style={{ width: 22, height: 2, background: 'var(--forest)', borderRadius: 2 }} />
            <span style={{ width: 22, height: 2, background: 'var(--forest)', borderRadius: 2 }} />
          </button>
        </div>
      </div>
      </header>

      {/* search bar */}
      {search && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 65, background: 'var(--white)', borderBottom: '1px solid var(--border)', boxShadow: '0 24px 50px -28px rgba(33,58,48,.45)', padding: '22px 34px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--cream)', border: '1px solid var(--border-5)', borderRadius: 999, padding: '10px 12px 10px 18px' }}>
            <SearchIcon size={18} stroke="var(--muted-5)" />
            <input type="text" placeholder="Search therapists, concerns, locations…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "var(--sans)", fontSize: 16, color: 'var(--ink)', minWidth: 0 }} />
            <button onClick={() => setSearch(false)} aria-label="Close search" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted-3)', fontSize: 16, lineHeight: 1, padding: 0, flex: 'none' }}>✕</button>
          </div>
          <div style={{ maxWidth: 720, margin: '13px auto 0', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sand-text)', fontWeight: 700, marginRight: 2 }}>Popular</span>
            {POPULAR.map((p) => (
              <a key={p} href="#" className="nav-pill" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--taupe)', background: 'var(--chip-cream)', borderRadius: 999, padding: '6px 14px' }}>{p}</a>
            ))}
          </div>
        </div>
      )}

      {/* desktop dropdown layer */}
      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
        {open === 'who' && (
          <div style={{ ...panel, width: 560 }}>
            <div style={kicker}>Who we work with</div>
            <PanelLinks items={WHO_HELP} cols={2} />
            <div style={{ borderTop: '1px solid var(--sand)', marginTop: 13, paddingTop: 13 }}><a href="/who-we-help" className="link-underline" style={allLink}>All the people we help →</a></div>
          </div>
        )}
        {open === 'specialties' && (
          <div style={{ ...panel, width: 560 }}>
            <div style={kicker}>Concerns &amp; conditions</div>
            <PanelLinks items={SPECIALTIES} cols={2} />
            <div style={{ borderTop: '1px solid var(--sand)', marginTop: 13, paddingTop: 13 }}><a href="/specialties" className="link-underline" style={allLink}>All specialties →</a></div>
          </div>
        )}
        {open === 'methods' && (
          <div style={{ ...panel, width: 560 }}>
            <div style={kicker}>Approaches &amp; modalities</div>
            <PanelLinks items={METHODS} cols={2} />
            <div style={{ borderTop: '1px solid var(--sand)', marginTop: 13, paddingTop: 13 }}><a href="#methods" className="link-underline" style={allLink}>All methods →</a></div>
          </div>
        )}
        {open === 'services' && (
          <div style={{ ...panel, width: 560 }}>
            <div style={kicker}>Ways to work together</div>
            <div style={subhead}>Therapy <span style={subheadIt}>· clinical</span></div>
            <PanelLinks items={THERAPY} cols={2} />
            <div style={{ ...subhead, marginTop: 12 }}>Coaching <span style={subheadIt}>· not clinical</span></div>
            <PanelLinks items={COACHING} cols={2} />
            <div style={{ ...subhead, marginTop: 12 }}>Consulting <span style={subheadIt}>· for businesses</span></div>
            <PanelLinks items={CONSULTING} cols={2} />
            <div style={{ borderTop: '1px solid var(--sand)', marginTop: 13, paddingTop: 13 }}><a href="/types-of-therapy" className="link-underline" style={allLink}>All services →</a></div>
          </div>
        )}
        {open === 'locations' && (
          <div style={{ ...panel, width: 560 }}>
            <div style={kicker}>LA in-person therapy offices</div>
            <PanelLinks items={LOCATIONS} cols={2} />
            <div style={{ borderTop: '1px solid var(--sand)', marginTop: 13, paddingTop: 13 }}><a href="/locations" className="link-underline" style={allLink}>All locations →</a></div>
          </div>
        )}
        {open === 'why' && (
          <div style={{ ...panel, width: 560 }}>
            <div style={kicker}>Get to know us</div>
            <PanelLinks items={WHY_LINKS} cols={2} />
            <div style={{ ...subhead, marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--sand)' }}>Soul Salon <span style={subheadIt}>· creative &amp; executive coaching</span></div>
            <a href="#" className="nav-pill" style={{ display: 'block', marginTop: 4, fontSize: 14, color: 'var(--forest)', background: 'var(--mint)', padding: '11px 12px', borderRadius: 9, textDecoration: 'none', fontWeight: 500 }}>Visit Soul Salon →</a>
          </div>
        )}
      </div>

      {/* ===== mobile off-canvas drawer ===== */}
      {/* backdrop */}
      <div
        onClick={() => setMobile(false)}
        aria-hidden={!mobile}
        style={{
          position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(20,30,25,.5)',
          opacity: mobile ? 1 : 0, pointerEvents: mobile ? 'auto' : 'none',
          transition: 'opacity .25s ease',
        }}
      />
      {/* drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 91,
          width: 'min(86vw, 340px)', background: 'var(--cream)',
          boxShadow: mobile ? '-24px 0 60px -24px rgba(33,58,48,.5)' : 'none',
          transform: mobile ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .32s cubic-bezier(.4,0,.2,1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)', flex: 'none' }}>
          <img src="/images/logo-full.svg" alt="My LA Therapy" style={{ height: 28, width: 'auto' }} />
          <button
            onClick={() => setMobile(false)}
            aria-label="Close menu"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'var(--sand)', color: 'var(--forest)', fontSize: 18, lineHeight: 1, cursor: 'pointer', flex: 'none' }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 18px' }}>
          {mobileSections.map((sec) => (
            <div key={sec.key} style={{ borderBottom: '1px solid var(--border-6)' }}>
              <button
                onClick={() => setMobileSub((s) => (s === sec.key ? null : sec.key))}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', padding: '15px 4px', fontSize: 17, fontWeight: 500, color: 'var(--forest)', fontFamily: "var(--sans)" }}
              >
                {sec.label}
                <span style={{ color: 'var(--sage)', fontSize: 20, lineHeight: 1 }}>{mobileSub === sec.key ? '–' : '+'}</span>
              </button>
              {mobileSub === sec.key && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 12 }}>
                  {sec.items.map((it) => (
                    <a key={it.label} href={it.href} onClick={() => setMobile(false)} style={{ padding: '9px 12px', fontSize: 14.5, color: 'var(--taupe)', textDecoration: 'none', borderRadius: 8 }}>{it.label}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)', flex: 'none' }}>
          <a href="#book" onClick={() => setMobile(false)} className="btn btn-primary" style={{ display: 'block', textAlign: 'center', background: 'var(--terracotta)', color: 'var(--white)', fontWeight: 600, fontSize: 16, padding: 14, borderRadius: 999, textDecoration: 'none' }}>Find My Therapist</a>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1000px) {
          .nav-hamburger { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
