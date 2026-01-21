# Sobanieca's Development Blog

👋 Hi, I'm @sobanieca! I'm interested in everything related to JavaScript.

## About This Repo

This repository hosts my personal development blog built with Deno and Claude.
Visit the site to read my latest posts about web development, JavaScript and
Deno.

## Local Development

To run this blog locally:

1. Install [Deno](https://deno.land/)
2. Clone this repository
3. Build the site:
   ```bash
   deno task build
   ```
4. Serve the `dist/` directory with any static file server:
   ```bash
   deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts dist
   ```
5. Open your browser to `http://localhost:4000`

## Technology Stack

- **Runtime**: Deno
- **Markdown Parser**: marked
- **Syntax Highlighting**: Shiki (synthwave-84 theme)
- **Template Engine**: JavaScript template functions
- **Deployment**: GitHub Actions → GitHub Pages

## Deployment

The site is automatically built and deployed to GitHub Pages when changes are
pushed to the `main` branch using GitHub Actions.

**Live site**: https://adam.sobaniec.com

## Acknowledgments

This project uses the following open source libraries:

- [Deno](https://deno.com) - JavaScript/TypeScript runtime
- [marked](https://github.com/markedjs/marked) - Markdown parser
- [Shiki](https://github.com/shikijs/shiki) - Syntax highlighting
- [yaml](https://github.com/eemeli/yaml) - YAML parser
