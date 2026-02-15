/* ========================================
   PhysicalAid — Guides Page
   ======================================== */

import { walkingProtocol, standingCheckpoint, sittingRules, sleepingPosition } from '../data.js';
import { markCompleted, isCompletedToday, getSettings } from '../storage.js';
import * as audio from '../audio.js';

export async function renderGuides(container, subPage) {
  if (subPage === 'walking') {
    await renderWalkingGuide(container);
  } else if (subPage === 'standing') {
    await renderStandingGuide(container);
  } else {
    renderGuidesOverview(container);
  }
}

function renderGuidesOverview(container) {
  container.innerHTML = `
    <div class="mb-10 animate-in">
      <h1 class="display-heading">Posture Guides</h1>
      <p class="text-muted" style="font-size: var(--fs-md)">Reference protocols for the other 23 hours of the day.</p>
    </div>

    <!-- Immersive Guide Launchers -->
    <div class="flex gap-4 mb-12 animate-in">
      <div class="routine-card-new" data-guide="walking" style="cursor:pointer; flex: 1 1 0; min-width: 0; height: 200px; border-radius: 20px;">
          <div class="card-image"><img src="/images/exercises/glute_bridges.png" style="opacity: 0.2"></div>
          <div class="card-content" style="padding: var(--sp-6);">
            <div style="margin-bottom: var(--sp-2)">
              <div class="flow-label" style="color:#fff; font-size: 0.65rem; opacity: 0.7;">Movement</div>
              <h2 style="font-size: 1.4rem; font-weight: 900; color:#fff; line-height: 1.15;">Walking Protocol</h2>
            </div>
            <button class="btn-start-glass" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">▶ Open</button>
          </div>
      </div>
      <div class="routine-card-new" data-guide="standing" style="cursor:pointer; flex: 1 1 0; min-width: 0; height: 200px; border-radius: 20px;">
          <div class="card-image"><img src="/images/exercises/plank.png" style="opacity: 0.2"></div>
          <div class="card-content" style="padding: var(--sp-6);">
            <div style="margin-bottom: var(--sp-2)">
              <div class="flow-label" style="color:#fff; font-size: 0.65rem; opacity: 0.7;">Alignment</div>
              <h2 style="font-size: 1.4rem; font-weight: 900; color:#fff; line-height: 1.15;">Standing Checkpoint</h2>
            </div>
            <button class="btn-start-glass" style="padding: 0.5rem 1.2rem; font-size: 0.8rem;">▶ Open</button>
          </div>
      </div>
    </div>

    <!-- Sitting Rules + Sleeping Position (Side-by-Side) -->
    <div class="flex gap-8 mb-12 animate-in" style="align-items: flex-start;">
      <div style="flex: 1 1 0; min-width: 0;">
        <h2 class="flow-label mb-6" style="font-size: 1.2rem; font-weight: 900; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem">
          🪑 Sitting Rules
        </h2>
        <div class="flex flex-direction-column gap-3 mb-4">
          ${sittingRules.rules.map(rule => `
            <div class="flex items-start gap-3 p-3" style="background: var(--bg-card); border-radius: 14px; border: 1px solid var(--border-glass);">
              <span style="color: var(--accent-primary); font-weight: 800;">✓</span>
              <span style="font-size: 0.85rem; font-weight: 600;">${rule}</span>
            </div>
          `).join('')}
        </div>
        <div class="p-3" style="border-radius: 14px; background: rgba(234, 179, 8, 0.05); border: 1px solid rgba(234, 179, 8, 0.2);">
          <div style="color: var(--color-warning); font-weight: 800; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 4px;">⚠️ Reset Rule</div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">${sittingRules.reset}</p>
        </div>
      </div>

      <div style="flex: 1 1 0; min-width: 0;">
        <h2 class="flow-label mb-6" style="font-size: 1.2rem; font-weight: 900; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem">
          🛏️ Sleeping Position
        </h2>
        <div class="flex flex-direction-column gap-5">
          <div>
            <div class="flow-label mb-3" style="font-size: 0.7rem">Recommended</div>
            <div class="flex flex-direction-column gap-2">
              ${sleepingPosition.best.map(pos => `
                <div class="flex items-center gap-3" style="font-size: 0.85rem;">
                  <span style="color: var(--color-success)">✓</span> ${pos}
                </div>
              `).join('')}
            </div>
          </div>
          <div>
            <div class="flow-label mb-3" style="font-size: 0.7rem; color: var(--color-warning)">Avoid</div>
            <div class="flex flex-direction-column gap-2">
              ${sleepingPosition.avoid.map(pos => `
                <div class="flex items-center gap-3" style="font-size: 0.85rem; opacity: 0.6;">
                  <span style="color: var(--color-warning)">×</span> ${pos}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-guide]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = '#/guides/' + card.dataset.guide;
    });
  });
}

