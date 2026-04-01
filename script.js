function showInfo(text) {
  const box = document.getElementById("infoBox");
  const content = document.getElementById("infoText");

  content.innerText = text;
  box.style.display = "block";
}

// Debug: Check if model loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("AR Loaded");

  const model = document.querySelector('[gltf-model]');

  if (model) {
    model.addEventListener("model-loaded", () => {
      console.log("✅ GLB loaded successfully");
    });

    model.addEventListener("model-error", (e) => {
      console.error("❌ GLB failed to load", e);
    });
  }
});