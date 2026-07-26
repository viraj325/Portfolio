import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
for (const page of ["index.html", "index-old.html", "privacy/index.html", "terms/index.html"]) {
  const html = await readFile(resolve(root, page), "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const duplicateIds = [...ids].filter((id) => html.match(new RegExp(`\\sid="${id}"`, "g"))?.length > 1);
  if (duplicateIds.length) throw new Error(`${page} has duplicate IDs: ${duplicateIds.join(", ")}`);

  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (href.startsWith("#") && href !== "#" && !ids.has(href.slice(1))) {
      throw new Error(`${page} has a missing anchor target: ${href}`);
    }
  }
}

for (const asset of [
  "styles.css",
  "script.js",
  "styles-old.css",
  "script-old.js",
  "legal.css",
  "legal.js",
  "config.js",
  "assets/app-icon.png"
]) {
  await access(resolve(root, asset));
}

const configSource = await readFile(resolve(root, "config.js"), "utf8");
const unresolved = [...configSource.matchAll(/"(\[[A-Z][A-Z ,]+\])"/g)].map((match) => match[1]);
if (unresolved.length) {
  console.warn(`LEGAL DRAFT WARNING: unresolved placeholders: ${unresolved.join(", ")}`);
}
console.log("Validated all page anchors, configuration, and local assets.");
