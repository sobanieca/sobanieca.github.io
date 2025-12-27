export function layout(content, title, activeCategory, { siteTitle, siteAuthor, categories }) {
  const categoriesNav = Object.entries(categories)
    .map(
      ([key, cat]) => `<a href="/category/${cat.slug}.html" class="${
        activeCategory === cat.slug ? "active" : ""
      }">${cat.name}</a>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title ? `${title} - ` : ""}${siteTitle}</title>
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/markdown.css">
  <link rel="stylesheet" href="/assets/css/shiki.css">
</head>
<body>
  <button id="menu-toggle" aria-label="Toggle menu">
    <span></span>
    <span></span>
    <span></span>
  </button>

  <div id="sidebar">
    <h1>${siteTitle}</h1>
    <nav>
      ${categoriesNav}
    </nav>
    <img src="/assets/images/sidebar.png" alt="" />
  </div>

  <main class="main-content">
    ${content}
    <footer>
      <p>&copy; ${new Date().getFullYear()} ${siteAuthor}. Built with Deno.</p>
    </footer>
  </main>

  <script>
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('active');
        toggle.classList.remove('active');
      }
    });
  </script>
  <script>
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
    <script>eruda.init();</script>
  </script>
</body>
</html>`;
}
