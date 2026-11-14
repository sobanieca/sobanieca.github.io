articlePage - the screen of one article: header, hero, the rendered body, prev/next links, and the comments under it.

```js
import { articlePage } from './pages/article-page.js'

articlePage('jsonr', '<p>...</p>')
```

| Argument  | Type   | Notes                                                   |
| --------- | ------ | ------------------------------------------------------- |
| `slug`    | string | the article slug; its metadata comes from `src/data.js` |
| `content` | string | trusted HTML that build.js rendered from the Markdown   |

- Never import it eagerly. Each generated area module `src/content/articles/<slug>.js` calls it
  with the body of its article, so a visit downloads only that article.
- `onMount` shows the Giscus comments of the layout (`src/comments.js`) and scrolls to
  `location.hash`; `onRemove` hides them. The body lives in a shadow root, so a `#fragment` is
  resolved by `scrollToFragment` from `src/links.js`, not by the browser.
