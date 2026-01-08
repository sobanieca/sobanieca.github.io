export function layout(
  content,
  title,
  activeCategory,
  { siteTitle, siteAuthor, categories, isLocal },
) {
  const categoriesNav = Object.entries(categories)
    .map(
      ([key, cat]) =>
        `<a href="/category/${cat.slug}.html" class="${
          activeCategory === cat.slug ? "active" : ""
        }">
        ${cat.icon || ""}
        <span>${cat.name}</span>
      </a>`,
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
      <a href="/" class="${
    activeCategory === null || activeCategory === "" ? "active" : ""
  }">
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
      <p>&copy; ${
    new Date().getFullYear()
  } ${siteAuthor}. Built with Deno and Claude.</p>
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

    // Giscus theme helper
    function getGiscusTheme(theme) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const lightTheme = isLocal ? 'light' : window.location.origin + '/assets/css/giscus-light.css';
      return theme === 'dark' ? 'purple_dark' : lightTheme;
    }

    // Initialize Giscus if container exists
    const giscusContainer = document.getElementById('giscus-container');
    if (giscusContainer) {
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.setAttribute('data-repo', 'sobanieca/sobanieca.github.io');
      script.setAttribute('data-repo-id', 'R_kgDOQmdbKA');
      script.setAttribute('data-category', 'Giscuss Comments');
      script.setAttribute('data-category-id', 'DIC_kwDOQmdbKM4C0kgc');
      script.setAttribute('data-mapping', 'pathname');
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'bottom');
      script.setAttribute('data-theme', getGiscusTheme(currentTheme));
      script.setAttribute('data-lang', 'en');
      script.setAttribute('data-loading', 'lazy');
      script.crossOrigin = 'anonymous';
      script.async = true;
      giscusContainer.appendChild(script);
    }

    darkModeToggle.addEventListener('click', () => {
      const theme = html.getAttribute('data-theme');
      const newTheme = theme === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Update Giscus theme if loaded
      const iframe = document.querySelector('iframe.giscus-frame');
      if (iframe) {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme: getGiscusTheme(newTheme) } } },
          'https://giscus.app'
        );
      }
    });
  </script>
${
    isLocal
      ? `  <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
  <script>eruda.init();</script>`
      : ""
  }
</body>
</html>`;
}
