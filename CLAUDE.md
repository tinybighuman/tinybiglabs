# Tiny Big Labs — Claude Code Context

## Project overview

Marketing and landing page site for Tiny Big Labs, built with Astro. Deployed to Netlify (static output). Contains the main homepage and the Beanie privacy/support/feedback pages; the Beanie landing page lives at thebeanieapp.com.

## Dev commands

```bash
npm run dev       # dev server (check terminal for port, usually 4321 or 4322)
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

## Architecture

```
src/
  layouts/
    Base.astro          # <html>/<head> wrapper — Google Fonts, meta, favicon
    ContentPage.astro   # Article-style pages (wordmark, h1, footer shell) — uses Base
  pages/
    index.astro         # Landing page (animated dot pattern + "tiny big labs")
    beanie/
      privacy-policy.astro
      feedback.astro
      support.astro
  components/
    DotPattern.astro    # Canvas-based animated dot grid background
  styles/
    global.css          # Base reset, html/body, font defaults (DM Mono)
    content.css         # Shared styles for all ContentPage-based pages
netlify/
  functions/
    create-issue.js     # Serverless function: posts feedback to GitHub Issues
public/
  .well-known/apple-app-site-association  # Universal Links config for Beanie
```

## Layout system

All pages use one of two layouts — never duplicate `<head>` content in pages directly:

- **`Base.astro`** — use for pages with fully custom layouts (index)
- **`ContentPage.astro`** — use for article-style pages; accepts `title`, `description`, `heading`, `subheading` props, and renders the shared wordmark/footer automatically

## Typography

Follows the brand guide (v1, November 2026). Fonts load once in `Base.astro`; tokens live in `:root` in `global.css`.

| Role | Font | Weight |
|---|---|---|
| Wordmark, headings, app names | iA Writer Quattro V (self-hosted, `public/fonts/`) | wordmark 400/550/700, H1 700 (−2%), H2 550 |
| Body, UI labels, captions | DM Mono (Google Fonts) | 400 (300/500 available) |

- Wordmark: `<span class="wordmark"><span class="w1">tiny</span> <span class="w2">big</span> <span class="w3">labs</span></span>`. One colour, never capitalised.
- Symbol: `src/components/Symbol.astro` (master SVG). Never recolour the hole, rotate, or stretch it.

## Colour palette

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#141210` | Page background |
| `--surface` | `#1c1a17` | Cards, inputs, buttons |
| `--line` | `rgba(255,255,255,.09)` | Borders, dividers |
| `--vapour` | `#96928a` | Texture, captions, labels |
| `--fog` | `#aaaaaa` | Body copy |
| `--white` | `#ffffff` | Headings, wordmark, symbol |
| `--violet` | `#8b5cf6` | Ripples, favicon tile (shapes only, <5% of screen) |
| `--violet-light` | `#a78bfa` | Links, focus rings (text on dark) |

## Dot pattern (DotPattern.astro)

Canvas text-mist background on the landing page: a fixed grid of DM Mono characters, near-invisible at rest. The cursor reveals a fading trail; a click/tap sends an expanding ring. Every 7s the symbol on `index.astro` "taps" and dispatches a `bg-pulse` event from the hole centre (32/48 of the symbol box). Freshly revealed characters tint purple and scramble. Key constants to tweak:

- `FONT_SIZE` / `CELL_W` / `CELL_H` — character size and grid density
- `AMBIENT` — brightness of the resting vapour
- `VAPOUR_RISE` / `VAPOUR_CURL` — how fast the vapour rises and how much it folds and curls
- `HOVER_R` — cursor reveal radius
- `HALF_LIFE` — how long revealed text lingers (seconds)
- `WAVE_SPEED` / `WAVE_MAX` — click ring speed and reach
- `WAVE_GLOW` / `WAVE_TINT` — ripple brightness and how strongly it takes the accent colour
- `SWIRL` / `RISE` — how much the revealed trail curls and drifts upward (the smoke feel)
- `WARP` — how far ripple and hover edges wobble away from a perfect circle
- `WAKE` — faint smoke a ripple leaves behind (0 = clean ring)
- `ACCENT` — accent colour (`#8B5CF6`)

## Netlify functions

`netlify/functions/create-issue.js` — receives POST from the feedback form and opens a GitHub Issue. Requires `GITHUB_TOKEN` and `GITHUB_REPO` env vars set in Netlify dashboard.

## Deployment

Pushes to `main` auto-deploy via Netlify. PRs get deploy previews.
Content-Security-Policy in `netlify.toml` allows Google Fonts — update it if adding new external sources.

## Beanie Universal Links

`public/.well-known/apple-app-site-association` maps paths to the Beanie iOS app (App Store ID `6761773356`). When the app isn't installed, `/bean*` and `/spot*` redirect to https://thebeanieapp.com (see `netlify.toml`).
