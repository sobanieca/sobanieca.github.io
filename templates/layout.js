export function layout(content, title, activeCategory, { siteTitle, siteAuthor, categories }) {
  const categoryIcons = {
    general: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>',
    'build-anywhere': '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/></svg>',
    'build-on-the-go': '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>',
    neovim: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>'
  };

  const categoriesNav = Object.entries(categories)
    .map(
      ([key, cat]) => `<a href="/category/${cat.slug}.html" class="${
        activeCategory === cat.slug ? "active" : ""
      }">
        ${categoryIcons[key] || ''}
        <span>${cat.name}</span>
      </a>`
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
    <div class="profile">
      <div class="profile-avatar">
        <img src="/assets/images/avatar.jpg" alt="${siteAuthor}" />
      </div>
      <h2 class="profile-name">${siteAuthor}</h2>
      <p class="profile-title">Software Developer</p>
    </div>

    <nav>
      ${categoriesNav}
    </nav>

    <button class="dark-mode-toggle" id="darkModeToggle">
      <svg class="moon-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
      </svg>
      <span>Dark Mode</span>
      <div class="toggle-switch">
        <div class="toggle-slider"></div>
      </div>
    </button>

    <img class="sidebar-bg" src="/assets/images/sidebar.png" alt="" />
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
    const darkModeToggle = document.getElementById('darkModeToggle');
    const html = document.documentElement;

    // Mobile menu
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

    // Dark mode toggle
    const currentTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', currentTheme);

    darkModeToggle.addEventListener('click', () => {
      const theme = html.getAttribute('data-theme');
      const newTheme = theme === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
  <script>eruda.init();</script>
</body>
</html>`;
}
