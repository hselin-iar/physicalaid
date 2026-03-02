/* ========================================
   PhysicalAid — Settings Page
   ======================================== */

import { getSettings, saveSettings, getUserProfile, saveUserProfile, isProfileComplete } from '../storage.js';
import { requestReminderPermission, getBrowserNotificationStatus } from '../reminders.js';

export async function renderSettings(container) {
  const [settings, profile] = await Promise.all([
    getSettings(),
    getUserProfile()
  ]);
  const notificationStatus = getBrowserNotificationStatus();

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Settings</span> ⚙️</h1>
      <p class="page-description">Customize the app for your body, schedule, and goals.</p>
    </div>

    <div class="settings-group animate-in">
      <div class="settings-group-title">Profile</div>
      <div class="glass-card no-hover">
        <div class="flex items-center justify-between mb-4">
          <div style="font-size: var(--fs-sm); font-weight: 700;">Personalization Data</div>
          <span class="badge ${isProfileComplete(profile) ? 'badge-success' : 'badge-warning'}">
            ${isProfileComplete(profile) ? 'Complete' : 'Incomplete'}
          </span>
        </div>
        <div class="profile-settings-grid" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
          <input class="log-input" id="profile-age" type="number" min="10" max="90" placeholder="Age" value="${profile.age || ''}" style="width: 100%;" />
          <select class="setting-select" id="profile-gender" style="width: 100%;">
            <option value="">Gender</option>
            <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Male</option>
            <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Female</option>
            <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>Other</option>
          </select>
          <input class="log-input" id="profile-height" type="number" min="120" max="230" placeholder="Height (cm)" value="${profile.heightCm || ''}" style="width: 100%;" />
          <input class="log-input" id="profile-weight" type="number" min="35" max="250" placeholder="Weight (kg)" value="${profile.weightKg || ''}" style="width: 100%;" />
          <select class="setting-select" id="profile-experience" style="width: 100%;">
            <option value="beginner" ${profile.experienceLevel === 'beginner' ? 'selected' : ''}>Beginner</option>
            <option value="intermediate" ${profile.experienceLevel === 'intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="advanced" ${profile.experienceLevel === 'advanced' ? 'selected' : ''}>Advanced</option>
          </select>
          <select class="setting-select" id="profile-goal" style="width: 100%;">
            <option value="posture" ${profile.goalFocus === 'posture' ? 'selected' : ''}>Posture & Alignment</option>
            <option value="mobility" ${profile.goalFocus === 'mobility' ? 'selected' : ''}>Mobility</option>
            <option value="strength" ${profile.goalFocus === 'strength' ? 'selected' : ''}>Strength</option>
          </select>
        </div>
        <div class="mt-4">
          <button id="btn-save-profile-settings" class="btn-start-glass w-full">Save Profile</button>
        </div>
      </div>
    </div>

    <div class="settings-group animate-in">
      <div class="settings-group-title">Timer</div>
      
      <div class="setting-row">
        <div>
          <div class="setting-label">Rest Duration</div>
          <div class="setting-desc">Time between sets</div>
        </div>
        <select class="setting-select setting-control" data-key="restDuration" data-type="number">
          <option value="10" ${settings.restDuration === 10 ? 'selected' : ''}>10s</option>
          <option value="15" ${settings.restDuration === 15 ? 'selected' : ''}>15s</option>
          <option value="20" ${settings.restDuration === 20 ? 'selected' : ''}>20s</option>
          <option value="30" ${settings.restDuration === 30 ? 'selected' : ''}>30s</option>
          <option value="45" ${settings.restDuration === 45 ? 'selected' : ''}>45s</option>
        </select>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Plank Duration</div>
          <div class="setting-desc">How long to hold planks</div>
        </div>
        <select class="setting-select setting-control" data-key="plankDuration" data-type="number">
          <option value="30" ${settings.plankDuration === 30 ? 'selected' : ''}>30s</option>
          <option value="45" ${settings.plankDuration === 45 ? 'selected' : ''}>45s</option>
          <option value="60" ${settings.plankDuration === 60 ? 'selected' : ''}>60s</option>
        </select>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Walking Timer</div>
          <div class="setting-desc">Duration for walking protocol</div>
        </div>
        <select class="setting-select setting-control" data-key="walkingDuration" data-type="number">
          <option value="5" ${settings.walkingDuration === 5 ? 'selected' : ''}>5 min</option>
          <option value="7" ${settings.walkingDuration === 7 ? 'selected' : ''}>7 min</option>
          <option value="10" ${settings.walkingDuration === 10 ? 'selected' : ''}>10 min</option>
          <option value="15" ${settings.walkingDuration === 15 ? 'selected' : ''}>15 min</option>
        </select>
      </div>
    </div>

    <div class="settings-group animate-in">
      <div class="settings-group-title">Preferences</div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Units</div>
          <div class="setting-desc">Display mode for body and weight values</div>
        </div>
        <select class="setting-select setting-control" data-key="units" data-type="string">
          <option value="metric" ${settings.units === 'metric' ? 'selected' : ''}>Metric (kg, cm)</option>
          <option value="imperial" ${settings.units === 'imperial' ? 'selected' : ''}>Imperial (lb, ft)</option>
        </select>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Intensity</div>
          <div class="setting-desc">Used to personalize default recommendations</div>
        </div>
        <select class="setting-select setting-control" data-key="intensity" data-type="string">
          <option value="light" ${settings.intensity === 'light' ? 'selected' : ''}>Light</option>
          <option value="moderate" ${settings.intensity === 'moderate' ? 'selected' : ''}>Moderate</option>
          <option value="hard" ${settings.intensity === 'hard' ? 'selected' : ''}>Hard</option>
        </select>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Audio Cues</div>
          <div class="setting-desc">Chimes, countdowns, and completion sounds</div>
        </div>
        <label class="toggle">
          <input type="checkbox" class="setting-control" data-key="soundEnabled" data-type="boolean" ${settings.soundEnabled ? 'checked' : ''}>
          <div class="toggle-slider"></div>
        </label>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Voice Guidance</div>
          <div class="setting-desc">Enable spoken coaching cues (when available)</div>
        </div>
        <label class="toggle">
          <input type="checkbox" class="setting-control" data-key="voiceGuidance" data-type="boolean" ${settings.voiceGuidance ? 'checked' : ''}>
          <div class="toggle-slider"></div>
        </label>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Smart Reminders</div>
          <div class="setting-desc">Get nudges for unfinished tasks and missed-day recovery</div>
        </div>
        <label class="toggle">
          <input type="checkbox" class="setting-control" data-key="reminderEnabled" data-type="boolean" ${settings.reminderEnabled ? 'checked' : ''}>
          <div class="toggle-slider"></div>
        </label>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Reminder Time</div>
          <div class="setting-desc">Daily reminder hour (local time)</div>
        </div>
        <select class="setting-select setting-control" data-key="reminderHour" data-type="number">
          ${Array.from({ length: 17 }, (_, i) => 6 + i).map((hour) => `
            <option value="${hour}" ${Number(settings.reminderHour) === hour ? 'selected' : ''}>${String(hour).padStart(2, '0')}:00</option>
          `).join('')}
        </select>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Browser Notifications</div>
          <div class="setting-desc">Current status: ${notificationStatus}</div>
        </div>
        <button id="btn-enable-browser-notifications" class="btn btn-secondary" style="padding: 0.45rem 0.8rem;">Enable</button>
      </div>
    </div>

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
          Built for consistency and long-term structural change. Train smart, track daily, and adjust using real data.
        </p>
        <div class="mt-4">
          <button class="btn btn-secondary" id="btn-clear-data" style="font-size: var(--fs-xs)">🗑️ Clear All Data</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-save-profile-settings')?.addEventListener('click', async () => {
    const age = Number(container.querySelector('#profile-age')?.value || 0);
    const gender = String(container.querySelector('#profile-gender')?.value || '').trim();
    const heightCm = Number(container.querySelector('#profile-height')?.value || 0);
    const weightKg = Number(container.querySelector('#profile-weight')?.value || 0);
    const experienceLevel = String(container.querySelector('#profile-experience')?.value || 'beginner');
    const goalFocus = String(container.querySelector('#profile-goal')?.value || 'posture');

    if (!age || !gender || !heightCm || !weightKg) {
      alert('Please fill age, gender, height, and weight.');
      return;
    }

    await saveUserProfile({
      ...profile,
      age,
      gender,
      heightCm,
      weightKg,
      experienceLevel,
      goalFocus,
      onboardingCompleted: true
    });
    const statusBadge = container.querySelector('.settings-group .badge');
    if (statusBadge) {
      statusBadge.classList.remove('badge-warning');
      statusBadge.classList.add('badge-success');
      statusBadge.textContent = 'Complete';
    }
    showSaved(container.querySelector('#btn-save-profile-settings'));
  });

  container.querySelectorAll('.setting-control').forEach(control => {
    control.addEventListener('change', async () => {
      const key = control.dataset.key;
      const type = control.dataset.type;

      const current = await getSettings();
      if (type === 'number') current[key] = Number(control.value);
      else if (type === 'boolean') current[key] = Boolean(control.checked);
      else current[key] = String(control.value);

      await saveSettings(current);
      showSaved(control);
    });
  });

  container.querySelector('#btn-enable-browser-notifications')?.addEventListener('click', async () => {
    const result = await requestReminderPermission();
    const row = container.querySelector('#btn-enable-browser-notifications')?.closest('.setting-row');
    const desc = row?.querySelector('.setting-desc');
    if (desc) desc.textContent = `Current status: ${result}`;
    showSaved(container.querySelector('#btn-enable-browser-notifications'));
  });

  container.querySelector('#btn-clear-data')?.addEventListener('click', async () => {
    if (confirm('Clear all PhysicalAid data? This will reset your streaks, logs, profile, and settings.')) {
      const { signOutUser } = await import('../firebase.js');
      await signOutUser();
      localStorage.clear();
      window.location.reload();
    }
  });
}

function showSaved(element) {
  const row = element?.closest('.setting-row') || element?.closest('.glass-card') || element?.parentElement;
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
