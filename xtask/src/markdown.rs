use pulldown_cmark::{CodeBlockKind, CowStr, Event, Options, Parser, Tag, TagEnd, html};
use serde_json::{Value, json};
use std::collections::HashMap;

/// A rendered article: the HTML of its body and its code blocks. Each code block is a
/// `<div data-code="N"></div>` placeholder in the HTML, which the article page replaces with an
/// imp codeBlock that highlights `code[N]`.
pub struct Rendered {
    pub html: String,
    pub code: Vec<Value>,
}

/// How a code block is rendered
#[derive(Clone, Copy, PartialEq)]
pub enum CodeBlocks {
    /// A placeholder for an imp codeBlock (articles)
    Placeholders,
    /// A plain `pre` (about.md, rendered without codeBlock)
    Plain,
}

const VIDEO_EXTENSIONS: &[&str] = &["mp4", "webm", "ogg"];

pub fn escape(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

/// The id of a heading, from its Markdown source: `Using **tmux**` is `using-tmux`
fn slug_of_heading(source: &str) -> String {
    let lower = source.to_lowercase();
    let mut text = String::new();
    let mut chars = lower.chars().peekable();
    while let Some(char) = chars.next() {
        match char {
            // An HTML tag
            '<' if chars.clone().any(|next| next == '>') => {
                for next in chars.by_ref() {
                    if next == '>' {
                        break;
                    }
                }
            }
            // An HTML entity such as &amp;
            '&' => {
                let entity: String = chars
                    .clone()
                    .take_while(|c| c.is_ascii_lowercase())
                    .collect();
                if !entity.is_empty() && chars.clone().nth(entity.len()) == Some(';') {
                    for _ in 0..=entity.len() {
                        chars.next();
                    }
                }
            }
            _ if char.is_ascii_alphanumeric()
                || char == '_'
                || char == '-'
                || char.is_whitespace() =>
            {
                text.push(char)
            }
            _ => {}
        }
    }
    text.split_whitespace().collect::<Vec<_>>().join("-")
}

/// Inline images and videos live in public/articles/images/
fn image_url(href: &str) -> String {
    let path = href.strip_prefix("./").unwrap_or(href);
    match path.strip_prefix("images/") {
        Some(rest) => format!("/articles/images/{rest}"),
        None => href.to_string(),
    }
}

/// `./200-article.md#part` is the article in the category of the page, `../category/200-article.md`
/// the article in that category, and `../category` the category page
fn link_url(href: &str, categories: &[String], current: Option<&str>) -> String {
    let (path, fragment) = match href.find('#') {
        Some(index) => (&href[..index], &href[index..]),
        None => (href, ""),
    };
    let target = match path.strip_prefix("./") {
        Some(file) => current.map(|category| (category, file)),
        None => path
            .strip_prefix("../")
            .and_then(|rest| rest.split_once('/'))
            .filter(|(category, _)| !category.is_empty()),
    };
    if let Some((category, name)) =
        target.and_then(|(category, file)| Some((category, file.strip_suffix(".md")?)))
        && !name.contains('/')
        && let Some((order, slug)) = name.split_once('-')
        && !order.is_empty()
        && order.chars().all(|c| c.is_ascii_digit())
        && !slug.is_empty()
    {
        return format!("/articles/{category}/{slug}{fragment}");
    }
    if fragment.is_empty()
        && let Some(category) = path.strip_prefix("../")
    {
        let category = category.strip_suffix('/').unwrap_or(category);
        if categories.iter().any(|known| known == category) {
            return format!("/category/{category}");
        }
    }
    image_url(href)
}

fn title_attribute(title: &str) -> String {
    if title.is_empty() {
        String::new()
    } else {
        format!(" title=\"{}\"", escape(title))
    }
}

fn media(href: &str, title: &str, alt: &str) -> String {
    let src = image_url(href);
    let extension = src.rsplit('.').next().unwrap_or("");
    if VIDEO_EXTENSIONS.contains(&extension) {
        return format!(
            "<video controls playsinline preload=\"metadata\"{}><source src=\"{}\" type=\"video/{extension}\">Your browser does not support the video tag.</video>",
            title_attribute(title),
            escape(&src)
        );
    }
    format!(
        "<img src=\"{}\" alt=\"{}\"{}>",
        escape(&src),
        escape(alt),
        title_attribute(title)
    )
}

/// The language codeBlock highlights a fence in. imp has no `http`, so it shows as text.
fn language_of(info: &str) -> String {
    match info.split_whitespace().next().unwrap_or("") {
        "" | "http" => "text".to_string(),
        language => language.to_string(),
    }
}

struct Heading {
    level: u8,
    id: String,
    events: Vec<Event<'static>>,
}

pub fn render(
    source: &str,
    categories: &[String],
    current: Option<&str>,
    code_blocks: CodeBlocks,
) -> Rendered {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);

    let mut events: Vec<Event<'static>> = Vec::new();
    let mut code: Vec<Value> = Vec::new();
    let mut heading_counts: HashMap<String, usize> = HashMap::new();
    let mut heading: Option<Heading> = None;
    let mut fence: Option<(String, String)> = None;
    let mut image: Option<(String, String, String)> = None;

    for (event, range) in Parser::new_ext(source, options).into_offset_iter() {
        if let Some((language, text)) = fence.as_mut() {
            match event {
                Event::Text(part) => text.push_str(&part),
                Event::End(TagEnd::CodeBlock) => {
                    let text = text.strip_suffix('\n').unwrap_or(text);
                    let markup = match code_blocks {
                        CodeBlocks::Placeholders => {
                            code.push(json!({ "language": language, "code": text }));
                            format!("<div data-code=\"{}\"></div>\n", code.len() - 1)
                        }
                        CodeBlocks::Plain => format!("<pre><code>{}</code></pre>\n", escape(text)),
                    };
                    events.push(Event::Html(CowStr::from(markup)));
                    fence = None;
                }
                _ => {}
            }
            continue;
        }
        if let Some((_, _, alt)) = image.as_mut() {
            match event {
                Event::Text(part) | Event::Code(part) => alt.push_str(&part),
                Event::End(TagEnd::Image) => {
                    let (href, title, alt) = image.take().unwrap_or_default();
                    let markup = Event::InlineHtml(CowStr::from(media(&href, &title, &alt)));
                    match heading.as_mut() {
                        Some(heading) => heading.events.push(markup),
                        None => events.push(markup),
                    }
                }
                _ => {}
            }
            continue;
        }

        let rewritten: Event<'static> = match event {
            Event::Start(Tag::CodeBlock(kind)) => {
                let info = match kind {
                    CodeBlockKind::Fenced(info) => info.to_string(),
                    CodeBlockKind::Indented => String::new(),
                };
                fence = Some((language_of(&info), String::new()));
                continue;
            }
            Event::Start(Tag::Image {
                dest_url, title, ..
            }) => {
                image = Some((dest_url.to_string(), title.to_string(), String::new()));
                continue;
            }
            Event::Start(Tag::Heading { level, .. }) => {
                let markdown = source[range].trim();
                let markdown = markdown
                    .trim_start_matches('#')
                    .trim_end_matches('#')
                    .trim();
                let base = slug_of_heading(markdown);
                let count = heading_counts.entry(base.clone()).or_insert(0);
                let id = if *count > 0 {
                    format!("{base}-{count}")
                } else {
                    base
                };
                *count += 1;
                heading = Some(Heading {
                    level: level as u8,
                    id,
                    events: Vec::new(),
                });
                continue;
            }
            Event::End(TagEnd::Heading(_)) => {
                let Some(Heading {
                    level,
                    id,
                    events: inner,
                }) = heading.take()
                else {
                    continue;
                };
                let mut inner_html = String::new();
                html::push_html(&mut inner_html, inner.into_iter());
                let id = escape(&id);
                Event::Html(CowStr::from(format!(
                    "<h{level} id=\"{id}\"><a class=\"heading-anchor\" href=\"#{id}\" aria-label=\"Link to this section\">{inner_html}</a></h{level}>\n"
                )))
            }
            Event::Start(Tag::Link {
                dest_url, title, ..
            }) => Event::InlineHtml(CowStr::from(format!(
                "<a href=\"{}\"{}>",
                escape(&link_url(&dest_url, categories, current)),
                title_attribute(&title)
            ))),
            Event::End(TagEnd::Link) => Event::InlineHtml(CowStr::from("</a>")),
            other => other.into_static(),
        };
        match heading.as_mut() {
            Some(heading) => heading.events.push(rewritten),
            None => events.push(rewritten),
        }
    }

    let mut out = String::new();
    html::push_html(&mut out, events.into_iter());
    Rendered { html: out, code }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn categories() -> Vec<String> {
        vec!["tools".to_string()]
    }

    #[test]
    fn heading_ids_follow_the_source() {
        assert_eq!(
            slug_of_heading("Using `tmux` & **Neovim**!"),
            "using-tmux-neovim"
        );
        assert_eq!(slug_of_heading("A &amp; B"), "a-b");
        let rendered = render(
            "## Setup\n\n## Setup\n",
            &[],
            None,
            CodeBlocks::Placeholders,
        );
        assert!(rendered.html.contains("<h2 id=\"setup\">"));
        assert!(rendered.html.contains("<h2 id=\"setup-1\">"));
    }

    #[test]
    fn links_to_articles_and_categories() {
        let tools = categories();
        let here = Some("build-in-terminal");
        assert_eq!(
            link_url("./200-tmux.md", &tools, here),
            "/articles/build-in-terminal/tmux"
        );
        assert_eq!(link_url("./200-tmux.md", &tools, None), "./200-tmux.md");
        assert_eq!(
            link_url("../tools/100-jsonr.md#install", &tools, here),
            "/articles/tools/jsonr#install"
        );
        assert_eq!(link_url("../tools", &tools, here), "/category/tools");
        assert_eq!(link_url("../other", &tools, here), "../other");
        assert_eq!(
            link_url("images/a.jpg", &tools, here),
            "/articles/images/a.jpg"
        );
        assert_eq!(
            link_url("https://x.com/a.md", &tools, here),
            "https://x.com/a.md"
        );
    }

    #[test]
    fn code_blocks_become_placeholders() {
        let rendered = render(
            "Text\n\n```bash\necho <hi>\n```\n\n```http\nGET /\n```\n",
            &[],
            None,
            CodeBlocks::Placeholders,
        );
        assert!(rendered.html.contains("<div data-code=\"0\"></div>"));
        assert!(rendered.html.contains("<div data-code=\"1\"></div>"));
        assert_eq!(
            rendered.code[0],
            json!({ "language": "bash", "code": "echo <hi>" })
        );
        assert_eq!(rendered.code[1]["language"], "text");
    }

    #[test]
    fn images_and_videos() {
        let rendered = render(
            "![A *cat*](images/cat.jpg) ![](./images/clip.mp4 \"Clip\")",
            &[],
            None,
            CodeBlocks::Placeholders,
        );
        assert!(
            rendered
                .html
                .contains("<img src=\"/articles/images/cat.jpg\" alt=\"A cat\">")
        );
        assert!(rendered.html.contains(
            "title=\"Clip\"><source src=\"/articles/images/clip.mp4\" type=\"video/mp4\">"
        ));
    }
}
