/* ========================================
   PhysicalAid — Settings Page
   ======================================== */

import { getSettings, saveSettings } from '../storage.js';

export async function renderSettings(container) {
  const settings = await getSettings();

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Settings</span> ⚙️</h1>
      <p class="page-description">Customize your exercise experience.</p>
    </div>

    <!-- Timer Settings -->
    <div class="settings-group animate-in">
      <div class="settings-group-title">Timer</div>
      
      <div class="setting-row">
        <div>
          <div class="setting-label">Rest Duration</div>
          <div class="setting-desc">Time between sets</div>
        </div>
        <select class="setting-select" id="setting-rest" data-key="restDuration">
          <option value="10" ${settings.restDuration === 10 ? 'selected' : ''}>10s</option>
          <option value="15" ${settings.restDuration === 15 ? 'selected' : ''}>15s</option>
          <option value="20" ${settings.restDuration === 20 ? 'selected' : ''}>20s</option>
          <option value="30" ${settings.restDuration === 30 ? 'selected' : ''}>30s</option>
        </select>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Plank Duration</div>
          <div class="setting-desc">How long to hold planks</div>
        </div>
        <select class="setting-select" id="setting-plank" data-key="plankDuration">
          <option value="30" ${settings.plankDuration === 30 ? 'selected' : ''}>30s</option>
          <option value="45" ${settings.plankDuration === 45 ? 'selected' : ''}>45s</option>
        </select>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Walking Timer</div>
          <div class="setting-desc">Duration for walking protocol</div>
        </div>
        <select class="setting-select" id="setting-walking" data-key="walkingDuration">
          <option value="5" ${settings.walkingDuration === 5 ? 'selected' : ''}>5 min</option>
          <option value="7" ${settings.walkingDuration === 7 ? 'selected' : ''}>7 min</option>
          <option value="10" ${settings.walkingDuration === 10 ? 'selected' : ''}>10 min</option>
        </select>
      </div>
    </div>

    <!-- Sound Settings -->
    <div class="settings-group animate-in">
      <div class="settings-group-title">Sound</div>
      
      <div class="setting-row">
        <div>
          <div class="setting-label">Audio Cues</div>
          <div class="setting-desc">Chimes, countdowns, and completion sounds</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="setting-sound" ${settings.soundEnabled ? 'checked' : ''}>
          <div class="toggle-slider"></div>
        </label>
      </div>
    </div>

    <!-- About -->
    <div class="settings-group animate-in">
      <div class="settings-group-title">About</div>
      
      <div class="glass-card no-hover">
        <div class="flex items-center gap-4 mb-4">
          <span style="font-size: var(--fs-2xl)">⚡</span>
          <div>
            <div style="font-size: var(--fs-md); font-weight: var(--fw-bold)">PhysicalAid</div>
            <div class="text-muted" style="font-size: var(--fs-xs)">Daily Posture & Exercise Reset</div>
          </div>
        </div>
        <p class="text-muted" style="font-size: var(--fs-sm); line-height: 1.6;">
          Built for discipline, not entertainment. 15–20 minutes daily reset, 3x/week lifting, 
          5 minutes conscious walking. That's it. You need 90 days of discipline.
        </p>
        <div class="mt-4">
          <button class="btn btn-secondary" id="btn-clear-data" style="font-size: var(--fs-xs)">🗑️ Clear All Data</button>
        </div>
      </div>
    </div>
  `;

  // Auto-save on change
  container.querySelectorAll('.setting-select').forEach(select => {
    select.addEventListener('change', async () => {
      const key = select.dataset.key;
      const val = parseInt(select.value);
      const s = await getSettings();
      s[key] = val;
      await saveSettings(s);
      showSaved(select);
    });
  });

  container.querySelector('#setting-sound')?.addEventListener('change', async (e) => {
    const s = await getSettings();
    s.soundEnabled = e.target.checked;
    await saveSettings(s);
  });

  container.querySelector('#btn-clear-data')?.addEventListener('click', async () => {
    if (confirm('Clear all PhysicalAid data? This will reset your streaks, logs, and settings.')) {
      const { signOutUser } = await import('../firebase.js');
      await signOutUser();
      localStorage.clear();
      window.location.reload();
    }
  });
}

function showSaved(element) {
  const row = element.closest('.setting-row');
  if (!row) return;
  const existing = row.querySelector('.save-indicator');
  if (existing) existing.remove();

  const indicator = document.createElement('span');
  indicator.className = 'save-indicator badge badge-success';
  indicator.textContent = '✓ Saved';
  indicator.style.marginLeft = 'var(--sp-2)';
  row.appendChild(indicator);

  setTimeout(() => indicator.remove(), 1500);
}
