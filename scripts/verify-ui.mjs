import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = "http://127.0.0.1:3001";
const OUT = path.join(process.env.TEMP || ".", "jarvis-verify");
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const results = [];

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  results.push({ name, file, ok: true });
  return file;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: [
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--window-size=1440,900",
      "--hide-scrollbars",
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector('[data-testid="orb-label"]', { timeout: 20000 });
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="orb-label"]')?.textContent?.trim() ===
      "Standby",
    { timeout: 20000 },
  );
  await new Promise((r) => setTimeout(r, 1500));
  await shot(page, "01-console-standby");

  for (const [testId, label, file] of [
    ["preview-listening", "Listening", "02-listen"],
    ["preview-thinking", "Thinking", "03-think"],
    ["preview-talking", "Speaking", "04-speak"],
  ]) {
    await page.click(`[data-testid="${testId}"]`);
    await page.waitForFunction(
      (expected) =>
        document.querySelector('[data-testid="orb-label"]')?.textContent?.trim() ===
        expected,
      { timeout: 8000 },
      label,
    );
    await new Promise((r) => setTimeout(r, 800));
    await shot(page, file);
  }

  await page.click('[data-testid="preview-idle"]');
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="orb-label"]')?.textContent?.trim() ===
      "Standby",
    { timeout: 8000 },
  );

  await page.click('[data-testid="chat-input"]');
  await page.type('[data-testid="chat-input"]', "What time is it right now?");
  await page.click('[data-testid="send-message"]');
  await page.waitForFunction(
    () =>
      document.body.innerText.includes("What time is it right now?") &&
      (document.body.innerText.includes("LIVE") ||
        document.body.innerText.match(/\d{1,2}:\d{2}/) ||
        document.body.innerText.includes("offline") ||
        document.body.innerText.includes("hiccup")),
    { timeout: 25000 },
  );
  await new Promise((r) => setTimeout(r, 2500));
  await shot(page, "05-chat-sent");

  const afterSend = await page.evaluate(() => document.body.innerText);

  await page.click('[data-testid="layout-toggle"]');
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="layout-toggle"]')
        ?.textContent?.toUpperCase()
        .includes("CONSOLE"),
    { timeout: 8000 },
  );
  await new Promise((r) => setTimeout(r, 800));
  await shot(page, "06-focus");

  await page.click('[data-testid="layout-toggle"]');
  await page.waitForSelector('[data-testid="chat-input"]', { timeout: 8000 });
  await shot(page, "07-back-to-console");

  await page.click('[data-testid="refresh-chat"]');
  await new Promise((r) => setTimeout(r, 600));
  await shot(page, "08-refreshed");

  await page.goto(`${BASE}/?preview=listening&view=focus`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="orb-label"]')?.textContent?.trim() ===
      "Listening",
    { timeout: 15000 },
  );
  await new Promise((r) => setTimeout(r, 800));
  await shot(page, "09-focus-listen-url");

  await browser.close();

  const report = {
    errors,
    afterSendSnippet: afterSend.slice(0, 1200),
    shots: results,
  };
  await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
