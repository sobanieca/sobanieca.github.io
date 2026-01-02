export function layout(content, title, activeCategory, { siteTitle, siteAuthor, categories }) {
  const categoryIcons = {
    general: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>',
    'build-anywhere': '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/></svg>',
    'build-on-the-go': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    'terminal-dev': '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>',
    tools: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
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
      <div class="profile-info">
        <a href="/about-me.html" class="profile-name-link">
          <h2 class="profile-name">${siteAuthor}</h2>
        </a>
        <p class="profile-title">Software Developer</p>
      </div>
    </div>

    <nav>
      <a href="/" class="${activeCategory === null || activeCategory === '' ? 'active' : ''}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M12 7v5l4 2"/>
        </svg>
        <span>Recent</span>
      </a>
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

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('active');
        toggle.classList.remove('active');
      }
    });

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
