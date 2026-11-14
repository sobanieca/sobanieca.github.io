// Builds the site in two steps:
//
// 1. Content: reads the Markdown articles and about.md, renders them to HTML (marked + shiki) and
//    writes them as JS modules under src/content/, which the imp app imports. Each article becomes
//    its own module, loaded lazily as an imp area. The images go to public/.
// 2. App: runs `imp build` into dist/, then writes a copy of the built page for every route
//    (articles/<slug>.html, category/<slug>.html, ...) with its own title and description, so
//    GitHub Pages answers a deep link with 200, plus 404.html for every other path.
//
// deno task content    step 1 only (run it before `imp start`)
// deno task build      both steps, analytics off
// deno task publish    both steps with the prod environment (analytics on), assets checked only

import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import { createHighlighter } from "shiki";
import { checkAssets, optimizeAssets } from "./scripts/optimize-assets.js";

const SITE_AUTHOR = "Adam Sobaniec";
const SITE_TITLE = `${SITE_AUTHOR} - Software Developer`;

// Set to true to serve a maintenance placeholder instead of the full site
const UNDER_MAINTENANCE = false;

const CONTENT_DIR = "src/content";

async function readCategories() {
  const categoryList = [];

  for await (const dirEntry of Deno.readDir("articles")) {
    if (!dirEntry.isDirectory) continue;

    const slug = dirEntry.name;
    const categoryPath = `articles/${slug}`;

    try {
      const yamlContent = await Deno.readTextFile(
        `${categoryPath}/category.yaml`,
      );
      const categoryData = parseYaml(yamlContent);

      let icon = "";
      try {
        icon = await Deno.readTextFile(`${categoryPath}/category-icon.svg`);
        icon = icon.trim();
      } catch {
        // No icon file, use empty string
      }

      categoryList.push({
        name: categoryData.name || slug,
        description: categoryData.description || "",
        order: categoryData.order ?? 999,
        slug,
        icon,
      });
    } catch {
      // No category.yaml, skip this directory
      console.warn(`Warning: No category.yaml found in ${categoryPath}`);
    }
  }

  // Sort by order (lower number = first)
  return categoryList.sort((a, b) => a.order - b.order);
}

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const [, frontMatter, markdown] = match;
  return {
    data: parseYaml(frontMatter),
    content: markdown,
  };
}

function getSlugFromFilename(filename) {
  return filename.replace(/^\d+-/, "").replace(/\.md$/, "");
}

