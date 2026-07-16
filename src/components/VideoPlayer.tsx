import { useState, useEffect } from 'react';

const VIDEO_ID = 'G2XD-DoraHM';

export default function VideoPlayer() {
  const [open, setOpen] = useState(false);

  // close on Escape + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Play video: turning insight into action"
        style={{
          all: 'unset',
          display: 'block',
          width: '100%',
          aspectRatio: '5 / 4',
          borderRadius: 22,
          background: 'var(--mint)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <img src="/images/video-cover.webp" alt="Watch: turning insight into action" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 78, height: 78, borderRadius: '50%', background: 'rgba(246,241,233,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 34px -10px rgba(0,0,0,.45)', transition: 'transform .18s ease' }} className="vp-play">
            <span style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '22px solid var(--terracotta)', marginLeft: 6 }} />
          </span>
        </span>
        <span style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(33,58,48,.85)', color: 'var(--cream-text)', fontSize: 12.5, fontWeight: 600, padding: '6px 13px', borderRadius: 999 }}>▶ Watch · 2 min</span>
        <span style={{ position: 'absolute', left: 16, bottom: 16, background: 'rgba(255,255,255,.95)', borderRadius: 12, padding: '8px 13px', boxShadow: '0 12px 28px -12px rgba(0,0,0,.5)', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4, textAlign: 'left' }}>
          <strong style={{ fontFamily: "var(--serif)", fontWeight: 600, fontStyle: 'italic', color: 'var(--forest-ink)', fontSize: 13, borderBottom: '2px solid var(--terracotta)', paddingBottom: 2 }}>Brooke Sprowl, LCSW</strong><br />20 yrs in practice · Founder
        </span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(20,30,25,.82)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 960 }}>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close video"
              style={{ position: 'absolute', top: -46, right: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.14)', color: 'var(--white)', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}
            >
              ✕
            </button>
            <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px -20px rgba(0,0,0,.7)', background: 'var(--black)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                title="My LA Therapy — turning insight into action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`.vp-play:hover { transform: scale(1.06); }`}</style>
    </>
  );
}
