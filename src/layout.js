import { a, button, div, footer, h2, html, img, main, nav, p, span } from 'imp/html'
import { redirect, router, useRoute } from 'imp/router'
import { appliedTheme, colorSchemeOf, theme } from 'imp/theme'
import { app } from './app-map.js'
import { commentsSection, setCommentsTheme } from './comments.js'
import { articleScreens, categoryScreens } from './content/routes.js'
import { categories, pageTitles } from './data.js'
import { aboutPage } from './pages/about-page.js'
import { homePage } from './pages/home-page.js'
import { notFoundPage } from './pages/not-found-page.js'
import { projectsPage } from './pages/projects-page.js'
import { SITE_AUTHOR, SITE_TITLE } from './site.js'
import { darkTheme, lightTheme } from './themes.js'

// The frame of the site: the sidebar, the screen of the router, the comments and the footer. It
// renders in the light DOM with the stylesheet of the site that main.js adopts, and updates
// itself from the route and the theme.

const projectsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>`
const arrowIcon = `<svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`
const recentIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`
const moonIcon = `<svg class="moon-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>`

const screens = {
  [app]: () => homePage(),
  [app.aboutMe]: () => aboutPage(),
  [app.projects]: () => projectsPage(),
  [app.category]: redirect(app),
  [app.articles]: redirect(app),
  ...categoryScreens,
  ...articleScreens,
}

const pageTitle = ({ node }) => {
  const title = pageTitles[`${node}`]
  return title ? `${title} - ${SITE_TITLE}` : SITE_TITLE
}

// The sidebar link that is active on a path: '' for the home page, 'projects', or a category slug
const activeKey = (path) => {
  if (path === '/') return ''
  if (path === app.projects.href()) return 'projects'
  return path.match(/^\/category\/([^/]+)$/)?.[1] ?? null
}

const isDark = () => colorSchemeOf(appliedTheme.get().tokens) === 'dark'

export const layout = () => {
  const menuToggle = button(
    { id: 'menu-toggle', 'aria-label': 'Toggle menu' },
    span(),
    span(),
    span(),
  )

  const projectsLink = a(
    { href: app.projects.href(), class: 'sidebar-projects-link', 'data-key': 'projects' },
    html(projectsIcon),
    span('Projects'),
    html(arrowIcon),
  )

  const navLinks = [
    a({ href: app.href(), 'data-key': '' }, html(recentIcon), span('Recently updated')),
    ...categories.map((category) =>
      a(
        { href: category.url, 'data-key': category.slug },
        category.icon && html(category.icon),
        span(category.name),
      ),
    ),
  ]

  const darkModeToggle = button(
    {
      class: 'dark-mode-toggle',
      id: 'darkModeToggle',
      'aria-label': 'Dark mode',
      events: { click: () => theme.set(isDark() ? lightTheme.name : darkTheme.name) },
    },
    html(moonIcon),
    span('Dark Mode'),
    div({ class: 'toggle-switch' }, div({ class: 'toggle-slider' })),
  )

  const sidebar = div(
    { id: 'sidebar' },
    div(
      { class: 'profile' },
      div({ class: 'profile-avatar' }, img({ src: '/assets/images/avatar.jpg', alt: SITE_AUTHOR })),
      div(
        { class: 'profile-info' },
        a(
          { href: app.aboutMe.href(), class: 'profile-name-link' },
          h2({ class: 'profile-name' }, SITE_AUTHOR),
        ),
        p({ class: 'profile-title' }, 'Software Developer'),
      ),
    ),
    projectsLink,
    nav(navLinks),
    darkModeToggle,
    img({ class: 'sidebar-bg', src: '/assets/images/sidebar.png', alt: '' }),
  )

  const setMenuOpen = (open) => {
    sidebar.classList.toggle('active', open)
    menuToggle.classList.toggle('active', open)
  }
  menuToggle.addEventListener('click', () => setMenuOpen(!sidebar.classList.contains('active')))
  document.addEventListener('click', (event) => {
    const path = event.composedPath()
    if (globalThis.innerWidth <= 768 && !path.includes(sidebar) && !path.includes(menuToggle)) {
      setMenuOpen(false)
    }
  })

  // The screen region takes the focus on a change of page, so a screen reader reads the new page
  const screenFrame = div(
    { class: 'screen-frame', tabindex: '-1', role: 'region' },
    router({
      map: app,
      screens,
      title: pageTitle,
      loading: () => div(),
      error: () =>
        div(
          { class: 'category-header' },
          p({ class: 'category-description' }, 'This page failed to load. Reload to try again.'),
        ),
      notFound: () => notFoundPage(),
    }),
  )

  const route = useRoute()
  let lastPath = route.get().path
  const onRoute = ({ path }) => {
    const key = activeKey(path)
    projectsLink.classList.toggle('active', key === 'projects')
    for (const link of navLinks) link.classList.toggle('active', link.dataset.key === key)
    setMenuOpen(false)

    const moved = path !== lastPath
    lastPath = path
    queueMicrotask(() => {
      screenFrame.setAttribute('aria-label', document.title)
      if (moved) screenFrame.focus({ preventScroll: true })
    })
  }
  onRoute(route.get())
  route.watch(onRoute)

  const applyTheme = () => {
    const dark = isDark()
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    setCommentsTheme(dark)
  }
  applyTheme()
  appliedTheme.watch(applyTheme)

  return [
    menuToggle,
    sidebar,
    main(
      { class: 'main-content' },
      screenFrame,
      commentsSection,
      footer(
        p(
          `© ${new Date().getFullYear()} ${SITE_AUTHOR}. Built with `,
          a({ href: 'https://imp-ui.com', target: '_blank', rel: 'noopener' }, 'imp'),
          ', ',
          a({ href: 'https://www.rust-lang.org', target: '_blank', rel: 'noopener' }, 'Rust'),
          ' and ',
          a({ href: 'https://claude.ai', target: '_blank', rel: 'noopener' }, 'Claude'),
          '.',
        ),
      ),
    ),
  ]
}
