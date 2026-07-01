# Dev loop

Fast iteration without CDN caching, version bumps, or Tampermonkey update clicks.

## One-time setup

Tampermonkey only offers its install page for a URL that **ends in `.user.js`**.
"Import from file" is for TM's own backup dumps, and `file://` URLs won't trigger it
on Firefox — so install the loader by serving it and opening the served URL:

1. Start the server (leave it running):
   ```sh
   dev/serve.sh          # serves the repo at http://localhost:8765
   ```
2. In Firefox, navigate to
   **http://localhost:8765/dev/old-reddit.dev.user.js** — Tampermonkey intercepts
   the `.user.js` URL and shows its install page. Click **Install**.
3. Approve the loader's `@connect localhost` prompt (it needs to fetch from your
   machine). If you don't see it, Tampermonkey → **Settings → Config mode: Advanced**.

(Alternatively, install from the pushed copy:
`https://raw.githack.com/toothbrush/old-reddit.gist/main/dev/old-reddit.dev.user.js`.)

## Each session

Make sure `dev/serve.sh` is running.

Then: **edit `old-reddit.user.js` → save → reload the reddit tab.** Changes are live
immediately — the loader re-fetches on every page load with a cache-buster.

## When done

**Disable/uninstall the dev loader** so you're testing the real published script again.
The published `old-reddit.user.js` self-updates via `@updateURL` (raw.githack), so
prod users need nothing.

## Notes

- Works because `old-reddit.user.js` is `@grant none` — pure page code, so eval'ing it
  in the loader is equivalent to a native install.
- The loader's fetch is async, so on **new-reddit** pages the redirect fires slightly
  late and strict CSP may block the eval. Use the loader to iterate the **old.reddit.com**
  CSS; trust the installed/published script for redirect behaviour.
