# Frequency Oasis // WORLD SIGNAL

Every city has a heartbeat. A living, browser-based atlas of the world's live radio —
a dot-projected globe where every beacon is a real station pulled from the
[Radio Browser](https://www.radio-browser.info/) directory, playable in a studio-style
player with real-time Web Audio visualizers.

No build step. No framework. Pure HTML5 / CSS / vanilla JS.

## Files

```
index.html          the entire app (markup + styles + logic)
manifest.json        web app manifest (installability, icons, shortcuts)
sw.js                 service worker (offline app-shell caching)
favicon.png            32×32 favicon
icons/
  favicon-16.png
  favicon-32.png
  icon-192.png / icon-192-maskable.png
  icon-512.png / icon-512-maskable.png
  icon-1024.png         source-quality icon (store listings, splash art, etc.)
  apple-touch-icon.png   180×180, for iOS home-screen
```

## Running it locally

Service workers and installability both require a real origin — `file://` won't
cut it. Serve the folder over HTTP:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` (or whatever port your tool prints).

## Deploying

Any static host works — GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3 + CloudFront.
Two things matter for installability:

1. **HTTPS.** Browsers refuse to register service workers or offer the install
   prompt over plain HTTP (`localhost` is exempted for local dev).
2. **Correct MIME types.** `manifest.json` should be served as
   `application/manifest+json` or `application/json`; `sw.js` as
   `text/javascript` or `application/javascript`. Every static host above
   gets this right by default — only worth checking if you're rolling your
   own server.

### GitHub Pages

```bash
git init
git add .
git commit -m "Frequency Oasis // WORLD SIGNAL"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then enable Pages in the repo settings (Settings → Pages → Deploy from branch → `main` / root).

## What's live vs. cosmetic

- **Live and real:** the station directory, the globe's beacon positions,
  audio streaming, the Web Audio-driven spectrum/scope/VU visualizers,
  weather/sunrise/local-time facts, country facts in Discover mode.
- **Cosmetic layer, by design:** the Time Machine only re-skins the UI
  (sepia/CRT/neon filters) — it does not fetch historical station data, since
  no such archive exists publicly. This is stated in the panel itself.
- **Session-scoped:** achievements persist via `localStorage` on the visitor's
  device; everything else (rotation, zoom, now-playing) resets on reload, same
  as any page refresh would.

## Station directory reliability

The globe ships with a **built-in set of ~20 curated, long-running public
stations** (BBC World Service, Radio Swiss Jazz/Classic/Pop, France's FIP/
France Info/France Musique, Deutschlandfunk, KEXP, Jazz24, and a spread of
SomaFM channels) baked directly into `index.html`. This set loads instantly
with **zero network requests** — the globe is populated and playable the
moment you click in, regardless of whether any external API is reachable.

In the background, the app also tries to reach the [Radio Browser](https://www.radio-browser.info/)
directory (a community-run, mirrored API) to upgrade to its full multi-
thousand-station catalog. If that succeeds, it swaps in silently and shows
a toast. If it's blocked or unreachable — some corporate networks, proxies,
and privacy/VPN browser extensions block third-party `fetch()` calls even
when the same URL loads fine typed directly into the address bar — the app
just keeps using the built-in set, with no error screen and nothing for the
visitor to troubleshoot. A small "↻ try live directory" link near the
signal count lets anyone retry the upgrade on demand.

## Service worker scope

`sw.js` only ever intercepts same-origin `GET` requests for the app shell
(`index.html`, `manifest.json`, icons). It deliberately never touches the
Radio Browser API, live audio streams, weather/country APIs, or web fonts —
those need to stay live, not cached, for the app to mean anything.

## Icons

Generated programmatically to match the in-app palette (void black, brass
`#c9a15e`, signal cyan `#5fd0d6`, plus the nine genre colors used on the
globe). `icon-*-maskable.png` variants keep their content inside the safe
zone Android expects for adaptive icons. Regenerate or restyle them however
you like — nothing else in the app depends on their exact pixels.
