# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Fine tuning articles

When asked to fine tune given article perform grammar/syntax corrections. Do all
that is possible to keep original intent/context. Double check all guidelines
mentioned in article if they are correct. If not report it immediately. Ensure
that fine tuned article has similar tone to other articles.

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
