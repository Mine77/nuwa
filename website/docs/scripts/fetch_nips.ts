import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env.development.local", override: true });
}

const GITHUB_API_URL =
  "https://api.github.com/repos/nuwa-protocol/NIPs/contents/nips";
const TARGET_DIR = path.resolve("content/nips");

async function fetchNipList() {
  const res = await fetch(GITHUB_API_URL, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "nuwa-docs-fetch-script",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch file list: ${res.status}`);
  return res.json();
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "nuwa-docs-fetch-script",
    },
  });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const content = await res.text();
  await fs.writeFile(destPath, content, "utf8");
}

async function main() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  const files = await fetchNipList();
  const mdFiles = (files as { name: string; download_url: string }[]).filter(
    (f) => f.name.endsWith(".md")
  );
  for (const file of mdFiles) {
    let destName = file.name;
    const destPath = path.join(TARGET_DIR, destName);
    console.log(`Downloading ${file.name} as ${destName}...`);
    await downloadFile(file.download_url, destPath);
  }
  console.log("All NIPs downloaded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
