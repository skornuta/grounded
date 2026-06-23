(function () {
  if (document.getElementById("grounding-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "grounding-overlay";

  const label = document.createElement("p");
  label.id = "grounding-label";
  label.textContent = "grounding";

  const sub = document.createElement("p");
  sub.id = "grounding-sub";
  sub.textContent =
    "A poem typing challenge coming soon. Be ready for your social media addiction to go away.";

  overlay.appendChild(label);
  overlay.appendChild(sub);

  document.documentElement.appendChild(overlay);
})();
