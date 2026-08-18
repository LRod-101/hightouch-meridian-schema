#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
mkdirSync(path.join(dist, "client", "journey"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

const journeyHtml = readFileSync(index, "utf8")
  .replace(
    "Meridian Retail Group customer schema in a Hightouch-inspired Customer Studio view.",
    "Women’s Tops — Viewed, Not Purchased customer activation journey for Meridian Retail Group.",
  )
  .replace(
    "<title>Meridian Retail Group — Customer Studio Schema</title>",
    "<title>Women’s Tops — Viewed, Not Purchased</title>",
  );
writeFileSync(path.join(dist, "client", "journey", "index.html"), journeyHtml);

console.log("Prepared journey route and Sites compatibility artifacts");
