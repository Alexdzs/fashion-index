# FASHION INDEX PWA

This package is installable as a Progressive Web App **when served from HTTPS or localhost**. Opening `index.html` or the standalone HTML directly as a file cannot install a PWA because browsers do not allow service workers from `file://` URLs.

## Local test on Mac/PC
```bash
cd fashion-index-pwa-fixed
python3 -m http.server 8080
```
Open `http://localhost:8080` in Chrome/Edge. Localhost is treated as a secure context and the install button should become available.

## Phone installation
Publish this folder to an HTTPS host such as GitHub Pages. Then:
- Android/Chrome: open the HTTPS URL → menu → Install app / Add to Home screen.
- iPhone/Safari: open the HTTPS URL → Share → Add to Home Screen.

The standalone HTML is only for previewing the interface; it is not the installable build.
