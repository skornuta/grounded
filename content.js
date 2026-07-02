(function () {
  if (document.getElementById("grounding-overlay")) return;

  var QUOTES = [
    "Look up at the sky. It's beautiful out there.",
    "Step outside. The fresh air is waiting for you.",
    "The trees don't care about your notifications.",
    "Close your eyes. Take a slow breath. Now another.",
    "Sunlight on your face costs nothing and fixes everything.",
    "The world outside is still there. Go check on it.",
    "Your best ideas come when you're away from the screen.",
    "Even five minutes outside will change how you feel.",
    "Nature has no loading screens. Go explore it.",
    "Put it down. The internet will still be here later.",

    // testing some multi lane poems
    "I am not afraid of the storms, \nfor I am learning how to sail my ship.",
    "In the middle of difficulty,\nlies opportunity.",
    "The cure for anything\nis salt water:\nsweat, tears, or the sea.",
  ];

  var BACKUP_SENTENCES = [
    "Breathe in. Breathe out.",
    "There is no rush here.",
    "Feel your feet on the floor.",
    "Notice the weight of your hands.",
    "Let your shoulders drop.",
  ];

  var ZEN_THRESHOLD_MS = 250;
  var RUSH_STREAK_LIMIT = 3;
  var PENALTY_DURATION_MS = 2500;

  var overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  var quoteContainer = document.createElement("div");
  quoteContainer.id = "grounding-quote";

  var statsEl = document.createElement("div");
  statsEl.id = "grounding-stats";
  var statProgress = document.createElement("span");
  statsEl.appendChild(statProgress);

  var warningEl = document.createElement("div");
  warningEl.id = "grounding-warning";
  warningEl.textContent = "Breathe. You are moving too fast. Slow down.";

  var breatherEl = document.createElement("div");
  breatherEl.id = "grounding-breather";
  var breatherCircle = document.createElement("div");
  breatherCircle.className = "breather-circle";
  var breatherLabel = document.createElement("div");
  breatherLabel.className = "breather-label";
  breatherEl.appendChild(breatherCircle);
  breatherEl.appendChild(breatherLabel);

  quoteContainer.classList.add("hidden");
  statsEl.classList.add("hidden");

  overlay.appendChild(breatherEl);
  overlay.appendChild(quoteContainer);
  overlay.appendChild(statsEl);
  overlay.appendChild(warningEl);
  document.documentElement.appendChild(overlay);

  var spans = [];
  var charMap = [];
  var currentIndex = 0;
  var lastQuoteIdx = -1;
  var quote = "";
  var lastKeyTime = null;
  var rushStreak = 0;
  var isPenalized = false;
  var penaltyTimeoutId = null;
  var currentWordDiv = null;
  var isBreathingPhase = true;
  var breathingTimeoutIds = [];

  function updateProgress() {
    statProgress.textContent = currentIndex + " / " + spans.length;
  }

  function clearBreathingTimers() {
    for (var i = 0; i < breathingTimeoutIds.length; i++) {
      clearTimeout(breathingTimeoutIds[i]);
    }
    breathingTimeoutIds = [];
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
    breathingTimeoutIds.push(
      setTimeout(function () {
        breatherLabel.textContent = "Hold...";
      }, 12000),
    );
    breathingTimeoutIds.push(setTimeout(finishBreathingPhase, 16000));
  }

  function finishBreathingPhase() {
    breathingTimeoutIds = [];
    isBreathingPhase = false;
    breatherEl.classList.add("fade-out");
    quoteContainer.classList.remove("hidden");
    statsEl.classList.remove("hidden");
    loadQuote();
  }

  function startBreathingPhase() {
    if (penaltyTimeoutId) {
      clearTimeout(penaltyTimeoutId);
      penaltyTimeoutId = null;
    }
    isPenalized = false;
    rushStreak = 0;
    lastKeyTime = null;
    currentWordDiv = null;
    currentIndex = 0;
    charMap = [];
    spans = [];

    quoteContainer.classList.remove("rushing");
    quoteContainer.classList.remove("loading");
    quoteContainer.classList.add("hidden");
    quoteContainer.scrollTop = 0;
    statsEl.classList.add("hidden");
    warningEl.classList.remove("visible");

    isBreathingPhase = true;
    runBreathingCycle();
  }

  function sanitizeText(text) {
    return text.replace(/ +/g, " ").trim();
  }

  function renderQuoteSegment(text) {
    var newSpans = [];

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];

      if (ch === "\n") {
        currentWordDiv = null;
        quoteContainer.appendChild(document.createElement("br"));
        continue;
      }

      if (!currentWordDiv) {
        currentWordDiv = document.createElement("div");
        currentWordDiv.className = "word";
        quoteContainer.appendChild(currentWordDiv);
      }

      var charSpan = document.createElement("span");
      charSpan.className = "char";
      charSpan.textContent = ch === " " ? " " : ch;
      currentWordDiv.appendChild(charSpan);
      charMap.push(ch);
      newSpans.push(charSpan);

      if (ch === " ") {
        currentWordDiv = null;
      }
    }

    return newSpans;
  }

  function scrollToActiveCaret() {
    var caretEl = quoteContainer.querySelector(".char.caret");
    if (!caretEl) return;

    var containerHeight = quoteContainer.clientHeight;
    var caretTop = caretEl.offsetTop;
    var caretBottom = caretTop + caretEl.offsetHeight;
    var visibleTop = quoteContainer.scrollTop;
    var visibleBottom = visibleTop + containerHeight;

    if (caretTop >= visibleTop && caretBottom <= visibleBottom) return;

    var caretCenter = caretTop + caretEl.offsetHeight / 2;
    var maxScrollTop = Math.max(
      0,
      quoteContainer.scrollHeight - containerHeight,
    );
    var targetScrollTop = caretCenter - containerHeight / 2;
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

    quoteContainer.scrollTop = targetScrollTop;
  }

  function expandQuote() {
    var addition =
      BACKUP_SENTENCES[Math.floor(Math.random() * BACKUP_SENTENCES.length)];
    var suffix = " " + sanitizeText(addition);
    quote += suffix;

    var newSpans = renderQuoteSegment(suffix);
    spans = spans.concat(newSpans);
  }

  function triggerPenalty() {
    isPenalized = true;
    rushStreak = 0;
    quoteContainer.classList.add("rushing");
    warningEl.classList.add("visible");
    expandQuote();
    updateProgress();
    scrollToActiveCaret();
    penaltyTimeoutId = setTimeout(recoverFromPenalty, PENALTY_DURATION_MS);
  }

  function recoverFromPenalty() {
    warningEl.classList.remove("visible");
    quoteContainer.classList.remove("rushing");
    rushStreak = 0;
    lastKeyTime = null;
    penaltyTimeoutId = null;
    isPenalized = false;
  }

  function loadQuote() {
    if (penaltyTimeoutId) {
      clearTimeout(penaltyTimeoutId);
      penaltyTimeoutId = null;
    }
    isPenalized = false;
    rushStreak = 0;
    lastKeyTime = null;
    quoteContainer.classList.remove("rushing");
    warningEl.classList.remove("visible");
    quoteContainer.scrollTop = 0;
    currentWordDiv = null;

    var next = lastQuoteIdx;
    while (next === lastQuoteIdx) {
      next = Math.floor(Math.random() * QUOTES.length);
    }
    lastQuoteIdx = next;
    quote = sanitizeText(QUOTES[next]);
    currentIndex = 0;
    charMap = [];

    while (quoteContainer.firstChild) {
      quoteContainer.removeChild(quoteContainer.firstChild);
    }
    renderQuoteSegment(quote);

    spans = Array.prototype.slice.call(
      quoteContainer.querySelectorAll(".char"),
    );
    if (spans.length) spans[0].classList.add("caret");

    updateProgress();

    quoteContainer.classList.remove("loading");
    void quoteContainer.offsetWidth;
    quoteContainer.classList.add("loading");
  }

  function unlock() {
    if (penaltyTimeoutId) {
      clearTimeout(penaltyTimeoutId);
      penaltyTimeoutId = null;
    }
    window.removeEventListener("keydown", onKeyDown);
    quoteContainer.scrollTop = 0;
    overlay.classList.add("fade-out");
    setTimeout(function () {
      overlay.remove();
    }, 500);
  }

  function isComplete() {
    return currentIndex >= spans.length;
  }

  // onkeydown (using comments cuz its getting messy)

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey) return;

    if (e.key === "Escape") {
      startBreathingPhase();
      return;
    }

    if (isBreathingPhase) return;
    if (isPenalized) return;

    if (e.key === "Backspace") {
      if (currentIndex === 0) return;
      if (currentIndex < spans.length) {
        spans[currentIndex].classList.remove("caret");
      }
      currentIndex--;
      spans[currentIndex].classList.remove("correct", "incorrect");
      spans[currentIndex].classList.add("caret");
      updateProgress();
      scrollToActiveCaret();
      return;
    }

    if (e.key.length !== 1) return;
    if (currentIndex >= spans.length) return;
    spans[currentIndex].classList.remove("caret");

    var now = Date.now();
    if (lastKeyTime !== null && now - lastKeyTime < ZEN_THRESHOLD_MS) {
      rushStreak++;
    } else {
      rushStreak = 0;
    }
    lastKeyTime = now;

    if (e.key === charMap[currentIndex]) {
      spans[currentIndex].classList.add("correct");
    } else {
      spans[currentIndex].classList.add("incorrect");
    }

    currentIndex++;
    if (currentIndex < spans.length) {
      spans[currentIndex].classList.add("caret");
    }

    updateProgress();
    scrollToActiveCaret();

    if (rushStreak >= RUSH_STREAK_LIMIT) {
      triggerPenalty();
      return;
    }

    if (isComplete()) {
      unlock();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  startBreathingPhase();
})();
