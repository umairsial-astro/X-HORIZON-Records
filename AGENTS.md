# X HORIZON — repo notes for agents

## What this repo is
A **static export** of the X HORIZON space-science website (originally an Odoo website).
There is no build step, no package manifest and no backend code: `Backup/` holds the page
HTML, `Media/` and `Resources/` hold images, slides, videos, PDFs and textures.

## How it runs
`docker-compose.base44.yml` runs `nginx:alpine` with the repo bind-mounted read-only at
`/app` and `.base44/nginx.conf` as its config. Host port `3000` is the site.

- `/` is `Backup/Homepage .html`.
- Every other clean URL the pages link to (e.g. `/concepts`, `/career`, `/black-hole`) is
  an entry in the `map $uri $xh_page` block of `.base44/nginx.conf`, pointing at the
  exported file that backs it. Add a line there when wiring another page.
- Files under `Backup/` can also be requested by their literal path (URL-encoded spaces).

## Quirks worth knowing
- Most pages are **HTML fragments** (they start with `<meta>`/`<style>` and have no
  `<html>`/`<body>` wrapper). Browsers render them fine; don't "fix" them.
- `Backup/Header.html` and `Backup/Footer.html` are Odoo layout snippets, not pages.
- `Backup/Media/History.txt` and `Backup/Media/Videos.txt` are **HTML with a `.txt`
  extension**; nginx serves them as `text/html` for `/history` and `/videos`.
- Routes with no exported page (`/forum`, `/slides`, `/categories`, `/contactus`,
  `/founder`, `/our-team`, `/donations`, `/web/login`, ...) intentionally 404 — the
  static export does not contain them.
- All page imagery/fonts come from external CDNs (Unsplash, NASA images, Google Fonts,
  cdnjs). There are no local asset references.
- Some features were backed by the Odoo server or Firebase and are inert here:
  `window.XHorizonFirebaseReady` in `Backup/Backend Functionality.js` has a redacted
  `apiKey`, `/videos` expects a Firebase custom token, and the AI panel, ratings and
  header call `/web/session/get_session_info`. NASA APOD uses the public `DEMO_KEY`.
  Nothing above is required just to browse the site.

## Editing and verifying
- Static files: edit, then refresh the preview (there is no dev server to hot-reload —
  nginx serves from the bind mount, so a browser reload is enough; use `reload_preview`).
- Verify from the host: `curl -sS http://localhost:3000/ | grep -o '<title>[^<]*'` and the
  same for a route, e.g. `curl -sS http://localhost:3000/career | grep -o '<title>[^<]*'`.
- Logs: `docker compose -f docker-compose.base44.yml logs -f web`.
