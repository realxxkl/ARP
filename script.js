// ─── State ───────────────────────────────────────────────────────────────────
let pyramidPlaced = false;
let reticleVisible = false;
let sceneEl, reticleEl, pyramidRootEl, pyramidEntityEl;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  sceneEl       = document.getElementById('ar-scene');
  reticleEl     = document.getElementById('reticle');
  pyramidRootEl = document.getElementById('pyramid-root');
  pyramidEntityEl = document.getElementById('pyramidEntity');

  // Wait for A-Frame + WebXR to be ready
  sceneEl.addEventListener('enter-vr', onARStart);
  sceneEl.addEventListener('exit-vr',  onAREnd);

  // Hit-test surface detection → show reticle + enable Place button
  sceneEl.addEventListener('ar-hit-test-achieved', onHitTestAchieved);

  // Model load events
  pyramidEntityEl.addEventListener('model-loaded', () => {
    console.log('✅ GLB loaded successfully');
  });
  pyramidEntityEl.addEventListener('model-error', (e) => {
    console.error('❌ GLB failed to load', e);
    setHint('Failed to load 3D model. Check your file path.');
  });

  // Tap to place
  document.addEventListener('click', onScreenTap);
  document.addEventListener('touchend', onScreenTap);
});

// ─── AR Session Events ────────────────────────────────────────────────────────
function onARStart() {
  setBadge('scanning');
  setHint('Move your camera slowly to detect a flat surface');
}

function onAREnd() {
  setBadge('offline');
  setHint('AR session ended. Re-open in a WebXR-compatible browser.');
}

// ─── Hit-Test → Surface Found ─────────────────────────────────────────────────
function onHitTestAchieved(evt) {
  if (pyramidPlaced) return; // once placed, ignore further reticle updates

  reticleEl.setAttribute('visible', true);
  reticleVisible = true;

  // Position reticle at detected surface
  const position = evt.detail.position;
  const rotation = evt.detail.rotation;
  if (position) reticleEl.setAttribute('position', position);
  if (rotation) reticleEl.setAttribute('rotation', rotation);

  // Enable the Place button
  const btnPlace = document.getElementById('btn-place');
  btnPlace.disabled = false;

  setBadge('ready');
  setHint('Surface detected! Tap anywhere or press Place Pyramid');
}

// ─── Tap / Click → Place ──────────────────────────────────────────────────────
function onScreenTap(evt) {
  // Ignore taps on UI elements
  if (evt.target.closest('#ui-overlay')) return;
  if (!reticleVisible || pyramidPlaced) return;

  placePyramid();
}

// ─── Place Pyramid ────────────────────────────────────────────────────────────
function placePyramid() {
  if (pyramidPlaced) return;

  const reticlePos = reticleEl.getAttribute('position');
  if (!reticlePos) return;

  // Move pyramid root to reticle position
  pyramidRootEl.setAttribute('position', reticlePos);
  pyramidRootEl.setAttribute('visible', true);

  // Trigger appear animation
  pyramidEntityEl.emit('appear');

  // Hide reticle
  reticleEl.setAttribute('visible', false);
  reticleVisible = false;
  pyramidPlaced = true;

  // Update UI
  setBadge('placed');
  setHint('Tap the coloured dots to explore the pyramid');
  document.getElementById('btn-place').disabled = true;
  document.getElementById('btn-reset').disabled = false;
}

// ─── Reset ────────────────────────────────────────────────────────────────────
function resetPyramid() {
  pyramidRootEl.setAttribute('visible', false);
  pyramidPlaced = false;

  // Reset scale for re-animation next time
  pyramidEntityEl.setAttribute('scale', '0 0 0');

  setBadge('scanning');
  setHint('Move your camera slowly to detect a flat surface');
  document.getElementById('btn-place').disabled = true;
  document.getElementById('btn-reset').disabled = true;
  closeInfo();
}

// ─── Info Card ────────────────────────────────────────────────────────────────
function showInfo(entityEl) {
  const title = entityEl.getAttribute('data-title');
  const body  = entityEl.getAttribute('data-body');

  document.getElementById('info-title').textContent = title;
  document.getElementById('info-body').textContent  = body;

  const card = document.getElementById('info-card');
  card.classList.remove('hidden');
  card.classList.add('visible');
}

function closeInfo() {
  const card = document.getElementById('info-card');
  card.classList.remove('visible');
  card.classList.add('hidden');
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function setHint(text) {
  document.getElementById('hint-text').textContent = text;
}

function setBadge(state) {
  const badge = document.getElementById('status-badge');
  badge.className = 'badge'; // reset
  switch (state) {
    case 'scanning':
      badge.classList.add('scanning');
      badge.textContent = 'Scanning…';
      break;
    case 'ready':
      badge.classList.add('ready');
      badge.textContent = 'Surface Found';
      break;
    case 'placed':
      badge.classList.add('placed');
      badge.textContent = 'Placed ✓';
      break;
    case 'offline':
      badge.classList.add('offline');
      badge.textContent = 'Offline';
      break;
  }
}
