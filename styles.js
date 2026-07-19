/* ==========================================================================
   Grounded v0.6.0 — shadow stylesheet (data only, no logic)

   This string is injected into the closed shadow root by content.js via
   CSSStyleSheet.replaceSync() (constructable stylesheet). Because the sheet
   is created through CSSOM instead of being parsed from markup, it is NOT
   subject to the host page's Content-Security-Policy style-src — which is
   why this survives x.com, where a <style> element or a Google Fonts
   @import would be blocked outright.

   "__EXT_URL__" is a placeholder replaced at runtime with
   chrome.runtime.getURL("") so @font-face sources become absolute
   chrome-extension:// URLs (relative URLs inside constructable stylesheets
   resolve against the HOST page's base URL, never against the extension).

   Loaded before content.js via manifest content_scripts.js ordering; the
   two content scripts share the same isolated-world globalThis.
   ========================================================================== */

"use strict";

globalThis.GROUNDED_SHADOW_CSS = `

/* ---- bundled Roboto Mono (variable file per subset, instantiated per
       font-weight descriptor — same pattern Google Fonts serves) ------- */

@font-face {
  font-family: "Grounded Mono";
  src: url("__EXT_URL__fonts/roboto-mono-cyrillic.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Grounded Mono";
  src: url("__EXT_URL__fonts/roboto-mono-cyrillic.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Grounded Mono";
  src: url("__EXT_URL__fonts/roboto-mono-latin-ext.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Grounded Mono";
  src: url("__EXT_URL__fonts/roboto-mono-latin-ext.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Grounded Mono";
  src: url("__EXT_URL__fonts/roboto-mono-latin.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Grounded Mono";
  src: url("__EXT_URL__fonts/roboto-mono-latin.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* ---- host reset: kills inherited page properties that cross the shadow
       boundary (font, color, line-height, text-align, ...) ------------- */

:host {
  all: initial;
}

/* ---- veil: the fullscreen overlay ------------------------------------ */

.veil {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 24px;
  border: 0;
  background: rgba(31, 35, 38, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
  font-family: "Grounded Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 16px;
  line-height: 1.5;
  color: #d1d0c5;
  direction: ltr;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  cursor: default;
  opacity: 1;
  transform: none;
  transition:
    opacity 1.1s ease-in,
    transform 1.3s ease,
    backdrop-filter 1.1s ease;
}

/* unlock "melt": whole veil lifts, defocuses and dissolves */
.veil.melt {
  opacity: 0;
  transform: scale(1.04);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  pointer-events: none;
}

.hidden {
  display: none;
}

/* ---- breathing ritual (6s, skippable) --------------------------------- */

.breather {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  opacity: 1;
  transition: opacity 0.6s ease;
}

.breather.gone {
  opacity: 0;
}

.breath-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid #4c5450;
  background: rgba(76, 84, 80, 0.15);
  transform: scale(1);
}

.breath-circle.breathing {
  animation: grounded-breathe 6s ease-in-out forwards;
}

/* 6s cycle: inhale 0-40% (2.4s), hold 40-70% (1.8s), exhale 70-100% (1.8s) */
@keyframes grounded-breathe {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.6); }
  70%  { transform: scale(1.6); }
  100% { transform: scale(1); }
}

.breath-label {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: #6b7570;
}

/* ---- typing stage ------------------------------------------------------ */

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.prompt {
  max-width: 560px;
  margin: 0 0 32px;
  padding: 0;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.01em;
  color: #6b7570;
  animation: grounded-rise 0.8s ease both;
}

@keyframes grounded-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.canvas {
  width: 100%;
  max-width: 620px;
  max-height: 45vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-size: 28px;
  font-weight: 400;
  line-height: 1.7;
  color: #d1d0c5;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* One span per typed character.
   inline-block is mandatory: CSS transforms are ignored on plain inline
   boxes, and white-space:pre keeps space characters from collapsing.
   translate3d + will-change keep every dissolve on the compositor. */
.ch {
  display: inline-block;
  white-space: pre;
  opacity: 1;
  filter: blur(0px);
  transform: translate3d(0, 0, 0);
  will-change: opacity, filter, transform;
  animation: grounded-ch-in 0.18s ease-out backwards;
  transition:
    opacity 2s ease-in-out,
    filter 2s ease-in-out,
    transform 2s ease-in-out;
}

@keyframes grounded-ch-in {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

/* Applied 1.5s after the keystroke. --dx / --rot are randomized per
   character from JS so the text drifts apart like ash instead of
   disappearing as one uniform block. */
.ch.dissolve {
  opacity: 0;
  filter: blur(8px);
  transform: translate3d(var(--dx, 0px), -18px, 0) rotate(var(--rot, 2deg));
}

.counter {
  margin: 35px 0 0;
  padding: 0;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: normal;
  color: #4c5450;
  opacity: 0.6;
}

/* ---- reduced motion: dissolve degrades to a quick plain fade ---------- */

@media (prefers-reduced-motion: reduce) {
  .ch {
    animation: none;
    transition-duration: 0.3s;
  }
  .ch.dissolve {
    filter: none;
    transform: none;
  }
  .breath-circle.breathing {
    animation-duration: 0.01s;
  }
  .prompt {
    animation: none;
  }
  .veil {
    transition-duration: 0.3s;
  }
  .breather {
    transition-duration: 0.2s;
  }
}
`;
