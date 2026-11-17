import { div, el, h2 } from 'imp/html'

// The Giscus comments under an article. Giscus finds its container with document.querySelector,
// so the section lives in the light DOM of the layout, under the screen of the router. The article
// page shows it when it mounts and hides it when it leaves.

const container = div({ id: 'giscus-container' })

export const commentsSection = div(
  { class: 'article-page', hidden: true },
  div({ class: 'article-comments' }, h2('Comments'), container),
)

// The theme of Giscus for the theme of the site. Giscus loads the light stylesheet from the site,
// so a local server uses the one of the live site.
const giscusTheme = (dark) => {
  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  const origin = local ? 'https://adam.sobaniec.com' : location.origin
  return dark ? 'purple_dark' : `${origin}/assets/css/giscus-light.css`
}

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark'

// Loads the discussion of an article. A fresh script on each article loads the discussion of that
// article. The discussions were started when an article lived at /articles/<slug>, so the term is
// that path, and not the address with the category.
export const showComments = (slug) => {
  commentsSection.hidden = false
  container.replaceChildren(
    el('script', {
      src: 'https://giscus.app/client.js',
      'data-repo': 'sobanieca/sobanieca.github.io',
      'data-repo-id': 'R_kgDOQmdbKA',
      'data-category': 'Giscuss Comments',
      'data-category-id': 'DIC_kwDOQmdbKM4C0kgc',
      'data-mapping': 'specific',
      'data-term': `articles/${slug}`,
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-theme': giscusTheme(isDark()),
      'data-lang': 'en',
      'data-loading': 'lazy',
      crossOrigin: 'anonymous',
      async: true,
    }),
  )
}

export const hideComments = () => {
  commentsSection.hidden = true
  container.replaceChildren()
}

// Switches the theme of a loaded discussion
export const setCommentsTheme = (dark) => {
  const iframe = document.querySelector('iframe.giscus-frame')
  iframe?.contentWindow.postMessage(
    { giscus: { setConfig: { theme: giscusTheme(dark) } } },
    'https://giscus.app',
  )
}
