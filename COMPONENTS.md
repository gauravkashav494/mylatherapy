# Components & Shared Sections — My LA Therapy (Astro)

**Read this before building or editing any page.** The rule is simple:

> If a section appears on **2 or more pages**, it must be a component in `src/components/`.
> Don't paste the same markup into another page — reuse the component and pass props.

This is exactly what we already do for the **header, footer, and lead-capture form**. This
file is the catalog so we don't rebuild the same section twice.

---

## 1. The page skeleton (every page uses these)

Every page in `src/pages/*.astro` follows the same shell:

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.astro';
// ...page-specific section components...
---
<Layout title="…" description="…" path="/your-path" image="/images/…">
  <Nav client:load />
  <main style="background:var(--cream);">
    …sections…
  </main>
  <Footer />
</Layout>
```

| Piece | File | Notes |
|-------|------|-------|
| **Layout** (HTML shell) | `src/layouts/Layout.astro` | `<head>`, SEO meta, Open Graph, fonts, JSON-LD. Props: `title`, `description`, `path`, `image`. Renders a `<slot />`. |
| **Header / nav** | `src/components/Nav.tsx` | React island — **must** be `<Nav client:load />` (dropdowns need JS). |
| **Footer** | `src/components/Footer.astro` | Static. Just `<Footer />`. |
| **Preloader** | `src/components/Preloader.astro` | Optional splash; used on the homepage. |

---

## 2. Shared cross-page section components

These were extracted because the same section was living on several sub-pages. **Use these
instead of copy-pasting the markup.**

### `MatchCta.astro` — the "The match" lead-capture band (`id="book"`)

Used on: **locations, our-team, specialties, services, who-we-help.**
Wraps the `TeamMatchForm` island — you do **not** import `TeamMatchForm` in the page anymore.

```astro
import MatchCta from '../components/MatchCta.astro';

<MatchCta
  bg="var(--sand-2)"                       {/* optional, default sand */}
  padding="54px 24px"                       {/* optional */}
  eyebrow="The match"                       {/* optional, default "The match" */}
  heading="Not sure where you fit?"         {/* required — plain lead text */}
  accent="That's our job."                  {/* optional — italic terracotta tail */}
  text="Tell us what's going on and we'll…" {/* required — paragraph */}
  bullets={[                                {/* optional; inline HTML allowed */}
    'Matched to your concern, not an algorithm',
    'Personally vetted &amp; trained by our founder',
    'First session guaranteed — or we re-match you free',
  ]}
/>
```

- `bullets` are rendered with `set:html`, so `<strong>…</strong>` etc. work (see our-team).
- The section always has `id="book"` so `#book` anchor links keep working.

### `ReviewsWall.astro` — centered 3-card "client reviews" wall

Used on: **specialties, services, who-we-help.**
The three quotes are identical everywhere; usually only the `tag` chips + heading change.

```astro
import ReviewsWall from '../components/ReviewsWall.astro';

<ReviewsWall
  bg="var(--mist)"                     {/* optional, default mist */}
  eyebrow="Client reviews"             {/* optional */}
  heading="People who felt"            {/* required — plain lead text */}
  accent="finally understood."         {/* optional — italic terracotta tail */}
  ratingNote="average · verified client reviews"  {/* optional */}
  reviews={reviews}                    {/* optional — [{tag, quote, by}]; falls back to the standard trio */}
/>
```

If you don't pass `reviews`, it renders the default trio (S.M. / J.R. / D.L.). Pass an array
of `{ tag, quote, by }` to override — most pages only change the `tag` labels.

---

## 3. Homepage section components

The homepage (`src/pages/index.astro`) is assembled entirely from these. Reuse any of them on
other pages if the content fits:

`Hero` · `StatsBar` · `InsightToAction` · `FeaturedIn` · `WhatMakesDifferent` · `WhatWeTreat` ·
`Locations` · `WaysToWork` · `Vetting` · `SoundFamiliar` · `MatchBanner` · `FounderStory` ·
`SignatureApproach` · `Methods` · `Team` · `WhoWeHelp` · `FreeResource` · `Reviews`
(all in `src/components/*.astro`)

> Note: `Reviews.astro` is the **homepage** reviews layout. For sub-pages use
> **`ReviewsWall.astro`** (section 2) — that's the shared one.

## 4. React islands (need a `client:` directive)

| Component | Directive | Purpose |
|-----------|-----------|---------|
| `Nav.tsx` | `client:load` | Header + dropdown menus |
| `MatchingForm.tsx` | `client:visible` | Homepage matching form |
| `TeamMatchForm.tsx` | `client:visible` | Sub-page match form — **now used via `MatchCta`** |
| `VideoPlayer.tsx` | `client:visible` | Video embeds |

---

## 5. Shared styling primitives (global — don't redefine per page)

Defined in `src/styles/global.css` + `src/styles/theme.css`. They already include responsive
collapse, so use these class names instead of re-writing media queries:

| Class | Does |
|-------|------|
| `.wrap` | `max-width:1360px; margin:0 auto` — aligns content with Nav/Footer |
| `.split` | 2-col grid that collapses to 1 column ≤860px |
| `.grid-3` | 3-col grid → 2-col ≤ tablet → 1-col ≤860px |
| `.h2-fluid` | Fluid `clamp()` heading size |

Colors are CSS vars in `theme.css` (`--forest`, `--cream`, `--terracotta`, `--sage-ink`,
`--sand-2`, `--mist`, `--mint`, `--mint-tint-2`, …). **Use the vars, not hex codes.**

---

## 6. Workflow for a new page

1. Start from the skeleton in section 1 (Layout + Nav + main + Footer).
2. For a lead-capture band → `MatchCta`. For a reviews wall → `ReviewsWall`.
3. Building a genuinely new section? First check this catalog. If it doesn't exist **and it
   will appear on more than one page**, build it as a component in `src/components/` and add a
   row here — don't inline it.
4. Keep shared layout/spacing on the global classes (`.wrap`, `.split`, `.grid-3`, `.h2-fluid`).
