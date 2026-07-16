# My LA Therapy — Astro + React

Homepage for My LA Therapy, rebuilt as an **Astro + React** project from the original
bundled design mockup (`MyLA Therapy - Home (1).html`).

## Run it

Requires **Node 18+** (Node 20 recommended — your global nvm `v20.9.0` was incomplete,
so use a fresh Node 20 install).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # preview the production build
```

## Stack

- **Astro 4** — static site generator; every section is an `.astro` component.
- **@astrojs/react** — used only for the two interactive "islands":
  - `src/components/Nav.tsx` — sticky header, hover mega-dropdowns, search, and the
    mobile hamburger menu (`client:load`).
  - `src/components/MatchingForm.tsx` — the "Get your perfect match" form with the
    concern chips and a success state (`client:visible`).
- Everything else is static HTML/CSS shipped with **zero client JS**.

## Structure

```
public/images/           all site images (see "Assets" below)
src/
  layouts/Layout.astro    <html> shell, Google Fonts, <title>/meta, SEO
  styles/theme.css        ← DESIGN TOKENS: all colors + fonts (single source of truth)
  styles/global.css       reset, :hover rules, responsive helpers (references tokens)
  components/*.astro       one component per homepage section
  components/*.tsx         React islands (Nav, MatchingForm, VideoPlayer)
  pages/index.astro        composes the page
```

## Theming (change the whole site from one file)

All colors and typography are centralized in **`src/styles/theme.css`** as CSS custom
properties on `:root`. Every component references them via `var(--token)` — nothing is
hardcoded — so editing one value there re-themes the entire site.

```css
:root {
  --serif: 'Newsreader', Georgia, serif;   /* display font  */
  --sans:  'Hanken Grotesk', system-ui, sans-serif;  /* body font */
  --forest: #213A30;      /* primary dark   */
  --terracotta: #C2774B;  /* accent / CTAs  */
  --sage: #8AA593;
  --tan: #E7B894;
  --cream: #F6F1E9;       /* page background */
  /* …78 tokens total, grouped by family… */
}
```

Change `--terracotta` (or swap `--serif`/`--sans`) and buttons, links, pins, icons,
headings, etc. all update at once. Notes:
- The `<meta name="theme-color">` in `Layout.astro` is a literal hex by necessity
  (browser-chrome color, not CSS) — update it alongside `--forest` if you rebrand.
- A few `rgba(…)` overlays/shadows keep literal values (they're alpha tints of the
  brand colors, not core surfaces).

## Design fidelity & decisions

- **Fonts:** Newsreader (serif display) + Hanken Grotesk (body), via Google Fonts —
  same families the original embedded (tokens `--serif` / `--sans`).
- **Palette:** forest `#213A30`, terracotta `#C2774B`, sage `#8AA593`, cream `#F6F1E9`,
  tan `#E7B894` (and 70+ shades) — all defined in `src/styles/theme.css`.
- The original file was a design-tool export containing **two fixed artboards**
  (desktop 1360px + a separate mobile 390px) inside an editor chrome, plus three
  switchable hero variants. This rebuild is a **single responsive page**, using the
  **Premium full-bleed hero** (the mockup's default). Grids collapse at 1000px / 640px.
- The design tool's `style-hover="…"` attributes were converted to real CSS `:hover`
  rules (`.btn-primary`, `.tile-photo`, `.nav-pill`, `.chip-toggle`, …).
- The free-resource ("Mindset Mastery Guide") section originally mocked all six
  interior pages as tiny scaled previews; here it keeps the book cover + lead capture
  and a simplified 6-page thumbnail strip.

## Assets

Images were extracted from the original bundle's embedded manifest and given friendly
names in `public/images/`. Photos that were only gradient placeholders in the mockup
(the founder portrait / hero) were pulled from the live site **mylatherapy.com**:

- `founder-brooke.webp`, `brooke-thumb.webp` — founder Brooke Sprowl (from live site);
  `founder-brooke.webp` is used in the founder/vetting sections and the hero avatar
- `hero-banner.webp` — hero background from the live site (currently unused: the hero
  uses the template's flat cream `#F6F1E9` background instead of a photo)
- `logo-full.svg` — site logo (from live site)
- `office-*.png` — the 7 real neighborhood office photos (from the bundle)
- `treat-*`, `session-*`, `video-thumb.webp` — illustrations (from the bundle)

The raw extraction (`extracted-assets/`, `_extracted_template.html`, `_manifest_index.txt`)
is kept for reference and is git-ignored.

## Notes / next steps

- Nav and footer links point to `#` or on-page anchors — wire them to real routes as
  you build out the other pages (What We Treat, Locations, etc.).
- Forms are front-end only (they show a success state); connect them to your backend /
  CRM (the original referenced a GHL-style matching flow).
- Large office PNGs (~1–2 MB each) could be converted to WebP / run through
  `astro:assets` for optimization.
