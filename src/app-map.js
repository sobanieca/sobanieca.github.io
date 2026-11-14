import { appMap } from 'imp'
import { articles } from './content/articles-map.js'
import { category } from './content/categories-map.js'

// The pages of the site. The categories and the articles are generated from articles/ by cargo content.
export const app = appMap({
  aboutMe: 'Adam Sobaniec, a software developer who likes to build software anywhere',
  projects: 'Open source tools Adam Sobaniec builds in his free time',
  category,
  articles,
})
