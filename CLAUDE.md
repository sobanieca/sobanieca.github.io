# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal development blog built with Jekyll and deployed to GitHub Pages. The site focuses on JavaScript, Deno, and serverless technologies. Live at: https://sobanieca.github.io

## Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Start local development server (http://localhost:4000)
bundle exec jekyll serve

# Build the site (output to _site/)
bundle exec jekyll build
```

### Production Build
```bash
# Build with production environment
JEKYLL_ENV=production bundle exec jekyll build
```

## Architecture

### Jekyll Configuration
- **Theme**: Minima 2.5
- **Markdown**: Kramdown
- **Plugins**: jekyll-feed, jekyll-seo-tag, jekyll-paginate
- **Pagination**: 5 posts per page
- **Permalink structure**: `/blog/:year/:month/:day/:title/`

### Directory Structure
- `_layouts/`: Page templates (default.html, post.html, page.html, home.html)
- `_posts/`: Blog posts in markdown format
- `_includes/`: Reusable components (currently empty)
- `_config.yml`: Jekyll site configuration
- `_site/`: Generated static site (excluded from git)

### Post Format
Blog posts must follow the naming convention `YYYY-MM-DD-title-of-post.md` and include front matter:
```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD HH:MM:SS +0000
tags: [tag1, tag2]
---
```

The default layout for posts is automatically set to "post" and author to "sobanieca" via _config.yml defaults.

### Deployment
GitHub Actions workflow (`.github/workflows/jekyll.yml`) automatically builds and deploys to GitHub Pages on push to `main` branch. The workflow:
1. Checks out code
2. Sets up Ruby 3.2 with bundler cache
3. Builds with `bundle exec jekyll build`
4. Deploys to GitHub Pages

Pull requests trigger builds but skip deployment.

## Content Guidelines

Posts are written in markdown and support:
- Standard markdown syntax processed by Kramdown
- Inline HTML for custom styling (see post.html layout for tag styling example)
- Liquid templating for dynamic content
- SEO metadata via jekyll-seo-tag plugin
- RSS feed generation via jekyll-feed plugin
