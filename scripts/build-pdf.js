// Renders site/resume-print.html with headless Chrome and writes the PDF
// used by the "Download PDF Resume" button, so the web and PDF versions are
// generated from the same data/resume.json (never edited separately).
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, "..", "site");
const OUT_PATH = path.join(SITE_DIR, "assets", "resume.pdf");
const PORT = 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function startServer() {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const filePath = path.join(SITE_DIR, urlPath === "/" ? "/index.html" : urlPath);
    if (!filePath.startsWith(SITE_DIR)) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const body = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function main() {
  await fs.mkdir(path.join(SITE_DIR, "assets"), { recursive: true });

  const server = await startServer();
  // --no-sandbox is required in most containerized CI/dev environments where
  // Chrome's own sandbox can't use unprivileged user namespaces. We only ever
  // load our own local static files here, so the reduced isolation is fine.
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}/resume-print.html`, { waitUntil: "networkidle0" });
    await page.waitForSelector('body[data-render-complete="true"]', { timeout: 10000 });
    await page.pdf({
      path: OUT_PATH,
      format: "Letter",
      printBackground: true,
      margin: { top: "0in", bottom: "0in", left: "0in", right: "0in" },
    });
    console.log(`Wrote ${path.relative(process.cwd(), OUT_PATH)}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
