import { component } from 'imp'
import { button, div, h1, header, html, p, section, span } from 'imp/html'
import { computed, initState } from 'imp/state'
import { articleCard } from '../article-card.js'
import { articles, categoryBySlug } from '../data.js'
import { siteCss } from '../styles/site.js'

const sortIcon = `<svg class="sort-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/></svg>`

export const categoryPage = component('blog-category-page', {
  styles: siteCss,
  setup: (self, slug) => {
    const category = categoryBySlug(slug)
    const categoryArticles = articles
      .filter((article) => article.category === slug)
      .sort((x, y) => x.order - y.order)
    const descending = initState(self, 'blog.sortDescending', false)

    const sortToggle =
      categoryArticles.length > 1
      && button(
        {
          class: computed([descending], (desc) => ['sort-toggle', desc && 'desc']),
          title: 'Change sort order',
          events: { click: () => descending.set((desc) => !desc) },
        },
        html(sortIcon),
        span(descending.text((desc) => (desc ? 'Descending' : 'Ascending'))),
      )

    const grid = categoryArticles.length
      ? div(
          { class: 'card-grid' },
          descending.view((desc) =>
            (desc ? [...categoryArticles].reverse() : categoryArticles).map(articleCard),
          ),
        )
      : div(
          { class: 'empty-state' },
          p('No articles in this category yet.'),
          p('Check back soon for new content!'),
        )

    return div(
      { class: 'category-page' },
      header(
        { class: 'category-header' },
        div({ class: 'category-header-row' }, h1(category.name), sortToggle),
        p({ class: 'category-description' }, category.description),
      ),
      section({ class: 'articles-grid' }, grid),
    )
  },
})
