# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static blog site built with Deno. The site is generated from markdown posts using a custom static site generator (SSG) written in JavaScript. Unlike typical Jekyll sites, this uses Deno's runtime with modern JavaScript modules, Shiki for syntax highlighting, and custom template functions.

**Build System**: Deno-based static site generator (build.js)
**Deployment**: GitHub Actions to GitHub Pages
**Live site**: https://sobanieca.github.io

## Build Commands

```bash
# Build the entire site (generates HTML in dist/)
deno task build

# Build with manual Deno flags
deno run --allow-read --allow-write --allow-env build.js
```

The build process:
1. Reads markdown files from `_posts/{category}/YYYY-MM-DD-title.md`
2. Parses YAML front matter and converts markdown to HTML using marked
3. Applies Shiki syntax highlighting with synthwave-84 theme
4. Generates static HTML using JavaScript template functions
5. Outputs to `dist/` directory

## Architecture

### Build Pipeline (build.js)

The build script orchestrates the entire static site generation:

1. **Syntax Highlighting Setup**: Initializes Shiki with synthwave-84/tokyo-night themes and configures marked renderer
2. **Post Reading**: Recursively scans `_posts/` subdirectories (organized by category) and parses front matter
3. **Page Generation**: Creates three types of pages:
   - Home page (index.html) - featured post hero + recent posts grid
   - Individual post pages (dist/blog/{slug}.html) - full post content with breadcrumbs
   - Category pages (dist/category/{slug}.html) - filtered post lists per category
4. **Asset Copying**: Copies CSS from assets/ to dist/

### Template System (templates/)

All templates are JavaScript functions that return HTML strings:

- `layout.js` - Base HTML structure with sidebar navigation and category nav
- `home-page.js` - Home page with hero section + recent posts grid
- `post-page.js` - Individual post page with breadcrumbs and category tag
- `category-page.js` - Category-filtered post listing
- `post-card.js` - Reusable post card component

Templates accept a context object containing:
- `siteTitle`, `siteAuthor` - Site metadata
- `categories` - Category definitions (name, icon, description, slug)
- `formatDate` - Date formatting helper

### Categories

Categories are hard-coded in build.js (lines 11-42):
- general
- build-remotely
- build-anywhere
- neovim
- tools

Each category has: name, icon identifier, description, and slug. Posts inherit their category from the subdirectory they're in (`_posts/{category}/`).

### Content Structure

Posts are organized as: `_posts/{category}/YYYY-MM-DD-post-title.md`

Front matter format:
```yaml
---
title: "Post Title"
date: YYYY-MM-DD
categories: [category-name]  # Inherited from directory if omitted
excerpt: "Short description for previews"
---
```

The filename determines the slug (date prefix removed): `2024-01-15-my-post.md` → `/blog/my-post.html`

## Key Implementation Details

- **Marked Configuration**: Custom renderer intercepts code blocks to apply Shiki highlighting (build.js:133-155)
- **Front Matter Parsing**: Regex-based extraction using YAML parser (build.js:45-54)
- **Post Sorting**: Descending by date (build.js:103-105)
- **URL Structure**: Posts use `/blog/{slug}.html`, categories use `/category/{slug}.html`
- **Static Assets**: Only CSS is copied; no images or other assets currently

## Deployment

GitHub Actions workflow (`.github/workflows/build.yml`) runs on:
- Pushes to `main` branch
- Pull requests to `main`
- Manual workflow dispatch

The workflow:
1. Checks out code
2. Sets up Deno v1.x
3. Runs `deno task build`
4. Uploads `dist/` artifact
5. Deploys to GitHub Pages (main branch only)

## Dependencies

Defined in `deno.json`:
- `marked@^12.0.0` - Markdown to HTML conversion
- `yaml@^2.3.4` - YAML front matter parsing
- `shiki@^1.24.2` - Syntax highlighting with VS Code themes
