/* ========================================
   PhysicalAid — Routines Overview Page
   ======================================== */

import { allRoutines, nightMobility, walkingProtocol, standingCheckpoint, ExType, Sides } from '../data.js';
import { isCompletedToday } from '../storage.js';
import { navigate } from '../router.js';

export async function renderRoutines(container) {
  const allSections = [
    { group: 'Daily Reset', items: allRoutines },
    { group: 'Quick Routines', items: [nightMobility] }
  ];

  // Pre-resolve completion status for guide items
  const walkingDone = await isCompletedToday('walking');
  const standingDone = await isCompletedToday('standing');

  // Pre-resolve completion for all routines
  const sectionMarkup = [];
  for (const section of allSections) {
    const routineMarkup = [];
    for (const routine of section.items) {
      routineMarkup.push(await renderRoutineBoutique(routine));
    }
    sectionMarkup.push(`
      <div class="mb-12 animate-in">
        <h2 class="flow-label mb-6" style="font-size: 1rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem">
          ${section.group}
        </h2>
        ${routineMarkup.join('')}
      </div>
    `);
  }

  container.innerHTML = `
    <div class="mb-10 animate-in">
      <h1 class="display-heading">Routines</h1>
      <p class="text-muted" style="font-size: var(--fs-md)">Your complete body alignment library.</p>
    </div>

    <!-- Featured Master Routine -->
    <div class="mb-12 animate-in">
       <div class="routine-card-new" id="btn-full-reset" style="cursor:pointer; aspect-ratio: 21/7;">
          <div class="card-image">
            <img src="/images/exercises/thoracic_extension.png" style="opacity: 0.4">
          </div>
          <div class="card-content" style="padding: var(--sp-8)">
            <div>
              <div class="flow-label" style="color: #fff; opacity: 0.8;">Ultimate Alignment</div>
              <h2 style="font-size: 2.2rem; font-weight: 800; color: #fff;">Full Daily Reset</h2>
              <p class="text-muted" style="font-size: var(--fs-sm)">15–20 min • Complete structural overhaul</p>
            </div>
            <button class="btn-start-glass" style="padding: 1rem 2.5rem; font-size: 1rem;">▶ Start Master Routine</button>
          </div>
       </div>
    </div>

    ${sectionMarkup.join('')}

    <!-- Mindful Practice (Non-Boxy) -->
    <div class="mb-12 animate-in">
      <h2 class="flow-label mb-6" style="font-size: 1rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem">
        Mindful Practice
      </h2>
      <div class="flex flex-direction-column gap-4">
        <div class="flex items-center justify-between p-4" data-guide="walking" style="cursor:pointer; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-glass);">
          <div class="flex items-center gap-4">
            <span style="font-size: 2rem">${walkingProtocol.icon}</span>
            <div>
              <div style="font-weight: 700;">${walkingProtocol.title}</div>
              <div class="text-muted" style="font-size: 0.75rem">${walkingProtocol.duration}</div>
            </div>
          </div>
          ${walkingDone ? '<span class="badge badge-success">Done</span>' : '<span class="badge">Open Guide</span>'}
        </div>
        <div class="flex items-center justify-between p-4" data-guide="standing" style="cursor:pointer; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-glass);">
          <div class="flex items-center gap-4">
            <span style="font-size: 2rem">${standingCheckpoint.icon}</span>
            <div>
              <div style="font-weight: 700;">${standingCheckpoint.title}</div>
              <div class="text-muted" style="font-size: 0.75rem">${standingCheckpoint.duration}</div>
            </div>
          </div>
          ${standingDone ? '<span class="badge badge-success">Done</span>' : '<span class="badge">Open Guide</span>'}
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

async function renderRoutineBoutique(routine) {
  const done = await isCompletedToday(routine.id);
  const exercises = routine.exercises || [];

  return `
    <div class="mb-10">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 900; margin: 0;">${routine.title}</h3>
            <div class="text-muted" style="font-size: 0.75rem">${routine.duration} • ${exercises.length} exercises</div>
          </div>
        </div>
        <button class="btn-start-glass start-routine-btn" data-id="${routine.id}">▶ Start</button>
      </div>
      
      <!-- Horizontal Exercise Flow -->
      <div class="horizontal-scroll-container" style="padding-right: 40px;">
        ${exercises.map((ex, i) => `
          <div class="horizontal-item" style="background: var(--bg-card); padding: var(--sp-5); border-radius: 20px; border: 1px solid var(--border-glass); display: flex; flex-direction: column; justify-content: space-between; min-height: 140px;">
            <div>
              <div class="flex items-center gap-3 mb-3">
                 <span style="font-size: 1.5rem">${ex.emoji}</span>
                 <div style="font-weight: 700; font-size: 0.95rem; line-height: 1.2; color: #fff;">${ex.name}</div>
              </div>
              <div class="text-muted" style="font-size: 0.75rem; line-height: 1.4; margin-bottom: var(--sp-3)">${ex.purpose}</div>
            </div>
            <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-accent); text-transform: uppercase; letter-spacing: 0.05em;">
              ${ex.sets} × ${ex.type === ExType.TIMED ? ex.duration + 's' : ex.reps + ' reps'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
