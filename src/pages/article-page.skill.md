articlePage - the screen of one article: header, hero, the rendered body with its highlighted code blocks, prev/next links, and the comments under it.

```js
import { articlePage } from './pages/article-page.js'

articlePage('jsonr', '<p>...</p><div data-code="0"></div>', [
  { language: 'bash', code: 'jsonr --help' },
])
```

| Argument  | Type   | Notes                                                        |
| --------- | ------ | ------------------------------------------------------------ |
| `slug`    | string | the article slug; its metadata comes from `src/data.js`      |
| `content` | string | trusted HTML that `cargo content` rendered from the Markdown |
| `code`    | array  | the code blocks, `{ language, code }`, props of codeBlock    |

- Never import it eagerly. Each generated area module `src/content/articles/<slug>.js` calls it
  with the body of its article, so a visit downloads only that article.
- Each `<div data-code="N">` of the body is replaced by `codeBlock(code[N])` from `imp/std/display`,
  which highlights the code with the colours of the theme and adds a copy button.
- `onMount` shows the Giscus comments of the layout (`src/comments.js`) and scrolls to
  `location.hash`; `onRemove` hides them. The body lives in a shadow root, so a `#fragment` is
  resolved by `scrollToFragment` from `src/links.js`, not by the browser.
