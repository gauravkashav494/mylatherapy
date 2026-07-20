import { useState, useEffect } from 'react';

/**
 * VideoCard — a blog "Watch" grid card that opens the same lightbox popup as
 * the homepage VideoPlayer (dark backdrop, Escape-to-close, body scroll-lock,
 * autoplay YouTube embed). Matches the static blog-card styling exactly so it
 * sits inline with the non-interactive cards.
 */
export default function VideoCard({ img, ext, title, videoId }: { img: string; ext: string; title: string; videoId: string }) {
  const [open, setOpen] = useState(false);

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
        aria-label={`Play video: ${title}`}
        style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', textAlign: 'left', color: 'inherit', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'block', width: '100%' }}
      >
        <div style={{ position: 'relative', height: 104, overflow: 'hidden', background: '#dce6dd' }}>
          <img src={`/images/${img}.${ext}`} alt={title} width={260} height={104} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="vc-play" style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(246,241,233,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -8px rgba(0,0,0,.5)', transition: 'transform .18s ease' }}>
              <span style={{ borderLeft: '11px solid var(--terracotta)', borderTop: '7px solid transparent', borderBottom: '7px solid transparent', marginLeft: 3 }} />
            </span>
          </div>
        </div>
        <div style={{ padding: '13px 14px 15px' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 14.5, lineHeight: 1.2, color: 'var(--forest-ink)', margin: 0 }}>{title}</h3>
        </div>
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
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`.vc-play:hover { transform: scale(1.08); }`}</style>
    </>
  );
}
