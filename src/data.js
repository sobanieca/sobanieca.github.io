import { about, articles, categories } from './content/site-data.js'

export { about, articles, categories }

export const categoryBySlug = (slug) => categories.find((category) => category.slug === slug)

export const articleBySlug = (slug) => articles.find((article) => article.slug === slug)

// The title of each page by its path, for document.title. The home page has none.
export const pageTitles = {
  '/about-me': about.title,
  '/projects': 'Projects',
  ...Object.fromEntries(categories.map((category) => [category.url, category.name])),
  ...Object.fromEntries(articles.map((article) => [article.url, article.title])),
}