function getOrderFromFilename(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// The key of a node in the imp application map. imp serves a camelCase key as a kebab-case path
// segment, so `working-with-remote-machine` is the key `workingWithRemoteMachine`.
function toMapKey(slug) {
  const key = slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  const back = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  if (back !== slug || !/^[a-z][a-zA-Z0-9]*$/.test(key)) {
    throw new Error(
      `"${slug}" cannot be a route - use lowercase words joined by single dashes`,
    );
  }
  return key;
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

let headingSlugCounts = null;

function renderMarkdown(content) {
  headingSlugCounts = new Map();
  const html = marked.parse(content);
  headingSlugCounts = null;
  return html;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatShortDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

async function copyDir(src, dest) {
  await Deno.mkdir(dest, { recursive: true });

  for await (const entry of Deno.readDir(src)) {
    const srcPath = `${src}/${entry.name}`;
    const destPath = `${dest}/${entry.name}`;

    if (entry.isDirectory) {
      await copyDir(srcPath, destPath);
    } else {
      await Deno.copyFile(srcPath, destPath);
    }
  }
}

async function removeDir(path) {
  try {
    await Deno.remove(path, { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
}

async function findArticleImage(categoryPath, baseName) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  for (const ext of imageExtensions) {
    const imagePath = `${categoryPath}/${baseName}${ext}`;
    try {
      await Deno.stat(imagePath);
      return { path: imagePath, ext };
    } catch {
      // File doesn't exist, try next extension
    }
  }
  return null;
}

async function readArticles() {
  const articles = [];

  for await (const dirEntry of Deno.readDir("articles")) {
    if (!dirEntry.isDirectory) continue;

    const category = dirEntry.name;
    const categoryPath = `articles/${category}`;

    for await (const file of Deno.readDir(categoryPath)) {
      if (!file.name.endsWith(".md")) continue;

      const filePath = `${categoryPath}/${file.name}`;
      const fileContent = await Deno.readTextFile(filePath);
      const { data, content } = parseFrontMatter(fileContent);

      const slug = getSlugFromFilename(file.name);
      const baseName = file.name.replace(/\.md$/, "");
      const html = renderMarkdown(content);

      // Check for article image
      const imageInfo = await findArticleImage(categoryPath, baseName);
      let image = null;
      if (imageInfo) {
        image = {
          src: imageInfo.path,
          dest: `/assets/images/articles/${slug}${imageInfo.ext}`,
        };
      }

      articles.push({
        title: data.title || "Untitled",
        date: data.date || null,
        order: getOrderFromFilename(file.name),
        categorySlug: category,
        excerpt: data.excerpt || "",
        content: html,
        slug,
        key: toMapKey(slug),
        url: `/articles/${slug}`,
        image,
      });
    }
  }

  return articles.sort((a, b) => {
    // Sort by date descending (most recently updated first)
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    // Tie-break by order descending
    return b.order - a.order;
  });
}

function setupMarked(highlighter, categorySlugs) {
  // Inline images and videos live in public/articles/images/
  const imageUrl = (href) =>
    href.replace(/^(\.\/)?images\//, "/articles/images/");

  marked.use({
    async: false,
    renderer: {
      heading(text, level, raw) {
        const baseId = slugifyHeading(raw);
        let id = baseId;
        if (headingSlugCounts) {
          const count = headingSlugCounts.get(baseId) ?? 0;
          if (count > 0) id = `${baseId}-${count}`;
          headingSlugCounts.set(baseId, count + 1);
        }
        return `<h${level} id="${id}"><a class="heading-anchor" href="#${id}" aria-label="Link to this section">${text}</a></h${level}>\n`;
      },
      link(href, title, text) {
        // ./200-article.md or ../category/200-article.md -> the article
        const articleMatch = href.match(
          /^(?:\.\/|\.\.\/[^/]+\/)\d+-(.+)\.md(#.*)?$/,
        );
        // ../category -> the category page
        const categoryMatch = href.match(/^\.\.\/([^/#]+)\/?$/);
        if (articleMatch) {
          href = `/articles/${articleMatch[1]}${articleMatch[2] ?? ""}`;
        } else if (categoryMatch && categorySlugs.includes(categoryMatch[1])) {
          href = `/category/${categoryMatch[1]}`;
        } else {
          href = imageUrl(href);
        }
        return `<a href="${href}"${
          title ? ` title="${title}"` : ""
        }>${text}</a>`;
      },
      image(href, title, text) {
        href = imageUrl(href);
        const videoExts = [".mp4", ".webm", ".ogg"];
        if (videoExts.some((ext) => href.endsWith(ext))) {
          return `<video controls playsinline preload="metadata"${
            title ? ` title="${title}"` : ""
          }><source src="${href}" type="video/${
            href.split(".").pop()
          }">Your browser does not support the video tag.</video>`;
        }
        return `<img src="${href}" alt="${text}"${
          title ? ` title="${title}"` : ""
        }>`;
      },
      code(code, lang) {
        if (!lang) {
          return `<pre><code>${code}</code></pre>`;
        }
        try {
          return highlighter.codeToHtml(code, {
            lang: lang,
            themes: {
              light: "synthwave-84",
              dark: "synthwave-84",
            },
          });
        } catch (e) {
          console.warn(`Failed to highlight ${lang}: ${e.message}`);
          return `<pre><code class="language-${lang}">${code}</code></pre>`;
        }
      },
    },
  });
}

const GENERATED = "// Generated by build.js - do not edit.\n";
const json = (value) => JSON.stringify(value, null, 2);

async function writeContent(categories, articles, about) {
  await removeDir(CONTENT_DIR);
  await Deno.mkdir(`${CONTENT_DIR}/articles`, { recursive: true });

  // Group articles by category for prev/next navigation, sorted by order
  const articlesByCategory = {};
  for (const article of articles) {
    (articlesByCategory[article.categorySlug] ??= []).push(article);
  }
  for (const list of Object.values(articlesByCategory)) {
    list.sort((a, b) => a.order - b.order);
  }

  const categoryData = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
    url: `/category/${category.slug}`,
  }));

  const articleData = articles.map((article) => {
    const siblings = articlesByCategory[article.categorySlug];
    const index = siblings.indexOf(article);
    // "prev" (←) = lower order, "next" (→) = higher order
    const prev = siblings[index - 1] ?? null;
    const next = siblings[index + 1] ?? null;

    let nextCategory = null;
    if (!next) {
      const catIndex = categories.findIndex((c) =>
        c.slug === article.categorySlug
      );
      nextCategory = categories.slice(catIndex + 1).find((c) =>
        articlesByCategory[c.slug]?.length > 0
      ) ?? null;
    }

    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      date: article.date,
      dateLong: formatDate(article.date),
      dateShort: formatShortDate(article.date),
      order: article.order,
      category: article.categorySlug,
      url: article.url,
      image: article.image?.dest ?? null,
      prev: prev && { title: prev.title, url: prev.url },
      next: next && { title: next.title, url: next.url },
      nextCategory: nextCategory &&
        { name: nextCategory.name, url: `/category/${nextCategory.slug}` },
    };
  });

  await Deno.writeTextFile(
    `${CONTENT_DIR}/site-data.js`,
    `${GENERATED}
// Every category, in the order of the sidebar
export const categories = ${json(categoryData)}

// Every article without its body, most recently updated first
export const articles = ${json(articleData)}

export const about = ${json(about)}
`,
  );

  // The parts of the application map: one static node per category and per article, so each
  // article is a page of its own, with its own analytics page and its own lazy chunk.
  await Deno.writeTextFile(
    `${CONTENT_DIR}/categories-map.js`,
    `${GENERATED}import { appMap } from 'imp'

export const category = appMap({ description: 'The categories of the articles' }, {
${
      categories.map((c) =>
        `  ${toMapKey(c.slug)}: ${JSON.stringify(c.description || c.name)},`
      ).join("\n")
    }
})
`,
  );

  await Deno.writeTextFile(
    `${CONTENT_DIR}/articles-map.js`,
    `${GENERATED}import { appMap } from 'imp'

export const articles = appMap({ description: 'Every article' }, {
${
      articles.map((a) =>
        `  ${a.key}: ${JSON.stringify(a.excerpt || a.title)},`
      ).join("\n")
    }
})
`,
  );

  // The screens: a category page is part of the main bundle, each article is an area of its own
  await Deno.writeTextFile(
    `${CONTENT_DIR}/routes.js`,
    `${GENERATED}import { area } from 'imp/router'
import { app } from '../app-map.js'
import { categoryPage } from '../pages/category-page.js'

export const categoryScreens = {
${
      categories.map((c) =>
        `  [app.category.${toMapKey(c.slug)}]: () => categoryPage(${
          JSON.stringify(c.slug)
        }),`
      ).join("\n")
    }
}

export const articleScreens = {
${
      articles.map((a) =>
        `  [app.articles.${a.key}]: area(() => import('./articles/${a.slug}.js')),`
      ).join("\n")
    }
}
`,
  );

  for (const article of articles) {
    await Deno.writeTextFile(
      `${CONTENT_DIR}/articles/${article.slug}.js`,
      `${GENERATED}import { area } from 'imp/router'
import { app } from '../../app-map.js'
import { articlePage } from '../../pages/article-page.js'

const content = ${JSON.stringify(article.content)}

export default area({
  screens: {
    [app.articles.${article.key}]: () => articlePage(${
        JSON.stringify(article.slug)
      }, content),
  },
})
`,
    );
  }
}

async function copyImages(categories, articles) {
  await removeDir("public/assets/images/articles");
  await Deno.mkdir("public/assets/images/articles", { recursive: true });
  for (const article of articles) {
    if (article.image) {
      await Deno.copyFile(article.image.src, `public${article.image.dest}`);
    }
  }

  // Inline images of every category go to public/articles/images/
  await removeDir("public/articles");
  await Deno.mkdir("public/articles/images", { recursive: true });
  for (const category of categories) {
    const imagesPath = `articles/${category.slug}/images`;
    try {
      await Deno.stat(imagesPath);
      await copyDir(imagesPath, "public/articles/images");
    } catch {
      // No images folder for this category
    }
  }
}

async function buildContent() {
  console.log("Initializing Shiki...");
  const highlighter = await createHighlighter({
    themes: ["synthwave-84", "tokyo-night"],
    langs: [
      "javascript",
      "typescript",
      "bash",
      "lua",
      "vim",
      "dockerfile",
      "powershell",
      "json",
      "yaml",
      "html",
      "css",
      "markdown",
    ],
  });

  const categories = await readCategories();
  console.log(`Found ${categories.length} categories`);
  setupMarked(highlighter, categories.map((c) => c.slug));

  const articles = await readArticles();
  console.log(`Found ${articles.length} articles`);

  // Check for duplicate article slugs
  const slugMap = new Map();
  for (const article of articles) {
    if (slugMap.has(article.slug)) {
      const existing = slugMap.get(article.slug);
      console.error(
        `\n✗ Build failed: Duplicate article slug "${article.slug}"`,
      );
      console.error(
        `  - ${existing.categorySlug}/${existing.slug} (${existing.date})`,
      );
      console.error(
        `  - ${article.categorySlug}/${article.slug} (${article.date})`,
      );
      Deno.exit(1);
    }
    slugMap.set(article.slug, article);
  }

  const aboutMd = await Deno.readTextFile("about.md");
  const { data: aboutData, content: aboutMarkdown } = parseFrontMatter(aboutMd);
  const about = {
    title: aboutData.title || "About Me",
    intro: aboutData.intro,
    company: aboutData.company,
    content: renderMarkdown(aboutMarkdown),
  };

  await writeContent(categories, articles, about);
  console.log(`Generated ${CONTENT_DIR}/`);

  await copyImages(categories, articles);
  console.log("Copied article images to public/");

  return { categories, articles, about };
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// One copy of the built page per route, with the title and the description of that route.
// GitHub Pages serves /articles/jsonr from articles/jsonr.html. The imp router takes over in the
// browser, and writes the title and the description again on every navigation.
async function writeRoutePages({ categories, articles, about }) {
  const page = await Deno.readTextFile("dist/index.html");
  const titleTag = /<title>[^<]*<\/title>/;
  const descriptionTag = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/;
  if (!titleTag.test(page) || !descriptionTag.test(page)) {
    throw new Error("dist/index.html has no <title> or description meta tag");
  }

  const write = async (file, title, description) => {
    const html = page
      .replace(
        titleTag,
        `<title>${
          escapeHtml(title ? `${title} - ${SITE_TITLE}` : SITE_TITLE)
        }</title>`,
      )
      .replace(
        descriptionTag,
        (tag) =>
          description
            ? `<meta name="description" content="${escapeHtml(description)}">`
            : tag,
      );
    await Deno.mkdir(`dist/${file}`.replace(/\/[^/]+$/, ""), {
      recursive: true,
    });
    await Deno.writeTextFile(`dist/${file}`, html);
  };

  await write("about-me.html", about.title);
  await write("projects.html", "Projects");
  for (const category of categories) {
    await write(
      `category/${category.slug}.html`,
      category.name,
      category.description,
    );
  }
  for (const article of articles) {
    await write(
      `articles/${article.slug}.html`,
      article.title,
      article.excerpt,
    );
  }
  // Every other path: the router shows its page, or the "not found" page
  await Deno.copyFile("dist/index.html", "dist/404.html");

  console.log(
    `Generated ${4 + categories.length + articles.length} route pages`,
  );
}

async function run(cmd, args) {
  const { code } = await new Deno.Command(cmd, {
    args,
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  if (code !== 0) {
    console.error(`\n✗ ${cmd} ${args.join(" ")} failed`);
    Deno.exit(code);
  }
}

async function buildMaintenancePage() {
  console.log("Under maintenance mode enabled");
  await removeDir("dist");
  await Deno.mkdir("dist", { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Under Maintenance</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
      color: #333;
    }
    h1 { font-size: 2rem; }
  </style>
</head>
<body>
  <h1>Under maintenance</h1>
</body>
</html>`;

  await Deno.writeTextFile("dist/index.html", html);
  console.log("\n✓ Under maintenance page generated in dist/");
}

async function build() {
  const publish = Deno.args.includes("--publish");
  const contentOnly = Deno.args.includes("--content");

  console.log(contentOnly ? "Generating content..." : "Building site...");

  if (publish) {
    await checkAssets();
  } else if (!contentOnly) {
    await optimizeAssets();
  }

  if (UNDER_MAINTENANCE && !contentOnly) {
    await buildMaintenancePage();
    return;
  }

  const site = await buildContent();
  if (contentOnly) {
    console.log("\n✓ Content generated - run `imp start` to serve the site");
    return;
  }

  // imp refuses an output folder with files it did not write, such as the route pages below
  await removeDir("dist");
  // The prod environment turns the ANALYTICS flag on. A local build leaves it off.
  await run("imp", ["build", ...(publish ? ["--env", "prod"] : [])]);

  await writeRoutePages(site);

  await Deno.copyFile("stats.html", "dist/stats.html");
  console.log("Copied stats.html");

  console.log("\n✓ Build complete! Output in dist/");
}

if (import.meta.main) {
  await build();
}
