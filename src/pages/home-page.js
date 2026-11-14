import { component } from 'imp'
import { div, h1, header, p } from 'imp/html'
import { articleCard } from '../article-card.js'
import { articles } from '../data.js'
import { siteCss } from '../styles/site.js'

export const homePage = component('blog-home-page', {
  styles: siteCss,
  setup: () =>
    div(
      { class: 'home-page' },
      header(
        { class: 'category-header' },
        h1('Recently Updated'),
        p({ class: 'category-description' }, 'Latest updates to the collection'),
      ),
      div({ class: 'card-grid' }, articles.slice(0, 3).map(articleCard)),
    ),
})
