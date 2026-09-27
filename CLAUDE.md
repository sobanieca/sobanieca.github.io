# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Fine tuning articles

When asked to fine tune given article perform grammar/syntax corrections. Do all
that is possible to keep original intent/context. Double check all guidelines
mentioned in article if they are correct. If not report it immediately. Ensure
that fine tuned article has similar tone to other articles.

Articles are grouped into categories, with the numeric prefix (100, 200, 300...)
defining reading order. Treat the category as a single continuous walkthrough,
not a bag of independent posts. When reviewing or editing an article, check
that:

- The opening of each article builds on the outcome of the previous article in
  the same category. The reader should feel they are picking up where the last
  article left off - not starting from scratch. Read the neighbouring articles
  (the one before and the one after) before editing so transitions line up.
- Within an article, each section and step is framed as a natural consequence of
  what came before it. The reader should never have to ask "why are we doing
  this now?" - the motivation for each step should come from the state or
  problem the previous step established.
- Flag structural gaps: orphaned sections, steps that don't flow from prior
  context, weak openers that restate the title instead of connecting to the
  previous article, or trailing content that doesn't set up the next one.

## New articles

When asked to write or add a new article, always ask the user for a hero image
(unless one was already provided). Every article is expected to have one, named
after the article file (e.g. `300-tunnelr.md` -> `300-tunnelr.jpg`) and placed
next to it. Match existing hero images in cyberpunk/neon illustration style.

## Image sizes

Heroes display at most 512px wide (`.article-hero`) and article content is 800px
wide, so keep images small:

- Hero images: JPEG, max 1024px wide (e.g. 1024x559 or 1024x1024), ~100-170KB.
- Inline images: JPEG, max 1600px wide / 1400px tall, ideally under 150KB.
- Make sure the file extension matches the real format (no PNGs named `.jpg`).

Resize/recompress any provided image that exceeds these limits, e.g. with
ffmpeg:

```bash
ffmpeg -i input.jpg -vf "scale='min(1024,iw)':-2,format=yuvj420p" \
  -map_metadata -1 -q:v 4 output.jpg
```

For inline images, use
`scale='min(1600,iw)':'min(1400,ih)':force_original_aspect_ratio=decrease`
instead.

## Build Commands

```bash
# Build the static site (outputs to dist/)
deno task build

# Serve locally after building
python -m http.server -d dist 4000
```

## Architecture

This is a **Deno-based static site generator** for a personal blog deployed to
GitHub Pages.

### Build Pipeline (build.js)

1. Reads Markdown articles from `articles/{category}/YYYY-MM-DD-*.md` with YAML
   frontmatter
2. Converts Markdown to HTML using `marked`
3. Applies syntax highlighting with `shiki` (synthwave-84 theme)
4. Generates static HTML using JavaScript template functions in `templates/`
5. Copies article images to `dist/assets/images/articles/`
6. Outputs complete site to `dist/`

### Template System

Templates are ES module functions returning HTML strings:

- `layout.js` - Base HTML wrapper (nav, sidebar, theme toggle)
- `home-page.js` - Home page with recent articles
- `article-page.js` - Individual article view
- `article-card.js` - Reusable article card component
- `category-page.js` - Category listing
- `about-page.js` - About page

All templates receive a context object containing site metadata, categories, and
date formatter.

### Theme System

Dark/light mode via CSS variables with `[data-theme="dark"]` selector. Toggle
persists to localStorage.

### Content Structure

Directory structure:

```
articles/{category-slug}/
  NNN-article-slug.md          # NNN = order index (100, 200, 300...)
  NNN-article-slug.jpg         # optional hero image (matches article filename)
  images/                       # inline images referenced in markdown
```

Categories: `general`, `build-anywhere`, `build-on-the-go`, `build-in-terminal`,
`tools`

YAML frontmatter:

```yaml
---
title: Article Title
excerpt: Short description
date: YYYY-MM-DD
---
```

The numeric prefix (100, 200, 300...) controls article order within a category.
Use gaps (100s) to allow inserting articles between existing ones. The `date`
field in frontmatter tracks when the article was last updated and is used for
"most recent" sorting on the home page.

Inline images: reference as `images/filename.jpg` in markdown.

### Deployment

Automatic via GitHub Actions on push to `main` branch. Deploys to GitHub Pages.
