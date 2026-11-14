import { component } from 'imp'
import { a, article, div, h1, h2, header, html, p, span } from 'imp/html'
import { siteCss } from '../styles/site.js'

// The open source projects, with a link to the article about each one
const PROJECTS = [
  {
    name: 'jsonr',
    tagline: 'JSON APIs from the terminal',
    description:
      'A simple CLI for sending requests stored in .http files. Keeps secrets out of your repository and LLM context, switches environments with a flag, and lets you chain requests into smoke tests with plain JavaScript.',
    website: 'https://adam.sobaniec.com/jsonr/',
    github: 'https://github.com/sobanieca/jsonr',
    article: '/articles/jsonr',
    icon: `<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>`,
  },
  {
    name: 'sqlr',
    tagline: 'SQL databases from the terminal',
    description:
      'Query PostgreSQL, MySQL, MSSQL, ClickHouse and SQLite with one small CLI. Connections are scoped to the git repository, results come out as JSON or tables, and queries can live in versioned .sql files.',
    website: 'https://adam.sobaniec.com/sqlr/',
    github: 'https://github.com/sobanieca/sqlr',
    article: '/articles/sqlr',
    icon: `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>`,
  },
  {
    name: 'remote-file-manager',
    tagline: 'Web file explorer for remote machines',
    description:
      'Run rfm on a remote machine and browse its files from the browser. Dual-pane mode, fuzzy search, code viewer and editor, git status, diffs and worktrees, and clipboard uploads. Built for SSH port forwarding and works great on a phone.',
    website: 'https://adam.sobaniec.com/remote-file-manager/',
    github: 'https://github.com/sobanieca/remote-file-manager',
    article: '/articles/working-with-remote-machine',
    icon: `<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>`,
  },
  {
    name: 'tunnelr',
    tagline: 'Expose local ports through a cheap VPS',
    description:
      'One binary that runs as a server on a VPS and as a client on your machine. Needs only two open ports, installs itself as a systemd service, and remembers your connections so opening a tunnel is just typing tunnelr.',
    website: 'https://adam.sobaniec.com/tunnelr/',
    github: 'https://github.com/sobanieca/tunnelr',
    article: '/articles/tunnelr',
    icon: `<path d="M4 20V10a8 8 0 0 1 16 0v10"/><path d="M9 20v-6a3 3 0 0 1 6 0v6"/><path d="M2 20h20"/>`,
  },
  {
    name: 'todoer',
    tagline: 'Todos and pull requests as plain files in git',
    description:
      'Keeps the todos and pull requests of a git project next to the code. AI agents and people claim todos, work in git worktrees, and review one-commit pull requests line by line in the terminal. One binary, no database, server or account.',
    website: 'https://adam.sobaniec.com/todoer/',
    github: 'https://github.com/sobanieca/todoer',
    article: '/articles/todoer',
    icon: `<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>`,
  },
  {
    name: 'yate',
    tagline: 'Yet another text editor',
    description:
      'A terminal editor somewhere between nano and Neovim. No modes and the keys you need on screen, plus a file tree, fuzzy file finder, live grep, split view and go to definition without a language server. Made for reading code next to an AI agent in a tmux pane.',
    website: 'https://adam.sobaniec.com/yate',
    github: 'https://github.com/sobanieca/yate',
    article: '/articles/yate',
    icon: `<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>`,
  },
  {
    name: 'imp',
    tagline: 'A frontend toolkit in one binary',
    description:
      'The dev server, component library, state, router, test runner, linter, formatter and bundler in one file. Components are real web components, development has no build step, and the production build is static files for any CDN.',
    website: 'https://imp-ui.com',
    github: 'https://github.com/sobanieca/imp-ui',
    article: '/articles/imp',
    icon: `<rect width="7" height="7" x="14" y="3" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/>`,
  },
]

const githubIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`

const projectIcon = (paths) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

const projectCard = (project) =>
  article(
    { class: 'project-card' },
    div(
      { class: 'project-card-header' },
      div({ class: 'project-icon' }, html(projectIcon(project.icon))),
      div(
        h2(
          { class: 'project-name' },
          a({ href: project.website, target: '_blank', rel: 'noopener' }, project.name),
        ),
        p({ class: 'project-tagline' }, project.tagline),
      ),
    ),
    p({ class: 'project-description' }, project.description),
    div(
      { class: 'project-links' },
      a(
        { href: project.website, target: '_blank', rel: 'noopener', class: 'project-link primary' },
        'Website →',
      ),
      a(
        { href: project.github, target: '_blank', rel: 'noopener', class: 'project-link' },
        html(githubIcon),
        span('GitHub'),
      ),
      project.article && a({ href: project.article, class: 'project-link' }, 'Read article'),
    ),
  )

export const projectsPage = component('blog-projects-page', {
  styles: siteCss,
  setup: () =>
    div(
      { class: 'projects-page' },
      header(
        { class: 'category-header' },
        h1('Projects'),
        p(
          { class: 'category-description projects-intro' },
          'I work on these projects in my free time, whenever I get the chance. Being able to ',
          a({ href: '/category/build-on-the-go' }, 'code on mobile'),
          ' gives me quite a few opportunities.',
        ),
      ),
      div({ class: 'projects-grid' }, PROJECTS.map(projectCard)),
    ),
})
