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

  var overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  var quoteContainer = document.createElement("div");
  quoteContainer.id = "grounding-quote";

  var statsEl = document.createElement("div");
  statsEl.id = "grounding-stats";
  var statWpm = document.createElement("span");
  var statProgress = document.createElement("span");
  var statAccuracy = document.createElement("span");
  statsEl.appendChild(statWpm);
  statsEl.appendChild(statProgress);
  statsEl.appendChild(statAccuracy);

  overlay.appendChild(quoteContainer);
  overlay.appendChild(statsEl);
  document.documentElement.appendChild(overlay);

  var spans = [];
  var charMap = [];
  var currentIndex = 0;
  var lastQuoteIdx = -1;
  var quote = "";
  var totalInputs = 0;
  var correctInputs = 0;
  var startTime = null;

  function updateStats() {
    var minutes = startTime ? (Date.now() - startTime) / 60000 : 0;
    var wpm = minutes > 0 ? Math.round(correctInputs / 5 / minutes) : 0;
    var pct =
      totalInputs === 0 ? 100 : Math.round((correctInputs / totalInputs) * 100);
    statWpm.textContent = "wpm: " + wpm;
    statProgress.textContent = currentIndex + " / " + spans.length;
    statAccuracy.textContent = pct + "%";
  }

  function loadQuote() {
    var next = lastQuoteIdx;
    while (next === lastQuoteIdx) {
      next = Math.floor(Math.random() * QUOTES.length);
    }
    lastQuoteIdx = next;
    quote = QUOTES[next];
    currentIndex = 0;
    charMap = [];
    totalInputs = 0;
    correctInputs = 0;
    startTime = null;

    while (quoteContainer.firstChild) {
      quoteContainer.removeChild(quoteContainer.firstChild);
    }
    for (var i = 0; i < quote.length; i++) {
      var letter = quote[i];

      if (letter === "\n") {
        quoteContainer.appendChild(document.createElement("br"));
        continue;
      }

      var span = document.createElement("span");
      span.className = "char";
      span.textContent = letter === " " ? "\u00A0" : letter;
      quoteContainer.appendChild(span);
      charMap.push(letter);
    }

    spans = Array.prototype.slice.call(
      quoteContainer.querySelectorAll(".char"),
    );
    if (spans.length) spans[0].classList.add("caret");

    updateStats();

    quoteContainer.classList.remove("loading");
    void quoteContainer.offsetWidth;
    quoteContainer.classList.add("loading");
  }

  function unlock() {
    startTime = null;
    window.removeEventListener("keydown", onKeyDown);
    overlay.classList.add("fade-out");
    setTimeout(function () {
      overlay.remove();
    }, 500);
  }

  function isComplete() {
    if (currentIndex < spans.length) return false;
    for (var i = 0; i < spans.length; i++) {
      if (spans[i].classList.contains("incorrect")) return false;
    }
    return true;
  }

  // onkeydown (using comments cuz its getting messy)

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") {
      totalInputs = 0;
      correctInputs = 0;
      startTime = null;
      loadQuote();
      return;
    }

    if (e.key === "Backspace") {
      if (currentIndex === 0) return;
      if (currentIndex < spans.length) {
        spans[currentIndex].classList.remove("caret");
      }
      currentIndex--;
      spans[currentIndex].classList.remove("correct", "incorrect");
      spans[currentIndex].classList.add("caret");
      updateStats();
      return;
    }

    if (e.key.length !== 1) return;
    if (currentIndex >= spans.length) return;
    spans[currentIndex].classList.remove("caret");

    totalInputs++;
    if (e.key === charMap[currentIndex]) {
      if (startTime === null) startTime = Date.now();
      spans[currentIndex].classList.add("correct");
      correctInputs++;
    } else {
      spans[currentIndex].classList.add("incorrect");
    }

    currentIndex++;
    if (currentIndex < spans.length) {
      spans[currentIndex].classList.add("caret");
    }

    updateStats();

    if (isComplete()) {
      unlock();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  loadQuote();
})();
