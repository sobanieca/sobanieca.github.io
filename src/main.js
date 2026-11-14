import { flag, init, mount } from 'imp'
import { onAnalytics } from 'imp/analytics'
import { alySink } from 'imp/analytics/aly'
import { layout } from './layout.js'
import { routeLinkClicks } from './links.js'
import { siteCss } from './styles/site.js'
import { darkTheme, lightTheme } from './themes.js'

// On only in the prod environment (deno task publish), so a local build sends nothing
if (flag('ANALYTICS')) {
  onAnalytics(alySink({ app: 'sobanieca-blog', servers: ['https://aly.admware.com'] }))
}

await init({ themes: ['system', lightTheme, darkTheme], theme: 'system', persist: true })

// The layout renders in the light DOM, so the stylesheet of the site applies to the document too
const sheet = new CSSStyleSheet()
sheet.replaceSync(siteCss)
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]

routeLinkClicks()
mount('#app', layout())
