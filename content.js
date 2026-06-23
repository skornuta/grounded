(function () {
  if (document.getElementById("grounding-overlay")) return;

  const QUOTES = [
    "Look up at the sky. It's beautiful out there.",
    "Step outside. The fresh air is waiting for you.",
    "The trees don't care about your notifications.",
    "Close your eyes. Take a slow breath. Now another.",
    "Sunlight on your face costs nothing and fixes everything.",
    "The world outside is still there. Go check on it.",
    "Your best ideas come when you're away from the screen.",
    "Even five minutes ouside will change how you feel.",
    "Nature has no loading screens. Go explore it.",
    "Put it down. The internet will still be here later.",
  ];

  var idx = Math.floor(Math.random() * QUOTES.length);
  var quote = QUOTES[idx];

  const overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  const quoteContainer = document.createElement("div");
  quoteContainer.id = "grounding-quote";

  var i, letter, span;
  for (i = 0; i < quote.length; i++) {
    letter = quote[i];
    span = document.createElement("span");
    span.className = "char";
    span.textContent = letter === " " ? "\u00a0" : letter;
    quoteContainer.appendChild(span);
  }

  overlay.appendChild(quoteContainer);
  document.documentElement.appendChild(overlay);
})();
