# Sobanieca's Development Blog

👋 Hi, I'm @sobanieca! I'm interested in everything related to JavaScript.

## About This Repo

This repository hosts my personal development blog built with imp and Claude.
Visit the site to read my latest posts about building software on remote
machines, in the terminal and on the go.

## Local Development

To run this blog locally:

1. Install [Rust](https://www.rust-lang.org/tools/install)
2. Clone this repository
3. Set up git hooks:
   ```bash
   ./git-hooks/setup.sh
   ```
4. Install [imp](https://github.com/sobanieca/imp-ui):
   ```bash
   curl -fsSL https://imp-ui.com/install.sh | bash
   ```
5. Generate the content and start the dev server with live reload:
   ```bash
   cargo dev
   ```
6. Open your browser to `http://localhost:4400`

To build the static site into `dist/`, run `cargo site`, and `cargo serve` to
serve it. `cargo verify` runs the checks of CI.

## Technology Stack

- **Build**: Rust (`xtask/`, run through cargo aliases)
- **Markdown Parser**: pulldown-cmark
- **Syntax Highlighting**: imp's `codeBlock`, in the browser
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

- [pulldown-cmark](https://github.com/pulldown-cmark/pulldown-cmark) - Markdown
  parser
- [serde_json](https://github.com/serde-rs/json) - JSON serializer
- [anyhow](https://github.com/dtolnay/anyhow) - Error handling
- [imp](https://github.com/sobanieca/imp-ui) - Buildless UI toolkit
