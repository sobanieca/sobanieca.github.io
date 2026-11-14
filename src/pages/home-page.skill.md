homePage - the "Recently Updated" screen at `/`: the three most recently updated articles as cards.

```js
import { homePage } from './pages/home-page.js'

homePage()
```

- No props. It reads `articles` from `src/data.js`, which is sorted by date, newest first.
- Renders in its own shadow root with `siteCss`, like every screen of the site.
