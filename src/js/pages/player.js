/* ========================================
   PhysicalAid — Exercise Player Page
   ======================================== */

import { ExType, allRoutines, nightMobility, dailyResetFull, footArch, hipGlute, upperBody } from '../data.js';
import { startRoutine, stopRoutine, pauseResume, skipExercise, restartExercise, countRep, getState, previousExercise } from '../timer.js';
import { navigate } from '../router.js';

// Map routine IDs to data
const routineMap = {
  'foot-arch': footArch,
  'hip-glute': hipGlute,
  'upper-body': upperBody,
  'night-mobility': nightMobility
};

export function renderPlayer(routineId) {
  const overlay = document.getElementById('player-overlay');

  // Gather exercises
  let exercises = [];
  let title = '';

  if (routineId === 'daily-reset') {
    title = dailyResetFull.title;
    exercises = dailyResetFull.sections.flatMap(s => s.exercises);
  } else if (routineMap[routineId]) {
    const r = routineMap[routineId];
    title = r.title;
    exercises = r.exercises;
  } else {
    navigate('/');
    return;
  }

  // Render initial UI
  overlay.innerHTML = buildPlayerUI(title);
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Bind close button
  overlay.querySelector('#player-close')?.addEventListener('click', () => {
    stopRoutine();
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    navigate('/');
  });

  // Start the routine
  startRoutine(routineId, exercises, updateUI, onRoutineComplete);
}

function buildPlayerUI(title) {
  return `
    <div class="player-top-bar">
      <div class="player-routine-title">${title}</div>
      <button class="player-close-btn" id="player-close">✕</button>
    </div>
    <div class="player-progress-bar">
      <div class="player-progress-fill" id="player-progress" style="width: 0%"></div>
    </div>

    <div class="player-body" id="player-body">
      <!-- Dynamic content -->
    </div>
  `;
}

