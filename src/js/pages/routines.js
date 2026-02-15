/* ========================================
   PhysicalAid — Routines Overview Page
   ======================================== */

import { allRoutines, nightMobility, walkingProtocol, standingCheckpoint, ExType, Sides } from '../data.js';
import { isCompletedToday } from '../storage.js';
import { navigate } from '../router.js';

export function renderRoutines(container) {
  const allSections = [
    { group: 'Daily Reset (15–20 min)', items: allRoutines },
    { group: 'Quick Routines', items: [nightMobility] }
  ];

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Routines</span></h1>
      <p class="page-description">Your complete exercise library. Start any routine or view exercise details.</p>
    </div>

    <!-- Full Daily Reset button -->
    <div class="mb-8 animate-in">
      <button class="btn btn-primary btn-lg w-full" id="btn-full-reset" style="justify-content: center; padding: var(--sp-5);">
        🔄 Start Full Daily Reset (15–20 min)
      </button>
    </div>

    ${allSections.map(section => `
      <div class="routine-block animate-in">
        <div class="routine-header">
          <h2 class="section-title">${section.group}</h2>
        </div>
        ${section.items.map(routine => renderRoutineSection(routine)).join('')}
      </div>
    `).join('')}

    <!-- Walking & Standing (guides) -->
    <div class="routine-block animate-in">
      <div class="routine-header">
        <h2 class="section-title">Mindful Practice</h2>
      </div>
      <div class="grid-2 mb-6">
        <div class="glass-card launch-card ${walkingProtocol.cardClass}" data-guide="walking" style="cursor:pointer">
          <div class="launch-card-header">
            <div class="launch-card-icon">${walkingProtocol.icon}</div>
            <div>
              <div class="launch-card-title">${walkingProtocol.title}</div>
              <div class="launch-card-meta">${walkingProtocol.duration}</div>
            </div>
          </div>
          <div class="launch-card-status">
            ${isCompletedToday('walking') ? '<span class="badge badge-success">✓ Done</span>' : '<span class="badge">Open Guide</span>'}
          </div>
        </div>
        <div class="glass-card launch-card ${standingCheckpoint.cardClass}" data-guide="standing" style="cursor:pointer">
          <div class="launch-card-header">
            <div class="launch-card-icon">${standingCheckpoint.icon}</div>
            <div>
              <div class="launch-card-title">${standingCheckpoint.title}</div>
              <div class="launch-card-meta">${standingCheckpoint.duration}</div>
            </div>
          </div>
          <div class="launch-card-status">
            ${isCompletedToday('standing') ? '<span class="badge badge-success">✓ Done</span>' : '<span class="badge">Open Guide</span>'}
          </div>
        </div>
      </div>
    </div>
  `;

  // Events
  container.querySelector('#btn-full-reset')?.addEventListener('click', () => {
    navigate('/player/daily-reset');
  });

  container.querySelectorAll('.start-routine-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate('/player/' + btn.dataset.id);
    });
  });

  container.querySelectorAll('[data-guide]').forEach(card => {
    card.addEventListener('click', () => {
      navigate('/guides/' + card.dataset.guide);
    });
  });
}

function renderRoutineSection(routine) {
  const done = isCompletedToday(routine.id);
  const exercises = routine.exercises || [];

  return `
    <div class="glass-card no-hover mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <span style="font-size: var(--fs-2xl)">${routine.icon}</span>
          <div>
            <div class="routine-title" style="margin-bottom: 0">${routine.title}</div>
            <div class="launch-card-meta">${routine.duration} • ${exercises.length} exercises</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          ${done ? '<span class="badge badge-success">✓ Done</span>' : ''}
          <button class="btn btn-primary start-routine-btn" data-id="${routine.id}">▶ Start</button>
        </div>
      </div>
      <div class="exercise-grid">
        ${exercises.map((ex, i) => `
          <div class="exercise-card">
            <div class="exercise-card-top">
              <span class="exercise-card-emoji">${ex.emoji}</span>
              <span class="exercise-card-num">${i + 1}</span>
            </div>
            <div class="exercise-card-name">${ex.name}</div>
            <div class="exercise-card-detail">
              ${ex.sets} × ${ex.type === ExType.TIMED ? ex.duration + 's' : ex.reps + ' reps'}${ex.sides === Sides.EACH ? ' / side' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
