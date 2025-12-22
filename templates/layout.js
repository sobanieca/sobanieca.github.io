export function layout(content, title, activeCategory, { siteTitle, siteAuthor, categories }) {
  const categoriesNav = Object.entries(categories)
    .map(
      ([key, cat]) => `
      <li class="nav-item">
        <a href="/category/${cat.slug}.html" class="${
        activeCategory === cat.slug ? "active" : ""
      }">
          <span>${cat.name}</span>
        </a>
      </li>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title ? `${title} - ` : ""}${siteTitle}</title>
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
  <div class="page-wrapper">
    <aside class="sidebar">
      <a href="/" class="site-title">${siteTitle}</a>
      <nav>
        <ul class="nav-categories">
          ${categoriesNav}
        </ul>
      </nav>
    </aside>

    <main class="main-content">
      ${content}
      <footer>
        <p>&copy; ${new Date().getFullYear()} ${siteAuthor}. Built with Deno.</p>
      </footer>
    </main>
  </div>
</body>
</html>`;
}
