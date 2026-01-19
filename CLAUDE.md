# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

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
  YYYY-MM-DD-article-slug.md
  YYYY-MM-DD-article-slug.jpg  # optional hero image (matches article filename)
  images/                       # inline images referenced in markdown
```

Categories: `general`, `build-anywhere`, `build-on-the-go`, `build-in-terminal`,
`tools`

YAML frontmatter (only title and excerpt):

```yaml
---
title: Article Title
excerpt: Short description
---
```

Inline images: reference as `images/filename.jpg` in markdown.

### Deployment

Automatic via GitHub Actions on push to `main` branch. Deploys to GitHub Pages.
