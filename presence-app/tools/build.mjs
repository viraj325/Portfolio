import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import "./validate.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "assets"), { recursive: true });
await mkdir(resolve(dist, "privacy"), { recursive: true });
await mkdir(resolve(dist, "terms"), { recursive: true });
for (const file of ["index.html", "styles.css", "script.js", "legal.css", "legal.js", "config.js"]) {
  await cp(resolve(root, file), resolve(dist, file));
}
await cp(resolve(root, "privacy/index.html"), resolve(dist, "privacy/index.html"));
await cp(resolve(root, "terms/index.html"), resolve(dist, "terms/index.html"));
await cp(resolve(root, "assets/app-icon.png"), resolve(dist, "assets/app-icon.png"));
console.log("Production site built to dist/.");
