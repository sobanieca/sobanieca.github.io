use std::collections::HashMap;

/// The small part of YAML the articles use: `key: value` lines, quoted or not, and one level of
/// nested keys, which come back as `parent.key`.
#[derive(Debug, Default)]
pub struct Fields(HashMap<String, String>);

impl Fields {
    pub fn get(&self, key: &str) -> Option<&str> {
        self.0
            .get(key)
            .map(String::as_str)
            .filter(|value| !value.is_empty())
    }

    pub fn parse(text: &str) -> Fields {
        let mut fields = HashMap::new();
        let mut parent: Option<String> = None;
        for line in text.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }
            let Some((key, value)) = trimmed.split_once(':') else {
                continue;
            };
            let key = key.trim();
            let value = unquote(value.trim());
            if line.starts_with([' ', '\t']) {
                if let Some(parent) = &parent {
                    fields.insert(format!("{parent}.{key}"), value);
                }
                continue;
            }
            parent = value.is_empty().then(|| key.to_string());
            fields.insert(key.to_string(), value);
        }
        Fields(fields)
    }
}

fn unquote(value: &str) -> String {
    if value.len() >= 2 && value.starts_with('"') && value.ends_with('"') {
        let mut out = String::new();
        let mut chars = value[1..value.len() - 1].chars();
        while let Some(char) = chars.next() {
            if char == '\\' {
                match chars.next() {
                    Some('n') => out.push('\n'),
                    Some('t') => out.push('\t'),
                    Some(other) => out.push(other),
                    None => {}
                }
            } else {
                out.push(char);
            }
        }
        return out;
    }
    if value.len() >= 2 && value.starts_with('\'') && value.ends_with('\'') {
        return value[1..value.len() - 1].replace("''", "'");
    }
    value.to_string()
}

/// Splits a Markdown file into its front matter and its body.
pub fn split(text: &str) -> (Fields, &str) {
    let text = text.strip_prefix('\u{feff}').unwrap_or(text);
    let Some(rest) = text.strip_prefix("---\n") else {
        return (Fields::default(), text);
    };
    match rest.find("\n---\n") {
        Some(end) => (Fields::parse(&rest[..end]), &rest[end + 5..]),
        None => (Fields::default(), text),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_quoted_and_nested_values() {
        let (fields, body) = split(
            "---\ntitle: \"About: me\"\nintro: plain text\ncompany:\n  name: \"Redocly\"\n  url: 'https://x.com'\n---\nBody\n",
        );
        assert_eq!(fields.get("title"), Some("About: me"));
        assert_eq!(fields.get("intro"), Some("plain text"));
        assert_eq!(fields.get("company"), None);
        assert_eq!(fields.get("company.name"), Some("Redocly"));
        assert_eq!(fields.get("company.url"), Some("https://x.com"));
        assert_eq!(body, "Body\n");
    }
}
