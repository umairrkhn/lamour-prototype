# Lamour — Cinematic Edition

A maison-de-parfum landing page concept. Static site — no build step.

## Files
- `Lamour.html` — main document (entry point)
- `index.html` — redirect so GitHub Pages serves `Lamour.html` at the root
- `app.jsx` — React + JSX, loaded via Babel standalone
- `tweaks-panel.jsx` — in-page tweaks panel (optional)

## Run locally
Just open `Lamour.html` in a browser. No install required.

```bash
# or spin up a tiny server for proper CORS / font loading:
python3 -m http.server 5173
# then open http://localhost:5173/Lamour.html
```

## Deploy to GitHub Pages
1. Create a new repo on GitHub and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Lamour landing"
   git branch -M main
   git remote add origin git@github.com:<your-user>/lamour-demo.git
   git push -u origin main
   ```
2. In the repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / root `/`.
3. Wait ~30 seconds. Your site will be live at `https://<your-user>.github.io/lamour-demo/`.

The `index.html` redirect ensures the Pages root resolves to `Lamour.html`.

## Tech
- React 18 + Babel standalone (no bundler)
- Tailwind via CDN
- Google Fonts (Fraunces, Inter, JetBrains Mono)
