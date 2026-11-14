use anyhow::{Context, Result};
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Component, Path, PathBuf};

const ADDRESS: &str = "127.0.0.1:8000";

fn content_type(path: &Path) -> &'static str {
    match path.extension().and_then(|extension| extension.to_str()) {
        Some("html") => "text/html; charset=utf-8",
        Some("js") => "text/javascript; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("json") | Some("webmanifest") => "application/json",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("webp") => "image/webp",
        Some("gif") => "image/gif",
        Some("ico") => "image/x-icon",
        Some("mp4") => "video/mp4",
        Some("webm") => "video/webm",
        Some("woff2") => "font/woff2",
        Some("txt") => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

fn decode(path: &str) -> String {
    let bytes = path.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%'
            && let Some(byte) = path
                .get(index + 1..index + 3)
                .and_then(|hex| u8::from_str_radix(hex, 16).ok())
        {
            out.push(byte);
            index += 3;
            continue;
        }
        out.push(bytes[index]);
        index += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

/// The file GitHub Pages answers a path with: the file, the index.html of a folder, or the path
/// with `.html` added
fn resolve(root: &Path, target: &str) -> Option<PathBuf> {
    let path = decode(target.split(['?', '#']).next().unwrap_or("/"));
    let relative = Path::new(path.trim_start_matches('/'));
    if relative
        .components()
        .any(|component| !matches!(component, Component::Normal(_)))
    {
        return None;
    }
    let file = root.join(relative);
    if file.is_file() {
        return Some(file);
    }
    if file.join("index.html").is_file() {
        return Some(file.join("index.html"));
    }
    let html = PathBuf::from(format!("{}.html", file.display()));
    html.is_file().then_some(html)
}

fn answer(root: &Path, stream: TcpStream) -> std::io::Result<()> {
    let mut reader = BufReader::new(&stream);
    let mut request = String::new();
    reader.read_line(&mut request)?;
    let target = request.split_whitespace().nth(1).unwrap_or("/").to_string();
    // Read the rest of the headers
    let mut line = String::new();
    while reader.read_line(&mut line)? > 2 {
        line.clear();
    }

    let (status, file) = match resolve(root, &target) {
        Some(file) => ("200 OK", file),
        None => ("404 Not Found", root.join("404.html")),
    };
    let body = fs::read(&file).unwrap_or_default();
    println!("{} {target}", &status[..3]);
    let mut stream = stream;
    write!(
        stream,
        "HTTP/1.1 {status}\r\nContent-Type: {}\r\nContent-Length: {}\r\nCache-Control: no-cache\r\nConnection: close\r\n\r\n",
        content_type(&file),
        body.len()
    )?;
    stream.write_all(&body)
}

/// Serves dist/ the way GitHub Pages does
pub fn serve() -> Result<()> {
    let root = PathBuf::from("dist");
    if !root.join("index.html").is_file() {
        anyhow::bail!("dist/ has no site - run `cargo site` first");
    }
    let listener =
        TcpListener::bind(ADDRESS).with_context(|| format!("cannot listen on {ADDRESS}"))?;
    println!("Serving dist/ at http://{ADDRESS}");
    for stream in listener.incoming().flatten() {
        let root = root.clone();
        std::thread::spawn(move || {
            let _ = answer(&root, stream);
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_percent_escapes() {
        assert_eq!(decode("/a%20b"), "/a b");
        assert_eq!(decode("/100%"), "/100%");
    }

    #[test]
    fn refuses_paths_out_of_the_root() {
        assert_eq!(resolve(Path::new("dist"), "/../Cargo.toml"), None);
    }
}
