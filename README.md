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

For the separate Android APK on a Pixel, open `https://alexdzs.github.io/fashion-index/downloads/`, tap **DESCARGAR APK**, then open `FashionIndex.apk` from the download notification or Files → Downloads. If prompted, allow installation from Chrome or Files and open the APK again. Downloading alone does not install the app. The web app's INSTALL menu also links to these instructions on Android.

The standalone HTML is only for previewing the interface; it is not the installable build.
