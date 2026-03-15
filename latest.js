let latest = "";

for await (const dir of Deno.readDir("articles")) {
  if (!dir.isDirectory) continue;
  for await (const entry of Deno.readDir(`articles/${dir.name}`)) {
    const match = entry.name.match(/^(\d{4}-\d{2}-\d{2})-.*\.md$/);
    if (match && match[1] > latest) {
      latest = match[1];
    }
  }
}

if (latest) {
  console.log(latest);
} else {
  console.log("No articles found.");
}