function updateUI(s) {
  const overlay = document.getElementById('player-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;

  const body = document.getElementById('player-body');
  const progress = document.getElementById('player-progress');

  if (!body) return;

  // Update progress bar
  if (progress) {
    progress.style.width = s.progress + '%';
  }

  // Finished state
  if (s.finished) {
    if (body.dataset.mode !== 'finished') {
      body.className = 'player-body player-body--center';
      body.dataset.mode = 'finished';
      body.innerHTML = `
        <div class="player-finish-icon">🎉</div>
        <div class="player-exercise-name">Routine Complete!</div>
        <div class="player-exercise-purpose">Great work. You just invested in your body.</div>
        <button class="btn btn-success btn-lg" id="btn-finish">✓ Done</button>
      `;

      body.querySelector('#btn-finish')?.addEventListener('click', () => {
        stopRoutine();
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        navigate('/');
      });
    }
    return;
  }

  const ex = s.currentExercise;
  if (!ex) return;

  const mode = s.isResting ? 'rest' : 'active';
  const exId = ex.id;

  // Check if we need to full re-render
  // Re-render if: mode changed, or exercise changed
  const needsRender = body.dataset.mode !== mode || body.dataset.exerciseId !== exId;

  if (needsRender) {
    body.dataset.mode = mode;
    body.dataset.exerciseId = exId;

    if (s.isResting) {
      renderRestUI(body, s, ex);
    } else {
      renderActiveUI(body, s, ex);
    }
    // Bind controls after render
    bindControls();
  } else {
    // Just update values
    updateValues(body, s, ex);
  }
}

function renderRestUI(body, s, ex) {
  body.className = 'player-body player-body--center';
  body.innerHTML = `
    <div class="player-content-wrapper">
      <div class="rest-screen">
        <div class="rest-label">😤 Rest</div>
        
        <div class="player-action-row">
          <button class="player-nav-btn prev" id="btn-prev" title="Previous Exercise">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div class="timer-ring big-timer" id="timer-wrapper" title="Click to Pause/Resume">
            <div class="timer-value" id="timer-value">${s.timeRemaining}</div>
            <div class="timer-label">seconds</div>
          </div>

          <button class="player-nav-btn next" id="btn-next" title="Skip Rest">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div class="player-set-indicator">Next: Set ${s.currentSet + 1} of ${s.totalSets}</div>
        <div class="rest-next">${ex.emoji} ${ex.name}${ex.sideName ? ' (' + ex.sideName + ')' : ''}</div>
      </div>
    </div>
  `;
}

function renderActiveUI(body, s, ex) {
  body.className = 'player-body player-body--split';
  const sideBadge = ex.sideName ? `<span class="badge badge-accent">${ex.sideName} Side</span>` : '';

  /* Visual (Image or Emoji) */
  let visualHTML = '';
  if (ex.image) {
    visualHTML = `<div class="player-image-container"><img src="${ex.image}" alt="${ex.name}" class="player-exercise-image animate-in"></div>`;
  } else {
    visualHTML = `<div class="player-emoji-inline">${ex.emoji}</div>`;
  }

  /* Steps */
  const hasSteps = ex.steps && ex.steps.length > 0;
  const stepsList = hasSteps ? `
      <div class="player-steps">
        <div class="player-steps-title">How to do it</div>
        <ol class="player-steps-list">
          ${ex.steps.map(st => `<li>${st}</li>`).join('')}
        </ol>
      </div>
  ` : '';

  /* Right Panel Meta */
  const metaHTML = `
    <div class="player-exercise-name">${ex.name}</div>
    ${sideBadge}
    <div class="player-exercise-purpose">${ex.purpose}</div>
    <div class="player-set-indicator" id="set-indicator">
      Exercise ${s.currentIndex + 1} of ${s.totalExercises} · Set ${s.currentSet} of ${s.totalSets}
    </div>
  `;

  let actionHTML = '';
  if (ex.type === ExType.TIMED) {
    actionHTML = `
      <div class="timer-value" id="timer-value">${s.timeRemaining}</div>
      <div class="timer-label">seconds</div>
    `;
  } else {
    actionHTML = `
      <div class="rep-counter">
        <div class="rep-value" id="rep-value">${s.repCount}</div>
        <div class="rep-target">of ${s.targetReps} reps</div>
        <button class="rep-btn" id="rep-tap">+1</button>
      </div>
    `;
  }

  body.innerHTML = `
    <div class="player-panel-left">
      ${visualHTML}
      ${stepsList}
    </div>
    
     <div class="player-panel-right">
       <div class="player-content-wrapper">
         ${metaHTML}
         
         <div class="player-action-row">
           <button class="player-nav-btn prev" id="btn-prev" title="Previous Exercise">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
           </button>
           
           <div class="timer-wrapper" id="timer-wrapper" title="Click to Pause/Resume">
             <div class="timer-ring">
               ${actionHTML}
             </div>
             <div class="timer-pause-overlay" id="pause-overlay" style="display: none;"><div class="pause-icon">⏸</div></div>
           </div>

           <button class="player-nav-btn next" id="btn-next" title="Next Exercise">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
           </button>
         </div>

         <div class="player-hint text-muted mt-4" style="font-size: var(--fs-xs); opacity: 0.6;">
           ${ex.type === ExType.TIMED ? 'Tap timer to pause' : ''}
         </div>
       </div>
     </div>
   `;

  if (ex.type !== ExType.TIMED) {
    body.querySelector('#rep-tap')?.addEventListener('click', () => countRep());
  }
}

function updateValues(body, s, ex) {
  // Update Timer/Reps
  if (ex.type === ExType.TIMED || s.isResting) {
    const valEl = document.getElementById('timer-value');
    if (valEl) valEl.textContent = s.timeRemaining;
  } else {
    const repEl = document.getElementById('rep-value');
    if (repEl) repEl.textContent = s.repCount;
  }

  // Update Paused State Overlay
  const pauseOverlay = document.getElementById('pause-overlay');
  const timerWrapper = document.getElementById('timer-wrapper');

  if (timerWrapper) {
    if (s.paused) {
      timerWrapper.classList.add('paused');
      if (pauseOverlay) pauseOverlay.style.display = 'flex';
    } else {
      timerWrapper.classList.remove('paused');
      if (pauseOverlay) pauseOverlay.style.display = 'none';
    }
  }
}

function bindControls() {
  const timerWrap = document.getElementById('timer-wrapper');
  if (timerWrap) {
    timerWrap.onclick = (e) => {
      if (e.target.closest('.rep-btn')) return;
      pauseResume();
    };
  }

  document.getElementById('btn-prev')?.addEventListener('click', previousExercise);
  document.getElementById('btn-next')?.addEventListener('click', () => skipExercise());
}

function onRoutineComplete(routineId) {
  // The UI update handles the completion screen
}
