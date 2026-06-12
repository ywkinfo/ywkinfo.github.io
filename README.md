# Peter Won-Kil Yoon Profile Site

Independent bilingual profile site for Peter Won-Kil Yoon, built as a plain static site for GitHub Pages.

## Structure

- `index.html`: page shell, metadata, and prerendered Korean content
- `assets/styles.css`: responsive styles and theme
- `assets/render.js`: pure HTML templates shared by the browser and the prerender script
- `assets/app.js`: language toggle and client-side rendering
- `data/profile-data.js`: curated bilingual content
- `scripts/prerender.mjs`: bakes the Korean version into `index.html`
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow (deploys only the profile files)

## Updating content

Edit `data/profile-data.js`, then regenerate the static Korean content so the
page stays readable without JavaScript:

```bash
node scripts/prerender.mjs
```

## Local preview

Run a simple static file server from the repository root, for example:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Content notes

- The site is an independent profile page, not a mirror of any official website.
- Facts were curated from publicly available professional profile pages and related official materials.
- Official profile and related source pages are linked from the site.
