import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "temporary screenshots");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATHS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error("No system Chrome/Edge found.");
  process.exit(1);
}

function nextIndex() {
  const files = fs.readdirSync(OUT_DIR).filter((f) => /^screenshot-(\d+)/.test(f));
  const nums = files.map((f) => parseInt(f.match(/^screenshot-(\d+)/)[1], 10));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] || "";
const widthArg = process.argv[4] ? parseInt(process.argv[4], 10) : 1440;
const heightArg = process.argv[5] ? parseInt(process.argv[5], 10) : 900;
const fullPage = process.argv.includes("--full");

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: widthArg, height: heightArg, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
await new Promise((r) => setTimeout(r, 400));

await page.evaluate(async (doScroll) => {
  const prevBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  if (doScroll) {
    const step = window.innerHeight * 0.8;
    let y = 0;
    for (let i = 0; i < 60; i++) {
      const max = document.documentElement.scrollHeight;
      if (y >= max) break;
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
      y += step;
    }
  }
  window.scrollTo(0, 0);
  document.documentElement.style.scrollBehavior = prevBehavior;
  await new Promise((r) => setTimeout(r, 150));
}, fullPage);
await new Promise((r) => setTimeout(r, 250));

if (fullPage) {
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const safeHeight = Math.min(fullHeight, 16000);
  await page.setViewport({ width: widthArg, height: safeHeight, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 200));
}

const idx = nextIndex();
const suffix = label ? `-${label}` : "";
const filePath = path.join(OUT_DIR, `screenshot-${idx}${suffix}.png`);
await page.screenshot({ path: filePath });
await browser.close();
console.log("Saved:", filePath);
