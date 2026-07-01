# Dev loop

Fast iteration without CDN caching, version bumps, or Tampermonkey update clicks.

## One-time setup

1. In Tampermonkey → **Utilities → Import from file** (or open the raw file), install
   `dev/old-reddit.dev.user.js`.
2. Tampermonkey → **Settings → Config mode: Advanced**, then confirm the loader's
   `@connect localhost` prompt (it needs to fetch from your machine).

## Each session

```sh
dev/serve.sh          # serves the repo at http://localhost:8765
```

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
