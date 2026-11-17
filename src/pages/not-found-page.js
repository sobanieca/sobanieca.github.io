import { component } from 'imp'
import { a, div, h1, header, p } from 'imp/html'
import { navigate } from 'imp/router'
import { app } from '../app-map.js'
import { articleBySlug } from '../data.js'
import { siteCss } from '../styles/site.js'

// The address of a page before the move to imp: /articles/jsonr.html, /index.html. And the address
// of an article before its category was part of it: /articles/jsonr
const legacyPath = (path) => {
  if (path === '/index.html') return '/'
  const bare = path.endsWith('.html') ? path.slice(0, -'.html'.length) : path
  const article = bare.match(/^\/articles\/([^/]+)$/)?.[1]
  if (article && articleBySlug(article)) return articleBySlug(article).url
  return bare === path ? null : bare
}

export const notFoundPage = component('blog-not-found-page', {
  styles: siteCss,
  setup: () => {
    // Old links keep working: send them to the page without the .html
    const target = legacyPath(location.pathname)
    if (target) {
      queueMicrotask(() => navigate(target + location.search + location.hash, { replace: true }))
      return div()
    }
    return div(
      { class: 'category-page' },
      header(
        { class: 'category-header' },
        h1('Page not found'),
        p(
          { class: 'category-description' },
          'This page does not exist. ',
          a({ href: app.href() }, 'See the recently updated articles'),
          '.',
        ),
      ),
    )
  },
})
