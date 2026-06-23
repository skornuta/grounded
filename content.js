(function () {
  if (document.getElementById("grounding-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  const quoteContainer = document.createElement("div");
  quoteContainer.id = "grounding-quote";
  quoteContainer.textContent = "Look up at the sky. It's beautiful out there.";

  overlay.appendChild(quoteContainer);

  document.documentElement.appendChild(overlay);
})();
