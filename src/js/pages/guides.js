/* ========================================
   PhysicalAid — Guides Page
   ======================================== */

import { walkingProtocol, standingCheckpoint, sittingRules, sleepingPosition } from '../data.js';
import { markCompleted, isCompletedToday, logDailyActivity, getSettings } from '../storage.js';
import * as audio from '../audio.js';

export function renderGuides(container, subPage) {
  if (subPage === 'walking') {
    renderWalkingGuide(container);
  } else if (subPage === 'standing') {
    renderStandingGuide(container);
  } else {
    renderGuidesOverview(container);
  }
}

function renderGuidesOverview(container) {
  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Posture Guides</span> 📐</h1>
      <p class="page-description">Reference guides for sitting, sleeping, walking, and standing. Build awareness into every position.</p>
    </div>

    <div class="grid-2 mb-8">
      <!-- Walking Protocol -->
      <div class="glass-card launch-card walking animate-in" data-guide="walking" style="cursor:pointer">
        <div class="launch-card-header">
          <div class="launch-card-icon">🚶</div>
          <div>
            <div class="launch-card-title">Walking Protocol</div>
            <div class="launch-card-meta">5–10 min conscious practice</div>
          </div>
        </div>
        <div class="launch-card-status">
          ${isCompletedToday('walking') ? '<span class="badge badge-success">✓ Done</span>' : '<span class="badge">Open</span>'}
        </div>
      </div>

      <!-- Standing Checkpoint -->
      <div class="glass-card launch-card standing animate-in" data-guide="standing" style="cursor:pointer">
        <div class="launch-card-header">
          <div class="launch-card-icon">🪞</div>
          <div>
            <div class="launch-card-title">Standing Checkpoint</div>
            <div class="launch-card-meta">2 min mirror check</div>
          </div>
        </div>
        <div class="launch-card-status">
          ${isCompletedToday('standing') ? '<span class="badge badge-success">✓ Done</span>' : '<span class="badge">Open</span>'}
        </div>
      </div>
    </div>

    <!-- Sitting Rules -->
    <div class="glass-card no-hover mb-6 animate-in">
      <h2 class="section-title mb-4" style="font-size: var(--fs-lg)">🪑 Sitting Rules</h2>
      <p class="text-muted mb-4" style="font-size: var(--fs-sm); font-weight: var(--fw-semibold)">Non-negotiable:</p>
      <div class="checklist mb-4">
        ${sittingRules.rules.map(rule => `
          <div class="checklist-item">
            <div class="check-icon">✓</div>
            <span>${rule}</span>
          </div>
        `).join('')}
      </div>
      <div class="warning-panel">
        <div class="warning-panel-title">⚠️ Reset Rule</div>
        <p style="font-size: var(--fs-sm); color: var(--text-secondary)">${sittingRules.reset}</p>
      </div>
    </div>

    <!-- Sleeping Position -->
    <div class="glass-card no-hover mb-6 animate-in">
      <h2 class="section-title mb-4" style="font-size: var(--fs-lg)">🛏️ Sleeping Position</h2>
      <div class="grid-2 mb-4">
        <div>
          <p class="text-muted mb-2" style="font-size: var(--fs-sm); font-weight: var(--fw-semibold)">✅ Best:</p>
          <div class="checklist">
            ${sleepingPosition.best.map(pos => `
              <div class="checklist-item">
                <div class="check-icon" style="border-color: var(--color-success);">✓</div>
                <span>${pos}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <p class="text-muted mb-2" style="font-size: var(--fs-sm); font-weight: var(--fw-semibold)">❌ Avoid:</p>
          <div class="checklist">
            ${sleepingPosition.avoid.map(pos => `
              <div class="avoid-item">${pos}</div>
            `).join('')}
          </div>
        </div>
      </div>
      <p class="text-accent" style="font-size: var(--fs-sm)">${sleepingPosition.note}</p>
    </div>
  `;

  container.querySelectorAll('[data-guide]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = '#/guides/' + card.dataset.guide;
    });
  });
}

