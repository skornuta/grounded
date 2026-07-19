(function () {
  if (document.getElementById("grounding-overlay")) return;

  var TARGET_CHAR_COUNT = 50;
  var DISSOLVE_DELAY_MS = 1500;
  var DISSOLVE_DURATION_MS = 2000;

  var overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  var breatherEl = document.createElement("div");
  breatherEl.id = "grounding-breather";
  var breatherCircle = document.createElement("div");
  breatherCircle.className = "breather-circle";
  var breatherLabel = document.createElement("div");
  breatherLabel.className = "breather-label";
  breatherEl.appendChild(breatherCircle);
  breatherEl.appendChild(breatherLabel);

  var headingEl = document.createElement("div");
  headingEl.id = "grounding-heading";
  headingEl.textContent =
    "What is making your mind busy right now? Type it out to clear your head...";

  var canvasEl = document.createElement("div");
  canvasEl.id = "grounding-canvas";

  var statsEl = document.createElement("div");
  statsEl.id = "grounding-stats";
  var statProgress = document.createElement("span");
  statsEl.appendChild(statProgress);

  headingEl.classList.add("hidden");
  canvasEl.classList.add("hidden");
  statsEl.classList.add("hidden");

  overlay.appendChild(breatherEl);
  overlay.appendChild(headingEl);
  overlay.appendChild(canvasEl);
  overlay.appendChild(statsEl);
  document.documentElement.appendChild(overlay);

  var isBreathingPhase = true;
  var breathingTimeoutIds = [];
  var canvasTimeoutIds = [];
  var typedCount = 0;
  var startedAt = Date.now();

  function updateProgress() {
    statProgress.textContent = typedCount + " / " + TARGET_CHAR_COUNT;
  }

  function clearBreathingTimers() {
    for (var i = 0; i < breathingTimeoutIds.length; i++) {
      clearTimeout(breathingTimeoutIds[i]);
    }
    breathingTimeoutIds = [];
  }

  function clearCanvasTimers() {
    for (var i = 0; i < canvasTimeoutIds.length; i++) {
      clearTimeout(canvasTimeoutIds[i]);
    }
    canvasTimeoutIds = [];
  }

  function runBreathingCycle() {
    clearBreathingTimers();

    breatherEl.classList.remove("fade-out");
    breatherCircle.classList.remove("breathing");
    void breatherCircle.offsetWidth;
    breatherCircle.classList.add("breathing");
    breatherLabel.textContent = "Inhale slowly...";

    breathingTimeoutIds.push(
      setTimeout(function () {
        breatherLabel.textContent = "Hold...";
      }, 4000),
    );
    breathingTimeoutIds.push(
      setTimeout(function () {
        breatherLabel.textContent = "Exhale fully...";
      }, 8000),
    );
    breathingTimeoutIds.push(setTimeout(finishBreathingPhase, 12000));
  }

  function finishBreathingPhase() {
    breathingTimeoutIds = [];
    isBreathingPhase = false;
    breatherEl.classList.add("fade-out");
    headingEl.classList.remove("hidden");
    canvasEl.classList.remove("hidden");
    statsEl.classList.remove("hidden");
  }

  function startBreathingPhase() {
    clearCanvasTimers();
    while (canvasEl.firstChild) {
      canvasEl.removeChild(canvasEl.firstChild);
    }
    typedCount = 0;
    updateProgress();

    headingEl.classList.add("hidden");
    canvasEl.classList.add("hidden");
    statsEl.classList.add("hidden");

    isBreathingPhase = true;
    runBreathingCycle();
  }

  function appendLineBreak() {
    canvasEl.appendChild(document.createElement("br"));
  }

  function appendDissolvingChar(ch) {
    var charSpan = document.createElement("span");
    charSpan.className = "canvas-char";
    charSpan.textContent = ch;
    canvasEl.appendChild(charSpan);

    var dissolveTimeoutId = setTimeout(function () {
      charSpan.classList.add("dissolve");

      var removeTimeoutId = setTimeout(function () {
        if (charSpan.parentNode) {
          charSpan.parentNode.removeChild(charSpan);
        }
      }, DISSOLVE_DURATION_MS);
      canvasTimeoutIds.push(removeTimeoutId);
    }, DISSOLVE_DELAY_MS);
    canvasTimeoutIds.push(dissolveTimeoutId);
  }

  function unlock() {
    clearCanvasTimers();
    window.removeEventListener("keydown", onKeyDown);
    var elapsedSec = Math.round((Date.now() - startedAt) / 1000);
    console.log("[grounded] session finished in " + elapsedSec + "s");
    overlay.classList.add("fade-out");
    setTimeout(function () {
      overlay.remove();
    }, 500);
  }

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === "Escape") {
      startBreathingPhase();
      return;
    }

    if (isBreathingPhase) return;

    if (e.key === "Enter") {
      appendLineBreak();
      return;
    }

    if (e.key.length !== 1) return;

    appendDissolvingChar(e.key);
    typedCount++;
    updateProgress();

    if (typedCount >= TARGET_CHAR_COUNT) {
      unlock();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  startBreathingPhase();
})();
