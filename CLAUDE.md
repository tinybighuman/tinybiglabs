# Tiny Big Labs — Claude Code Context

## Project overview

Marketing and landing page site for Tiny Big Labs, built with Astro. Deployed to Netlify (static output). Contains the main homepage and subpages for the Beanie iOS app.

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
    bean.astro          # Beanie app universal link landing page
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

- **`Base.astro`** — use for pages with fully custom layouts (index, bean)
- **`ContentPage.astro`** — use for article-style pages; accepts `title`, `description`, `heading`, `subheading` props, and renders the shared wordmark/footer automatically

## Typography

Fonts are loaded once in `Base.astro` and apply globally.

| Role | Font | Weight | Style |
|---|---|---|---|
| Headings, wordmarks | Fraunces | 300 | italic |
| Body, UI text | DM Mono | 300 / 400 | normal |

- `font-optical-sizing: auto` on all Fraunces headings — important for display sizes
- Google Fonts URL loads both families in one request (see `Base.astro`)
- Inspired by [algoproducts.builtbysid.dev](https://algoproducts.builtbysid.dev)

## Colour palette

Warm dark theme — derived from algoproducts' cream `#F7F5F0` inverted to dark.

| Token | Value | Usage |
|---|---|---|
| Page background | `#141210` | `html` in global.css |
| Input/card background | `#1c1a17` | Form inputs |
| Button background | `#201e1b` | Buttons |
| Button hover | `#2a2724` | Button :hover |
| Accent orange | `#C4571A` | Dot pattern accent glow |
| Body text | `#e0e0e0` | General prose |
| Muted text | `#bbb` | Paragraphs |
| Dimmed text | `#777` | Section labels (h2) |
| Subdued text | `#555` | Meta / timestamps |

## Dot pattern (DotPattern.astro)

Canvas animation on the landing page. Key constants to tweak:

- `SPACING` — grid density (px between dots)
- `MAX_LIT` — max simultaneously glowing dots
- `ORANGE_CHANCE` — probability (0–1) a triggered dot glows orange instead of warm white
- `ORANGE` — accent colour (`#C4571A`)

## Netlify functions

`netlify/functions/create-issue.js` — receives POST from the feedback form and opens a GitHub Issue. Requires `GITHUB_TOKEN` and `GITHUB_REPO` env vars set in Netlify dashboard.

## Deployment

Pushes to `main` auto-deploy via Netlify. PRs get deploy previews.
Content-Security-Policy in `netlify.toml` allows Google Fonts — update it if adding new external sources.

## Beanie Universal Links

`public/.well-known/apple-app-site-association` maps paths to the Beanie iOS app (App Store ID `6761773356`). The `/bean` page is the web fallback when the app isn't installed.
