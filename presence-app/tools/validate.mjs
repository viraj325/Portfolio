import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const html = await readFile(resolve(root, "index.html"), "utf8");
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const duplicateIds = [...ids].filter((id) => html.match(new RegExp(`\\sid="${id}"`, "g"))?.length > 1);
if (duplicateIds.length) throw new Error(`Duplicate IDs: ${duplicateIds.join(", ")}`);

for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
  if (href.startsWith("#") && href !== "#" && !ids.has(href.slice(1))) {
    throw new Error(`Missing anchor target: ${href}`);
  }
}

for (const asset of ["styles.css", "script.js", "config.js", "assets/app-icon.png"]) {
  await access(resolve(root, asset));
}
console.log("Validated markup anchors, configuration, and local assets.");