async function renderWalkingGuide(container) {
  const done = await isCompletedToday('walking');
  const settings = await getSettings();
  const walkTime = settings.walkingDuration || 5;

  container.innerHTML = `
    <div class="mb-10 animate-in">
      <h1 class="display-heading" style="font-size: 2.5rem">Walking Protocol</h1>
      <p class="text-muted">Conscious movement practice.</p>
    </div>

    <div class="flex flex-direction-column gap-8 animate-in">
      <!-- Immersive Timer -->
      <div class="p-10 text-center" style="background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-glass); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div class="flow-label mb-3">Active Practice</div>
          <div id="walk-timer" style="font-size: 5rem; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; margin: 1rem 0;">${walkTime}:00</div>
          <div id="walk-cue" class="mt-4" style="font-size: 1.1rem; color: var(--text-accent); min-height: 1.5em; font-weight: 700; opacity: 0.9;"></div>
          
          <div class="flex justify-center gap-4 mt-10">
            <button class="btn-start-glass" id="btn-walk-start" style="padding: 1.2rem 3rem;">▶ Start Walking</button>
            <button class="btn btn-secondary hidden" id="btn-walk-stop" style="border-radius: 12px;">Stop</button>
          </div>
      </div>

      <!-- Checklist -->
      <div class="mt-4">
        <h3 class="flow-label mb-6">Focus Cues</h3>
        <div class="flex flex-direction-column gap-3">
          ${walkingProtocol.focusCues.map((cue, i) => `
            <div class="flex items-center gap-4 p-5" style="background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid var(--border-glass); cursor: pointer;" 
                 onclick="this.style.opacity = this.style.opacity === '1' ? '0.4' : '1'; this.querySelector('.check-mark').style.display = this.querySelector('.check-mark').style.display === 'none' ? 'block' : 'none';">
              <div style="width: 24px; height: 24px; border: 2px solid var(--accent-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span class="check-mark" style="display: none; color: var(--accent-primary); font-weight: 900; font-size: 0.9rem;">✓</span>
              </div>
              <span style="font-weight: 600; font-size: 0.95rem; color: rgba(255,255,255,0.9);">${cue}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="p-6" style="border-radius: 20px; background: var(--bg-sidebar); border: 1px solid var(--border-glass);">
        <div class="flow-label mb-2">Pro Tip</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary)">Film yourself walking now. Visual feedback beats guessing every time.</p>
      </div>

      ${done ? '<div class="text-center"><span class="badge badge-success">✓ Completed Today</span></div>' : ''}
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

    showRandomCue(cueEl);
    cueInterval = setInterval(() => showRandomCue(cueEl), 60000);

    walkInterval = setInterval(async () => {
      walkSeconds--;
      const m = Math.floor(walkSeconds / 60);
      const s = walkSeconds % 60;
      timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

      if (walkSeconds <= 3 && walkSeconds > 0) audio.playCountdownBeep();

      if (walkSeconds <= 0) {
        clearInterval(walkInterval);
        clearInterval(cueInterval);
        audio.playRoutineComplete();
        timerEl.textContent = '✓';
        cueEl.textContent = 'Great walk!';
        startBtn.classList.remove('hidden');
        startBtn.textContent = '🔄 Restart';
        stopBtn.classList.add('hidden');
        await markCompleted('walking', { durationMin: walkTime, type: 'walking' });
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

async function renderStandingGuide(container) {
  const done = await isCompletedToday('standing');

  container.innerHTML = `
    <div class="mb-10 animate-in">
      <h1 class="display-heading" style="font-size: 2.5rem">Standing Checkpoint</h1>
      <p class="text-muted">2-minute structural alignment.</p>
    </div>

    <div class="flex flex-direction-column gap-10 animate-in">
      <div class="p-8 text-center" style="background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-glass);">
          <div id="stand-timer" style="font-size: 6rem; font-weight: 800; font-variant-numeric: tabular-nums;">2:00</div>
          <div class="flex justify-center gap-4 mt-8">
            <button class="btn-start-glass" id="btn-stand-start" style="padding: 1rem 2.5rem;">▶ Start 2-Min Hold</button>
            <button class="btn btn-secondary hidden" id="btn-stand-stop" style="border-radius: 12px;">Stop</button>
          </div>
      </div>

      <div>
        <h3 class="flow-label mb-6">Alignment Matrix</h3>
        <div class="flex flex-direction-column gap-3">
          ${standingCheckpoint.checkpoints.map((cp, i) => `
             <div class="flex items-center gap-4 p-4" style="background: rgba(255,255,255,0.03); border-radius: 16px;">
              <div style="color: var(--accent-primary); font-weight: 800;">✓</div>
              <span style="font-weight: 600; font-size: 0.9rem;">${cp}</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${done ? '<div class="text-center"><span class="badge badge-success">✓ Completed Today</span></div>' : ''}
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

    standInterval = setInterval(async () => {
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
        await markCompleted('standing', { durationMin: 2, type: 'standing' });
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
