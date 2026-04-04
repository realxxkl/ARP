// ─── Freeze Fix ───────────────────────────────────────────────────────────────
// MindAR hides the target entity when the image is lost.
// We override that behaviour to keep the model frozen at its last position.

document.addEventListener('DOMContentLoaded', () => {

  const sceneEl   = document.getElementById('ar-scene');
  const targetEl  = document.getElementById('target-entity');
  const modelEl   = document.getElementById('pyramidEntity');
  const badge     = document.getElementById('status-badge');
  const hintText  = document.getElementById('hint-text');

  let targetFound = false;

  // ── Wait for MindAR to be ready ──────────────────────────────────────────────
  sceneEl.addEventListener('arReady', () => {
    setBadge('scanning');
    setHint('Point your camera at the target image');
    // Auto-open editor so model can be tuned immediately
    document.getElementById('editorPanel').style.display = 'flex';
    console.log('✅ MindAR ready');
  });

  sceneEl.addEventListener('arError', (e) => {
    setBadge('error');
    setHint('Camera error. Please allow camera access and reload.');
    console.error('❌ MindAR error', e);
  });

  // ── Target found ─────────────────────────────────────────────────────────────
  targetEl.addEventListener('targetFound', () => {
    targetFound = true;
    targetEl.setAttribute('visible', true);
    setBadge('found');
    setHint('Tap the coloured dots to explore the pyramid');
    console.log('🎯 Target found');
  });

  // ── Target lost — FREEZE: keep entity visible, don't hide it ─────────────────
  targetEl.addEventListener('targetLost', () => {
    // Do NOT hide the entity — leave it frozen at last known position
    // MindAR internally tries to set visible=false; we override it immediately
    setTimeout(() => {
      if (targetFound) {
        targetEl.setAttribute('visible', true);
      }
    }, 0);

    setBadge('frozen');
    setHint('Target lost — model frozen in place. Re-point to re-lock.');
    console.log('❄️ Target lost — model frozen');
  });

  // ── Model load events ─────────────────────────────────────────────────────────
  modelEl.addEventListener('model-loaded', () => {
    console.log('✅ GLB loaded successfully');
  });

  modelEl.addEventListener('model-error', (e) => {
    console.error('❌ GLB failed to load', e);
    setHint('3D model failed to load. Check your network and file path.');
  });

  // ── Add cursor / raycaster to camera for hotspot clicks on mobile ─────────────
  const cameraEl = document.querySelector('a-camera');
  cameraEl.setAttribute('raycaster', 'objects: .hotspot; far: 10;');
  cameraEl.setAttribute('cursor', 'fuse: false; rayOrigin: mouse;');

});

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

// ─── Editor Panel ─────────────────────────────────────────────────────────────
function togglePanel() {
  const p = document.getElementById('editorPanel');
  p.style.display = (p.style.display === 'none' || p.style.display === '')
    ? 'flex' : 'none';
}

function updateModel() {
  const scale = (document.getElementById('scaleSlider').value / 1000).toFixed(3);
  const px    = (document.getElementById('pxSlider').value / 10).toFixed(1);
  const py    = (document.getElementById('pySlider').value / 10).toFixed(1);
  const pz    = (document.getElementById('pzSlider').value / 10).toFixed(1);
  const rx    = document.getElementById('rxSlider').value;
  const ry    = document.getElementById('rySlider').value;

  document.getElementById('scaleVal').textContent = scale;
  document.getElementById('pxVal').textContent    = px;
  document.getElementById('pyVal').textContent    = py;
  document.getElementById('pzVal').textContent    = pz;
  document.getElementById('rxVal').textContent    = rx;
  document.getElementById('ryVal').textContent    = ry;

  const el = document.getElementById('pyramidEntity');
  if (el) {
    el.setAttribute('scale',    `${scale} ${scale} ${scale}`);
    el.setAttribute('position', `${px} ${py} ${pz}`);
    el.setAttribute('rotation', `${rx} ${ry} 0`);
  }

  document.getElementById('codeOutput').textContent =
    `scale="${scale} ${scale} ${scale}"\nposition="${px} ${py} ${pz}"\nrotation="${rx} ${ry} 0"`;
}

function copyCode() {
  navigator.clipboard.writeText(document.getElementById('codeOutput').textContent)
    .then(() => alert('✅ Copied to clipboard!'))
    .catch(() => alert('Copy failed — select the text manually.'));
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function setHint(text) {
  document.getElementById('hint-text').textContent = text;
}

function setBadge(state) {
  const badge = document.getElementById('status-badge');
  badge.className = 'badge';
  const states = {
    scanning: ['scanning', 'Scanning…'],
    found:    ['found',    'Target Locked ✓'],
    frozen:   ['frozen',   'Frozen ❄'],
    error:    ['error',    'Camera Error'],
  };
  const [cls, label] = states[state] || ['scanning', 'Scanning…'];
  badge.classList.add(cls);
  badge.textContent = label;
}
