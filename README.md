# sobanieca's Development Blog

👋 Hi, I'm @sobanieca! I'm interested in everything related to JavaScript.

🌱 Currently learning Deno and Serverless technologies.

## About This Repo

This repository hosts my personal development blog built with Deno. Visit the
site to read my latest posts about web development, JavaScript, Deno, and
serverless architectures.

## Local Development

To run this blog locally:

1. Install [Deno](https://deno.land/) (v1.x or higher)
2. Clone this repository
3. Build the site:
   ```bash
   deno task build
   ```
4. Serve the `dist/` directory with any static file server:
   ```bash
   # Example with Python
   python -m http.server -d dist 4000

   # Example with Deno
   deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts dist
   ```
5. Open your browser to `http://localhost:4000`

## Project Structure

```
.
├── build.js             # Deno-based static site generator
├── deno.json            # Deno configuration and tasks
├── templates/           # JavaScript template functions
│   ├── layout.js        # Base HTML layout
│   ├── home-page.js     # Home page template
│   ├── post-page.js     # Post page template
│   ├── category-page.js # Category page template
│   └── post-card.js     # Post card component
├── _posts/              # Blog posts organized by category
│   ├── general/
│   ├── build-remotely/
│   ├── build-anywhere/
│   ├── neovim/
│   └── tools/
├── assets/              # Static assets (CSS)
├── dist/                # Generated site output
└── .github/workflows/   # GitHub Actions for deployment
```

## Writing Posts

Create new posts in the appropriate category subdirectory under `_posts/` with
the naming convention:

```
_posts/{category}/YYYY-MM-DD-title-of-post.md
```

Each post should have front matter:

```yaml
---
title: "Your Post Title"
date: YYYY-MM-DD
categories: [category-name]
excerpt: "Short description for previews"
---
```

Available categories: `general`, `build-remotely`, `build-anywhere`, `neovim`,
`tools`

## Technology Stack

- **Runtime**: Deno
- **Markdown Parser**: marked
- **Syntax Highlighting**: Shiki (synthwave-84 theme)
- **Template Engine**: JavaScript template functions
- **Deployment**: GitHub Actions → GitHub Pages

## Deployment

The site is automatically built and deployed to GitHub Pages when changes are
pushed to the `main` branch using GitHub Actions.

**Live site**: https://sobanieca.github.io
