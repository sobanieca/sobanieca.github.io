# sobanieca's Development Blog

👋 Hi, I'm @sobanieca! I'm interested in everything related to JavaScript.

🌱 Currently learning Deno and Serverless technologies.

## About This Repo

This repository hosts my personal development blog built with Jekyll. Visit the site to read my latest posts about web development, JavaScript, Deno, and serverless architectures.

## Local Development

To run this blog locally:

1. Install Ruby (3.2 or higher) and Bundler
2. Clone this repository
3. Install dependencies:
   ```bash
   bundle install
   ```
4. Run the Jekyll server:
   ```bash
   bundle exec jekyll serve
   ```
5. Open your browser to `http://localhost:4000`

## Project Structure

```
.
├── _config.yml          # Jekyll configuration
├── _layouts/            # Page templates
├── _posts/              # Blog posts (markdown files)
├── _includes/           # Reusable components
├── index.md             # Homepage
├── blog.md              # Blog listing page
├── about.md             # About page
└── .github/workflows/   # GitHub Actions for deployment
```

## Writing Posts

Create new posts in the `_posts/` directory with the naming convention:
```
YYYY-MM-DD-title-of-post.md
```

Each post should have front matter:
```yaml
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS +0000
tags: [tag1, tag2]
---
```

## Deployment

The site is automatically built and deployed to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

**Live site**: https://sobanieca.github.io
