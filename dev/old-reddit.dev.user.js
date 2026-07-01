// ==UserScript==
// @name         old-reddit (DEV loader)
// @namespace    https://github.com/toothbrush/old-reddit.gist
// @version      1.0
// @description  Dev-only: fetch old-reddit.user.js from localhost on every load. Edit + reload = instant. UNINSTALL when done — the published script self-updates on its own.
// @match        *://reddit.com/*
// @match        *://www.reddit.com/*
// @match        *://np.reddit.com/*
// @match        *://old.reddit.com/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-start
// ==/UserScript==

/*
 * Install this ONCE in Tampermonkey, then run `dev/serve.sh` from the repo.
 * Now: edit old-reddit.user.js -> save -> reload the reddit tab. That's the loop.
 *
 * It works because the real script is `@grant none` (pure page code, no GM_*
 * APIs), so eval'ing its text here behaves identically to a native install.
 *
 * Caveat: this fetch is async, so on a *new-reddit* page the redirect fires a
 * beat late (and new reddit's strict CSP may block the eval entirely). Iterate
 * the old.reddit.com CSS with this; trust the published script for redirects.
 */

(function () {
  "use strict";
  var PORT = 8765;
  var url = "http://localhost:" + PORT + "/old-reddit.user.js?t=" + Date.now();
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    onload: function (r) {
      if (r.status < 200 || r.status >= 300) {
        console.warn("[old-reddit dev] HTTP " + r.status + " from " + url);
        return;
      }
      try {
        (0, eval)(r.responseText); // indirect eval → runs in global scope
        console.log("[old-reddit dev] loaded live script from localhost");
      } catch (e) {
        console.error("[old-reddit dev] eval failed (page CSP may block it):", e);
      }
    },
    onerror: function () {
      console.warn("[old-reddit dev] fetch failed — is dev/serve.sh running on :" + PORT + "?");
    },
  });
})();
