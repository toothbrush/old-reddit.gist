// ==UserScript==
// @name         old-reddit
// @namespace    https://github.com/toothbrush/old-reddit.gist
// @updateURL    https://raw.githack.com/toothbrush/old-reddit.gist/main/old-reddit.user.js
// @downloadURL  https://raw.githack.com/toothbrush/old-reddit.gist/main/old-reddit.user.js
// @version      0.5
// @description  Force old.reddit.com everywhere, and make it flow on mobile.
// @author       toothbrush
// @match        *://reddit.com/*
// @match        *://www.reddit.com/*
// @match        *://np.reddit.com/*
// @match        *://old.reddit.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

/*
 * Two jobs, no persistence, no permissions:
 *   1. Redirect any non-old.reddit.com host to its old.reddit.com equivalent
 *      (path/query/hash preserved). Runs at document-start so we bail before the
 *      new-reddit bundle loads.
 *   2. On old.reddit.com, inject a small responsive stylesheet so threads flow on
 *      a narrow screen — the right-hand sidebar collapses away and content goes
 *      full-width.
 *
 * @grant none: we use no GM_* APIs, so this runs identically on desktop
 * Tampermonkey and iOS Safari "Userscripts".
 */

(function () {
  "use strict";

  // Read the version from GM_info so it never drifts from @version; "(unknown)"
  // on hosts that don't expose GM_info (e.g. some iOS setups).
  var VERSION = (typeof GM_info !== "undefined" && GM_info.script && GM_info.script.version) || "(unknown)";
  console.log("[old-reddit] v" + VERSION + " running on " + location.hostname);

  var host = location.hostname;

  // ---- 1. redirect to old.reddit.com ----
  // Anything that isn't already old.reddit.com (reddit.com, www., np., …) gets
  // sent to the old.reddit.com equivalent. document-start means this fires
  // before the SPA boots, so there's no flash of new reddit.
  if (host !== "old.reddit.com") {
    location.replace("https://old.reddit.com" + location.pathname + location.search + location.hash);
    return; // stop: the page is navigating away
  }

  // ---- 2. force a mobile viewport ----
  // old.reddit.com ships no width=device-width viewport, so phones render it at
  // ~980px desktop width and scale down — meaning our media query below would
  // never match. Overwrite (or add) the viewport so device width is used and the
  // responsive rules actually fire.
  function fixViewport() {
    var vp = document.querySelector("meta[name='viewport']");
    if (!vp) {
      vp = document.createElement("meta");
      vp.name = "viewport";
      (document.head || document.documentElement).appendChild(vp);
    }
    vp.setAttribute("content", "width=device-width, initial-scale=1");
  }

  // ---- 3. zapped elements (hidden everywhere) ----
  // One selector per line — add here to nuke clutter regardless of screen size.
  var zap = [
    "section.infobar",   // "welcome to reddit" / notice banners
    ".midcol",           // up/down vote column (removes voting — trade for space)
    "a.thumbnail",       // link thumbnails / blank placeholder circles
    ".panestack-title",  // section header above listings
    ".menuarea",         // sort/tab bar under the listing header
    "#sr-header-area",   // top subreddit nav strip
  ].join(", ") + " { display: none !important; }";

  // ---- 4. minimal responsive styling for old.reddit.com ----
  var css = [
    zap,
    "@media (max-width: 900px) {",
    // Kill the right-hand sidebar and give its space back to the threads.
    "  .side { display: none !important; }",
    "  .content[role='main'], body > .content { margin: 0 !important; padding: 5px !important; }",
    "  #header-bottom-right { display: none !important; }",  // login/prefs clutter in the header
    // Let listings and comment trees use the full width.
    "  .listing-page .content, .comments-page .content { width: auto !important; }",
    "  .thing .entry { overflow: hidden; }",
    // Rein in deep comment indentation so replies stay readable on a phone.
    "  .commentarea .child { margin-left: 8px !important; }",
    // Lock the viewport to vertical scrolling only. overflow-x:hidden must be on
    // BOTH html and body — the scroll container is often <html>, and clamping
    // only body leaves the page still able to pan sideways. width (not just
    // max-width) kills any layout wrapper that sets an explicit min/px width.
    "  html, body { overflow-x: hidden !important; max-width: 100% !important; }",
    // Any single wide child (images, video, embeds, tables, code) can push the
    // page wider than the viewport even with the clamps above — cap them all.
    "  img, video, iframe, embed, object, table, pre, blockquote {",
    "    max-width: 100% !important;",
    "  }",
    "  pre, code { white-space: pre-wrap !important; word-break: break-word; }",
    "  table { display: block; overflow-x: auto; }",  // wide tables scroll internally, not the page
    "}",
  ].join("\n");

  function setup() {
    fixViewport();
    var style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // document-start can run before <head> exists; wait for it if so.
  if (document.head) setup();
  else document.addEventListener("DOMContentLoaded", setup);
})();
