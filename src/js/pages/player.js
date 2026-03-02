/* ========================================
   PhysicalAid — Exercise Player Page
   ======================================== */

import { ExType, allRoutines, nightMobility, dailyResetFull, footArch, hipGlute, upperBody } from '../data.js';
import { startRoutine, stopRoutine, pauseResume, skipExercise, skipRest, countRep, getState, previousExercise } from '../timer.js';
import { navigate } from '../router.js';

// Map routine IDs to data
const routineMap = {
  'foot-arch': footArch,
  'hip-glute': hipGlute,
  'upper-body': upperBody,
  'night-mobility': nightMobility
};

let removeKeyboardControls = null;

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
  setupKeyboardControls();

  // Bind close button
  overlay.querySelector('#player-close')?.addEventListener('click', () => {
    closePlayer();
  });

  // Start the routine
  startRoutine(routineId, exercises, updateUI, onRoutineComplete);
}

function closePlayer() {
  const overlay = document.getElementById('player-overlay');
  stopRoutine();
  teardownKeyboardControls();
  overlay?.classList.add('hidden');
  document.body.style.overflow = '';
  navigate('/');
}

function setupKeyboardControls() {
  teardownKeyboardControls();
  const onKeyDown = (e) => {
    const overlay = document.getElementById('player-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;

    if (e.key === ' ') {
      e.preventDefault();
      const s = getState();
      if (!s.currentExercise) return;
      if (!s.isResting && s.currentExercise.type !== ExType.TIMED) {
        countRep();
      } else {
        pauseResume();
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      previousExercise();
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const s = getState();
      if (s.isResting) {
        skipRest();
      } else {
        skipExercise();
      }
    }
  };

  document.addEventListener('keydown', onKeyDown);
  removeKeyboardControls = () => document.removeEventListener('keydown', onKeyDown);
}

function teardownKeyboardControls() {
  if (removeKeyboardControls) {
    removeKeyboardControls();
    removeKeyboardControls = null;
  }
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
        closePlayer();
      });
    }
    return;
  }

  const ex = s.currentExercise;
  if (!ex) return;

  const mode = s.isResting ? 'rest' : 'active';
  const exKey = `${ex.id}:${ex.sideName || 'none'}`;

  // Check if we need to full re-render
  // Re-render if mode, exercise id, or side variant changed.
  const needsRender = body.dataset.mode !== mode || body.dataset.exerciseKey !== exKey;

  if (needsRender) {
    body.dataset.mode = mode;
    body.dataset.exerciseKey = exKey;

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
  const circumference = 2 * Math.PI * 120;
  const progress = s.totalDuration > 0 ? (s.timeRemaining / s.totalDuration) : 1;
  const dashoffset = circumference * (1 - progress);

  body.className = 'player-body player-body--center';
  body.innerHTML = `
    <div class="player-content-wrapper">
      <div class="rest-screen">
        <div class="rest-label">😤 Rest</div>
        
        <div class="player-action-row">
          <button class="player-nav-btn prev" id="btn-prev" title="Previous Exercise">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div class="timer-ring" id="timer-wrapper" title="Click to Pause/Resume">
            <svg class="timer-svg-ring" width="280" height="280" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(99, 102, 241, 0.1)" stroke-width="6" />
              <circle class="timer-svg-progress" cx="130" cy="130" r="120" fill="none" stroke="url(#rest-gradient)" stroke-width="6" stroke-linecap="round"
                stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
                transform="rotate(-90 130 130)" />
              <defs>
                <linearGradient id="rest-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#7c3aed" />
                  <stop offset="100%" stop-color="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <div class="timer-ring-content">
              <div class="timer-value" id="timer-value">${s.timeRemaining}</div>
              <div class="timer-label">seconds</div>
            </div>
            <div class="pause-overlay" id="pause-overlay" style="display: none;">⏸</div>
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
  const sideInfo = ex.sideName ? `(${ex.sideName})` : '';

  /* 
     1. Visual Card (Image + Title inside) 
  */
  let visualContent = '';
  if (ex.image) {
    visualContent = `<img src="${ex.image}" alt="${ex.name}" class="player-exercise-image animate-in">`;
  } else {
    visualContent = `<div class="player-emoji-inline">${ex.emoji}</div>`;
  }

  const visualCardHTML = `
    <div class="player-visual-card">
      <div class="player-image-wrapper">
        ${visualContent}
      </div>
      <div class="player-visual-footer">
        <h2 class="visual-title">${ex.name} ${sideInfo}</h2>
        <div class="visual-subtitle">${ex.purpose}</div>
      </div>
    </div>
  `;

  /* 
     2. Steps Card 
  */
  const hasSteps = ex.steps && ex.steps.length > 0;
  const stepsCardHTML = hasSteps ? `
      <div class="player-steps-card">
        <div class="steps-header">HOW TO DO IT</div>
        <ol class="steps-list">
          ${ex.steps.map(st => `<li><span>${st}</span></li>`).join('')}
        </ol>
      </div>
  ` : '';

  /* 
     3. Footer (Set Info + Controls) 
  */
  const setInfoHTML = `
    <div class="player-set-pill">
      SET ${s.currentSet} OF ${s.totalSets} · EXERCISE ${s.currentIndex + 1}/${s.totalExercises}
    </div>
  `;

  let actionHTML = '';
  if (ex.type === ExType.TIMED) {
    const circumference = 2 * Math.PI * 120;
    const progress = s.totalDuration > 0 ? (s.timeRemaining / s.totalDuration) : 1;
    const dashoffset = circumference * (1 - progress);

    // Timer Ring
    actionHTML = `
      <div class="timer-ring-container">
        <svg class="timer-svg" width="240" height="240" viewBox="0 0 260 260">
           <!-- BG Circle -->
           <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="4" />
           <!-- Progress (Purple) -->
           <circle class="timer-svg-progress" cx="130" cy="130" r="120" fill="none" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"
             stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
             transform="rotate(-90 130 130)" />
        </svg>
        <div class="timer-content">
          <div class="timer-number" id="timer-value">${s.timeRemaining}</div>
          <div class="timer-label">SECONDS</div>
        </div>
      </div>
    `;
  } else {
    const circumference = 2 * Math.PI * 120;
    const progress = s.targetReps > 0 ? (s.repCount / s.targetReps) : 0;
    const dashoffset = circumference * (1 - progress);

    actionHTML = `
      <div class="timer-ring-container">
        <svg class="timer-svg" width="240" height="240" viewBox="0 0 260 260">
           <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="4" />
           <circle class="timer-svg-progress" cx="130" cy="130" r="120" fill="none" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"
             stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
             transform="rotate(-90 130 130)" />
        </svg>
        <div class="timer-content">
          <div class="timer-number" id="rep-value">${s.repCount}</div>
          <div class="timer-label">of ${s.targetReps} reps</div>
          <button class="rep-tap-area" id="rep-tap"></button>
        </div>
      </div>
    `;
  }

  /* Assemble DOM */
  body.innerHTML = `
    <div class="player-scroll-area">
      ${visualCardHTML}
      ${stepsCardHTML}
    </div>
    
    <div class="player-fixed-footer">
       ${setInfoHTML}
       
       <div class="player-controls-row">
          <button class="control-btn prev" id="btn-prev" title="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div class="timer-interactive" id="timer-wrapper">
             ${actionHTML}
             <div class="pause-overlay" id="pause-overlay" style="display: none;">⏸</div>
          </div>

          <button class="control-btn next" id="btn-next" title="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
       </div>
       
       <div class="footer-hint">
         ${ex.type === ExType.TIMED ? 'Tap timer or press Space to pause' : 'Tap timer or press Space to count reps'}
       </div>
    </div>
  `;

  if (ex.type !== ExType.TIMED) {
    body.querySelector('#rep-tap')?.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent pause
      countRep();
    });
  }
}

function updateValues(body, s, ex) {
  // Update Timer/Reps
  if (ex.type === ExType.TIMED || s.isResting) {
    const valEl = document.getElementById('timer-value');
    if (valEl) valEl.textContent = s.timeRemaining;

    const progressCircle = body.querySelector('.timer-svg-progress');
    if (progressCircle && s.totalDuration > 0) {
      const circumference = 2 * Math.PI * 120;
      const progress = s.timeRemaining / s.totalDuration;
      progressCircle.style.strokeDashoffset = circumference * (1 - progress);
    }
  } else {
    const repEl = document.getElementById('rep-value');
    if (repEl) repEl.textContent = s.repCount;

    const progressCircle = body.querySelector('.timer-svg-progress');
    if (progressCircle && s.targetReps > 0) {
      const circumference = 2 * Math.PI * 120;
      const progress = s.repCount / s.targetReps;
      progressCircle.style.strokeDashoffset = circumference * (1 - progress);
    }
  }

  // Update Paused State Overlay
  const pauseOverlay = document.getElementById('pause-overlay');
  const timerWrapper = document.getElementById('timer-wrapper');

  if (timerWrapper) {
    if (s.paused) {
      if (pauseOverlay) pauseOverlay.style.display = 'flex';
    } else {
      if (pauseOverlay) pauseOverlay.style.display = 'none';
    }
  }
}

function bindControls() {
  const timerWrap = document.getElementById('timer-wrapper');
  if (timerWrap) {
    timerWrap.onclick = (e) => {
      // Look up fresh state to avoid stale closure issues
      const s = getState();
      const ex = s.currentExercise;

      // Don't handle if user is tapping for reps
      if (e.target.closest('.rep-tap-area')) return;

      // During rest, always pause/resume
      if (s.isResting) {
        pauseResume();
        return;
      }

      // Active state logic
      if (ex && ex.type !== ExType.TIMED) {
        countRep();
      } else {
        pauseResume();
      }
    };
  }

  document.getElementById('btn-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    previousExercise();
  });

  document.getElementById('btn-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const s = getState();
    if (s.isResting) {
      skipRest();
    } else {
      skipExercise();
    }
  });
}

function onRoutineComplete(routineId) {
  // The UI update handles the completion screen
}