function renderWalkingGuide(container) {
  const done = isCompletedToday('walking');
  const settings = getSettings();
  const walkTime = settings.walkingDuration || 5;

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Walking Protocol</span> 🚶</h1>
      <p class="page-description">Conscious walking practice. Focus on form, not speed.</p>
    </div>

    <div class="guide-split animate-in">
      <!-- Left: Focus Cues -->
      <div class="glass-card no-hover">
        <h3 class="section-title mb-3" style="font-size: var(--fs-md)">Focus Cues</h3>
        <p class="text-muted mb-3" style="font-size: var(--fs-xs)">Check each cue as you walk.</p>
        <div class="checklist" id="walking-checklist">
          ${walkingProtocol.focusCues.map((cue, i) => `
            <div class="checklist-item">
              <div class="check-icon" id="walk-check-${i}" data-checked="false" onclick="this.dataset.checked = this.dataset.checked === 'true' ? 'false' : 'true'; this.classList.toggle('checked');">✓</div>
              <span>${cue}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right: Timer + Tip -->
      <div class="guide-right-stack">
        <div class="glass-card no-hover text-center" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <h3 class="section-title mb-3" style="font-size: var(--fs-md)">Walking Timer</h3>
          <div class="timer-display mb-4">
            <div class="timer-value" id="walk-timer">${walkTime}:00</div>
            <div class="timer-label">minutes</div>
          </div>
          <div id="walk-cue" class="text-accent mb-4" style="font-size: var(--fs-md); min-height: 1.5em; font-weight: var(--fw-semibold)"></div>
          <div class="flex items-center gap-4" style="justify-content: center">
            <button class="btn btn-primary btn-lg" id="btn-walk-start">▶ Start Walking</button>
            <button class="btn btn-secondary btn-lg hidden" id="btn-walk-stop">⏹ Stop</button>
          </div>
        </div>
        <div class="glass-card no-hover">
          <div class="warning-panel">
            <div class="warning-panel-title">📹 Film Yourself</div>
            <p style="font-size: var(--fs-sm); color: var(--text-secondary)">Film yourself walking now. Film again in 3–4 weeks. Visual feedback > guessing.</p>
          </div>
        </div>
        ${done ? '<div class="text-center"><span class="badge badge-success" style="font-size: var(--fs-sm); padding: var(--sp-2) var(--sp-5)">✓ Completed Today</span></div>' : ''}
      </div>
    </div>
  `;

  // Walking timer logic
  let walkInterval = null;
  let walkSeconds = walkTime * 60;
  let cueInterval = null;

  const startBtn = container.querySelector('#btn-walk-start');
  const stopBtn = container.querySelector('#btn-walk-stop');
  const timerEl = container.querySelector('#walk-timer');
  const cueEl = container.querySelector('#walk-cue');

  startBtn?.addEventListener('click', () => {
    audio.initAudio();
    audio.playStart();
    walkSeconds = walkTime * 60;
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');

    // Show random cue
    showRandomCue(cueEl);
    cueInterval = setInterval(() => showRandomCue(cueEl), 60000);

    walkInterval = setInterval(() => {
      walkSeconds--;
      const m = Math.floor(walkSeconds / 60);
      const s = walkSeconds % 60;
      timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

      if (walkSeconds <= 3 && walkSeconds > 0) {
        audio.playCountdownBeep();
      }

      if (walkSeconds <= 0) {
        clearInterval(walkInterval);
        clearInterval(cueInterval);
        audio.playRoutineComplete();
        timerEl.textContent = '✓';
        cueEl.textContent = 'Great walk!';
        startBtn.classList.remove('hidden');
        startBtn.textContent = '🔄 Restart';
        stopBtn.classList.add('hidden');
        markCompleted('walking');
        logDailyActivity();
      }
    }, 1000);
  });

  stopBtn?.addEventListener('click', () => {
    clearInterval(walkInterval);
    clearInterval(cueInterval);
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    timerEl.textContent = `${walkTime}:00`;
    cueEl.textContent = '';
  });
}

function showRandomCue(el) {
  const cues = walkingProtocol.focusCues;
  el.textContent = '→ ' + cues[Math.floor(Math.random() * cues.length)];
}

function renderStandingGuide(container) {
  const done = isCompletedToday('standing');

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Standing Checkpoint</span> 🪞</h1>
      <p class="page-description">Stand in front of a mirror. Hold for 2 minutes. It will feel awkward. That's normal.</p>
    </div>

    <div class="guide-split animate-in">
      <!-- Left: Checklist -->
      <div class="glass-card no-hover">
        <h3 class="section-title mb-3" style="font-size: var(--fs-md)">Posture Checklist</h3>
        <div class="checklist" id="standing-checklist">
          ${standingCheckpoint.checkpoints.map((cp, i) => `
            <div class="checklist-item">
              <div class="check-icon" id="stand-check-${i}" data-checked="false" onclick="this.dataset.checked = this.dataset.checked === 'true' ? 'false' : 'true'; this.classList.toggle('checked');">✓</div>
              <span>${cp}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right: Timer -->
      <div class="guide-right-stack">
        <div class="glass-card no-hover text-center" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="timer-display mb-4">
            <div class="timer-value" id="stand-timer">2:00</div>
            <div class="timer-label">minutes</div>
          </div>
          <div class="flex items-center gap-4" style="justify-content: center">
            <button class="btn btn-primary btn-lg" id="btn-stand-start">▶ Start 2-Min Hold</button>
            <button class="btn btn-secondary btn-lg hidden" id="btn-stand-stop">⏹ Stop</button>
          </div>
        </div>
        ${done ? '<div class="text-center"><span class="badge badge-success" style="font-size: var(--fs-sm); padding: var(--sp-2) var(--sp-5)">✓ Completed Today</span></div>' : ''}
      </div>
    </div>
  `;

  let standInterval = null;
  let standSeconds = 120;

  const startBtn = container.querySelector('#btn-stand-start');
  const stopBtn = container.querySelector('#btn-stand-stop');
  const timerEl = container.querySelector('#stand-timer');

  startBtn?.addEventListener('click', () => {
    audio.initAudio();
    audio.playStart();
    standSeconds = 120;
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');

    standInterval = setInterval(() => {
      standSeconds--;
      const m = Math.floor(standSeconds / 60);
      const s = standSeconds % 60;
      timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

      if (standSeconds === 60) audio.playHalfway();
      if (standSeconds <= 3 && standSeconds > 0) audio.playCountdownBeep();

      if (standSeconds <= 0) {
        clearInterval(standInterval);
        audio.playRoutineComplete();
        timerEl.textContent = '✓';
        startBtn.classList.remove('hidden');
        startBtn.textContent = '🔄 Restart';
        stopBtn.classList.add('hidden');
        markCompleted('standing');
        logDailyActivity();
      }
    }, 1000);
  });

  stopBtn?.addEventListener('click', () => {
    clearInterval(standInterval);
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    timerEl.textContent = '2:00';
  });
}
