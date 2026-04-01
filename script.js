function showInfo(text) {
  const box = document.getElementById("infoBox");
  const content = document.getElementById("infoText");

  content.innerText = text;
  box.style.display = "block";
}