/* ==========================================================================
   Grounded v0.6.0 — mindful brain-dump gate.

   Mechanics:
     1. A closed-shadow overlay gates the page at document_start.
     2. A 6-second breathing ritual plays; ANY keypress skips it (and a
        printable skip-key also types itself — no keystroke is eaten).
     3. Free-form canvas: "What's making your mind busy right now?"
        Every character dissolves (fade + blur + random drift) exactly
        1.5s after it is typed. No editing, no re-reading, no judging.
     4. 50 raw printable characters unlock the page: the veil melts and
        the entire overlay removes itself. No WPM, no accuracy, no score.
     5. Escape at any point resets the session back to the breath.

   Isolation: closed shadow root + constructable stylesheet (CSP-immune).
   The only page-visible surface is the empty #grounded-host div, hardened
   by content.css. Keyboard is handled in the capture phase so host-site
   shortcuts (YouTube space/k/f, etc.) stay inert while gated.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* guards: no documentElement yet (paranoia at document_start), or a   */
  /* double injection (bfcache restore, duplicate content script)        */
  /* ------------------------------------------------------------------ */
  var HOST_ID = "grounded-host";
  if (!document.documentElement) return;
  if (document.getElementById(HOST_ID)) return;

  /* ------------------------------------------------------------------ */
  /* constants                                                           */
  /* ------------------------------------------------------------------ */
  var TARGET_CHARS = 50;

  var BREATH_TOTAL_MS = 6000;
  var BREATH_HOLD_MS = 2400;
  var BREATH_EXHALE_MS = 4200;
  var BREATH_FADE_MS = 600;

  var DISSOLVE_DELAY_MS = 1500;
  var DISSOLVE_DURATION_MS = 2000;
  var DISSOLVE_GRACE_MS = 400; /* fallback if transitionend never fires */

  var MELT_MS = 1200;

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  /* Single timer registry. Every timeout in the extension lives here so
     phase transitions (skip / reset / unlock) can cancel everything with
     no orphaned callbacks and no detached-node leaks. */
  var timers = new Set();
  function later(fn, ms) {
    var id = setTimeout(function () {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  }
  function clearTimers() {
    timers.forEach(function (id) {
      clearTimeout(id);
    });
    timers.clear();
  }

  /* ------------------------------------------------------------------ */
  /* shadow boot                                                         */
  /* ------------------------------------------------------------------ */
  var host = el("div");
  host.id = HOST_ID;
  var shadow = host.attachShadow({ mode: "closed" });

  /* styles.js ran before us in the same isolated world (manifest order).
     The __EXT_URL__ token becomes the absolute extension base URL because
     relative URLs inside constructable stylesheets resolve against the
     host page, not the extension. */
  var cssText = "";
  if (typeof globalThis.GROUNDED_SHADOW_CSS === "string") {
    cssText = globalThis.GROUNDED_SHADOW_CSS;
    delete globalThis.GROUNDED_SHADOW_CSS;
  }
  try {
    cssText = cssText.split("__EXT_URL__").join(chrome.runtime.getURL(""));
  } catch (err) {
    /* Extension context invalidated (rare, e.g. mid-update). Font URLs
       degrade to the system mono stack; the overlay still works. */
  }

  /* Constructable stylesheet first (CSP-immune); <style> element as a
     fallback for engines without adoptedStyleSheets support. */
  var styled = false;
  if (typeof CSSStyleSheet !== "undefined" && "adoptedStyleSheets" in shadow) {
    try {
      var sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      shadow.adoptedStyleSheets = [sheet];
      styled = true;
    } catch (err) {
      styled = false;
    }
  }
  if (!styled) {
    var styleEl = el("style");
    styleEl.textContent = cssText;
    shadow.appendChild(styleEl);
  }

  /* ------------------------------------------------------------------ */
  /* dom                                                                 */
  /* ------------------------------------------------------------------ */
  var veil = el("div", "veil");

  var breather = el("div", "breather");
  var breathCircle = el("div", "breath-circle");
  var breathLabel = el("div", "breath-label");
  breather.appendChild(breathCircle);
  breather.appendChild(breathLabel);

  var stage = el("div", "stage hidden");
  var prompt = el("div", "prompt");
  prompt.textContent = "What’s making your mind busy right now?";
  var canvas = el("div", "canvas");
  var counter = el("div", "counter");
  stage.appendChild(prompt);
  stage.appendChild(canvas);
  stage.appendChild(counter);

  veil.appendChild(breather);
  veil.appendChild(stage);
  shadow.appendChild(veil);

  document.documentElement.appendChild(host);
  document.documentElement.classList.add("grounded-scroll-lock");

  /* ------------------------------------------------------------------ */
  /* state machine: breath -> (revealing) -> type -> done                */
  /* ------------------------------------------------------------------ */
  var phase = "breath";
  var typed = 0;

  function renderCounter() {
    counter.textContent = typed + " / " + TARGET_CHARS;
  }

  function startBreath() {
    phase = "breath";
    breathLabel.textContent = "Inhale slowly…";
    breathCircle.classList.remove("breathing");
    void breathCircle.offsetWidth; /* force reflow: restarts the animation */
    breathCircle.classList.add("breathing");
    later(function () {
      breathLabel.textContent = "Hold…";
    }, BREATH_HOLD_MS);
    later(function () {
      breathLabel.textContent = "Exhale fully…";
    }, BREATH_EXHALE_MS);
    later(finishBreath, BREATH_TOTAL_MS);
  }

  function showStage() {
    if (breather.parentNode) breather.parentNode.removeChild(breather);
    stage.classList.remove("hidden");
    phase = "type";
    renderCounter();
  }

  function finishBreath() {
    if (phase !== "breath") return; /* a manual skip already landed */
    phase = "revealing";
    breather.classList.add("gone");
    later(showStage, BREATH_FADE_MS);
  }

  function skipBreath() {
    clearTimers(); /* only breath timers exist this early — chars are
                      impossible before the stage is shown */
    showStage();
  }

  function resetSession() {
    clearTimers();
    canvas.replaceChildren();
    typed = 0;
    stage.classList.add("hidden");
    breather.classList.remove("gone");
    if (!breather.parentNode) veil.insertBefore(breather, stage);
    startBreath();
  }

  function spawnChar(ch) {
    var span = el("span", "ch");
    span.textContent = ch;
    /* random per-char drift vector so the text scatters like ash */
    span.style.setProperty("--dx", (Math.random() * 24 - 12).toFixed(1) + "px");
    span.style.setProperty("--rot", (Math.random() * 8 - 4).toFixed(2) + "deg");
    canvas.appendChild(span);

    later(function () {
      span.classList.add("dissolve");
      var dead = false;
      var bury = function () {
        if (dead) return; /* transitionend fires once per property */
        dead = true;
        if (span.parentNode) span.parentNode.removeChild(span);
      };
      span.addEventListener("transitionend", bury, { once: true });
      later(bury, DISSOLVE_DURATION_MS + DISSOLVE_GRACE_MS);
    }, DISSOLVE_DELAY_MS);
  }

  function unlock() {
    if (phase === "done") return;
    phase = "done";
    clearTimers();
    window.removeEventListener("keydown", onKeyDown, true);
    veil.classList.add("melt");
    later(function () {
      document.documentElement.classList.remove("grounded-scroll-lock");
      if (host.parentNode) host.parentNode.removeChild(host);
    }, MELT_MS);
  }

  function typeChar(ch) {
    spawnChar(ch);
    typed += 1;
    renderCounter();
    if (typed >= TARGET_CHARS) unlock();
  }

  function typeNewline() {
    canvas.appendChild(document.createElement("br"));
  }

  /* ------------------------------------------------------------------ */
  /* keyboard — capture phase, registered at document_start, so we see   */
  /* keys before (and can starve) every host-page handler                */
  /* ------------------------------------------------------------------ */
  function swallow(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onKeyDown(e) {
    if (phase === "done") return;

    /* Browser/system shortcuts (ctrl/cmd/alt combos) pass through
       untouched — they are the escape hatches. Exception: AltGr reports
       as ctrl+alt but types real characters, so it stays. */
    var altGr = e.ctrlKey && e.altKey;
    if ((e.ctrlKey || e.metaKey || e.altKey) && !altGr) return;

    var key = e.key;

    if (key === "Escape") {
      swallow(e);
      resetSession();
      return;
    }

    if (phase === "breath") {
      /* any keypress skips the ritual; a printable key also types itself */
      swallow(e);
      skipBreath();
      if (key === "Enter") typeNewline();
      else if (key.length === 1) typeChar(key);
      return;
    }

    if (phase !== "type") return; /* 600ms "revealing" fade: ignore input */

    /* While gated the page behind the veil stays inert: every key is
       swallowed; only printables and Enter are rendered. Navigation keys
       (Tab, Backspace, arrows, ...) are eaten so the site cannot react. */
    swallow(e);
    if (key === "Enter") typeNewline();
    else if (key.length === 1) typeChar(key);
  }

  window.addEventListener("keydown", onKeyDown, true);

  /* ------------------------------------------------------------------ */
  /* go                                                                  */
  /* ------------------------------------------------------------------ */
  startBreath();
})();
