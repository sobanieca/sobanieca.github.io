import { navigate } from 'imp/router'

// Scrolls to the element of a #fragment. The content of a page renders in a shadow root, where the
// browser does not look for the target of a fragment, so look in the root of the link first.
export const scrollToFragment = (root, hash) => {
  if (!hash || hash === '#') return false
  const id = decodeURIComponent(hash.slice(1))
  const target = root?.getElementById?.(id) ?? document.getElementById(id)
  target?.scrollIntoView()
  return Boolean(target)
}

// The links of the site are plain anchors, also inside the rendered articles. A left click on a
// page of the site navigates with the router, with no reload. A file such as an image, a link
// with a target or a modifier key, and a link to another site stay with the browser.
export const routeLinkClicks = () => {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = event
      .composedPath()
      .find((node) => node instanceof HTMLAnchorElement && node.hasAttribute('href'))
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return

    const url = new URL(anchor.href, location.href)
    if (url.origin !== location.origin) return

    const samePage = url.pathname === location.pathname && url.search === location.search
    if (samePage && url.hash) {
      event.preventDefault()
      history.replaceState(history.state, '', url.hash)
      scrollToFragment(anchor.getRootNode(), url.hash)
      return
    }

    // A page of the site has no extension: /articles/tools/jsonr, /category/tools
    if (/\.[a-z0-9]+$/i.test(url.pathname)) return
    event.preventDefault()
    navigate(url.pathname + url.search + url.hash)
  })
}
