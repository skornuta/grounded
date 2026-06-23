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

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  const quoteContainer = document.createElement("div");
  quoteContainer.id = "grounding-quote";

  for (var i = 0; i < quote.length; i++) [
    var char = quote[i];
    var span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00a0' : char;
    quoteContainer.appendChild(span);
  }

  overlay.appendChild(quoteContainer);
  document.documentElement.appendChild(overlay);
})();
