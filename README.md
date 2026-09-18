# Flexingg.github.io

Personal resume site — a mechanical engineer's resume that also demonstrates
software skills, via a few interactive pieces built in plain HTML/CSS/JS
(no framework, no build step for the site itself).

## Structure

- `site/` — the deployed static site (this is what GitHub Pages serves)
  - `index.html` — main page: hero, experience, skills, projects, CAD viewer, calculator
  - `resume-print.html` — print-optimized resume, rendered from the same data
  - `data/resume.json` — **single source of truth** for all resume content
  - `js/` — one module per feature (`cad-viewer.js`, `beam-calculator.js`, `project-explorer.js`, `skills-viz.js`)
  - `assets/resume.pdf` — generated at build time, not committed (see below)
- `scripts/build-pdf.js` — renders `resume-print.html` with headless Chrome (Puppeteer) to produce `resume.pdf`
- `.github/workflows/deploy.yml` — on push to `main`: builds the PDF, deploys `site/` to GitHub Pages

## Editing content

Everything text-based (name, experience, education, skills, projects) lives in
`site/data/resume.json`. Edit that one file — both the web page and the PDF
resume are generated from it, so they can't drift out of sync.

Fields still containing `PLACEHOLDER` or `(placeholder)` are sample content
from the initial scaffold — replace them with your real experience.

## Local development

```bash
npm run serve        # serves site/ at http://localhost:8080 (fetch() needs http://, not file://)
npm ci               # installs puppeteer, only needed for PDF generation
npm run build:pdf    # renders resume-print.html -> site/assets/resume.pdf
```

## Deploying

1. Push to `main` on GitHub — the Actions workflow builds the PDF and deploys automatically.
2. In the repo's Settings → Pages, set the source to "GitHub Actions" (one-time setup).
3. Because this repo is named `<username>.github.io`, it serves at the bare
   `https://<username>.github.io/` — no further config needed for that URL.

## Adding a custom domain later

1. Buy/point a domain, add a `CNAME` file to `site/` containing the domain name.
2. In Cloudflare DNS, add a `CNAME` record (or `A`/`AAAA` per GitHub's docs) pointing at `<username>.github.io`.
3. In the repo's Settings → Pages, set the custom domain and enable "Enforce HTTPS".

## Swapping in a real CAD model

`site/js/cad-viewer.js` currently builds a small parametric bracket assembly
out of three.js primitives as a placeholder. To show a real part, replace it
with three.js's `STLLoader`/`GLTFLoader` pointed at an exported model in
`site/assets/models/`.
