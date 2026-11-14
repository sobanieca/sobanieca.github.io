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
3. Set up git hooks:
   ```bash
   ./git-hooks/setup.sh
   ```
4. Install [imp](https://github.com/sobanieca/imp-ui):
   ```bash
   curl -fsSL https://sobanieca.github.io/imp-ui/install.sh | bash
   ```
5. Generate the content and start the dev server with live reload:
   ```bash
   deno task dev
   ```
6. Open your browser to `http://localhost:4400`

To build the static site into `dist/`, run `deno task build`.

## Technology Stack

- **Runtime**: Deno
- **Markdown Parser**: marked
- **Syntax Highlighting**: Shiki (synthwave-84 theme)
- **UI**: [imp](https://github.com/sobanieca/imp-ui), each article a lazily
  loaded area
- **Analytics**: [imp-aly](https://github.com/sobanieca/imp-aly)
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
- [imp](https://github.com/sobanieca/imp-ui) - Buildless UI toolkit
