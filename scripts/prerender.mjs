// Bakes the Korean version of the profile into index.html so the page is
// readable without JavaScript and indexable by crawlers.
//
// Run after changing data/profile-data.js or assets/render.js:
//   node scripts/prerender.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { renderMain } from "../assets/render.js";

const startMarker = /<!-- prerender:start[^>]*-->/;
const endMarker = "<!-- prerender:end -->";

const indexFile = new URL("../index.html", import.meta.url);
const html = readFileSync(indexFile, "utf8");

const startMatch = html.match(startMarker);
const endIndex = html.indexOf(endMarker);
if (!startMatch || endIndex === -1) {
  console.error("prerender markers not found in index.html");
  process.exit(1);
}

const startIndex = startMatch.index + startMatch[0].length;
const updated =
  html.slice(0, startIndex) + `\n${renderMain("ko")}\n        ` + html.slice(endIndex);

writeFileSync(indexFile, updated);
console.log("index.html: prerendered Korean content updated");
