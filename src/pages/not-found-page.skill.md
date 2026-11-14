notFoundPage - the router's page for a path that is not a page of the site.

```js
import { notFoundPage } from './pages/not-found-page.js'

router({ map: app, screens, notFound: () => notFoundPage() })
```

- No props. A path that ends in `.html` (the addresses before the move to imp, such as
  `/articles/jsonr.html` or `/index.html`) is replaced with the same path without it, keeping the
  query and the fragment. Any other path shows "Page not found" with a link home.
