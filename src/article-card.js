import { a, article, div, h2, p, span } from 'imp/html'
import { categoryBySlug } from './data.js'

const categoryColors = {
  general: 1,
  'build-anywhere': 2,
  neovim: 3,
  'build-on-the-go': 4,
}

// The card of an article on the home page and on a category page
export const articleCard = (item) => {
  const category = categoryBySlug(item.category)
  const header = item.image
    ? div({
        class: `article-card-header category-${categoryColors[item.category] || 1}`,
        style: {
          backgroundImage: `url('${item.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      })
    : div(
        { class: `article-card-header category-${categoryColors[item.category] || 1}` },
        span({ class: 'article-card-title-bg' }, item.title),
      )

  return article(
    { class: 'article-card' },
    header,
    div(
      { class: 'article-card-content' },
      div(
        { class: 'article-card-meta' },
        a({ href: category?.url, class: 'category-tag' }, category?.name ?? item.category),
        span({ class: 'article-date' }, item.dateShort),
      ),
      h2({ class: 'article-title' }, a({ href: item.url }, item.title)),
      p({ class: 'article-excerpt' }, item.excerpt),
      a({ href: item.url, class: 'read-more' }, 'Read more →'),
    ),
  )
}
