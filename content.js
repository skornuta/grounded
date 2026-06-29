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
  ];

  var overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  var quoteContainer = document.createElement("div");
  quoteContainer.id = "grounding-quote";

  overlay.appendChild(quoteContainer);
  document.documentElement.appendChild(overlay);

  var spans = [];
  var currentIndex = 0;
  var lastQuoteIdx = -1;
  var quote = "";

  function loadQuote() {
    var next = lastQuoteIdx;
    while (next === lastQuoteIdx) {
      next = Math.floor(Math.random() * QUOTES.length);
    }
    lastQuoteIdx = next;
    quote = QUOTES[next];
    currentIndex = 0;

    while (quoteContainer.firstChild) {
      quoteContainer.removeChild(quoteContainer.firstChild);
    }

    var i, letter, span;
    for (i = 0; i < quote.length; i++) {
      letter = quote[i];
      span = document.createElement("span");
      span.className = "char";
      span.textContent = letter === " " ? "\u00A0" : letter;
      quoteContainer.appendChild(span);
    }

    spans = quoteContainer.getElementsByClassName("char");
    spans[0].classList.add("caret");

    quoteContainer.classList.remove("loading");
    void quoteContainer.offsetWidth;
    quoteContainer.classList.add("loading");
  }

  function unlock() {
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

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") {
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
      return;
    }

    if (e.key.length !== 1) return;
    if (currentIndex >= spans.length) return;

    spans[currentIndex].classList.remove("caret");
    if (e.key === quote[currentIndex]) {
      spans[currentIndex].classList.add("correct");
    } else {
      spans[currentIndex].classList.add("incorrect");
    }

    currentIndex++;
    if (currentIndex < spans.length) {
      spans[currentIndex].classList.add("caret");
    }

    if (isComplete()) {
      unlock();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  loadQuote();
})();
