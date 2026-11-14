aboutPage - the "About Me" screen at `/about-me`: intro, social links and the body of about.md.

```js
import { aboutPage } from './pages/about-page.js'

aboutPage()
```

- No props. It reads `about` (front matter + rendered HTML of `about.md`) from `src/data.js`.
