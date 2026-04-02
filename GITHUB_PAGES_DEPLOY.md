# GitHub Pages Deploy Notes

This site is path-safe for GitHub Pages project deployments because local assets use relative paths (`./...`).

## Required publish layout

Publish this project with these files at the repository root on the Pages branch:

- `index.html`
- `assets/`
- `manifest.webmanifest`
- `sw.js`
- `favicon.svg`
- `.nojekyll`

Do not publish the project from a nested folder unless Pages is configured for that folder.

## Path checks before deploy

Run these from the project root:

```sh
rg -n 'href="/|src="/' index.html assets/js/main.js assets/css/styles.css sw.js manifest.webmanifest
```

Expected result: no local root-absolute references.

```sh
rg -n './assets/css/styles.css|./assets/js/main.js|./manifest.webmanifest|./favicon.svg|./sw.js' index.html
```

Expected result: all core local references are relative.

## Runtime checks after deploy

Open DevTools and verify no 404s for:

- `assets/css/styles.css`
- `assets/js/main.js`
- `assets/images/*`
- `assets/video/*`
- `manifest.webmanifest`
- `sw.js`

## Service worker note

The service worker cache version is bumped for this release. After deploy, do one hard refresh if the browser had an older version cached.
