/* ========================================
   PhysicalAid — Routines Overview Page
   ======================================== */

import { allRoutines, nightMobility, walkingProtocol, standingCheckpoint, dailyResetFull } from '../data.js';
import { isCompletedToday, getUserProfile, getSettings, getTodayPlan } from '../storage.js';
import { navigate } from '../router.js';
import { renderTodayPlanCard, bindTodayPlanActions } from '../components/todayPlan.js';
import { getSmartReminderInsights } from '../reminders.js';

export async function renderRoutines(container) {
  const [profile, settings, walkingDone, standingDone, todayPlan, reminderInsights] = await Promise.all([
    getUserProfile(),
    getSettings(),
    isCompletedToday('walking'),
    isCompletedToday('standing'),
    getTodayPlan(),
    getSmartReminderInsights()
  ]);

  const routineCatalog = [
    { ...dailyResetFull, id: dailyResetFull.id, category: 'full' },
    ...allRoutines.map(r => ({ ...r, category: 'daily' })),
    { ...nightMobility, category: 'quick' }
  ];

  const completionMap = {};
  for (const routine of routineCatalog) {
    completionMap[routine.id] = await isCompletedToday(routine.id);
  }

  const recommendation = getRecommendation(routineCatalog, completionMap, profile);

  container.innerHTML = `
    <div class="mb-8 animate-in">
      <h1 class="display-heading">Routines</h1>
      <p class="text-muted" style="font-size: var(--fs-md)">Plan by time and focus, then start immediately.</p>
    </div>

    <div class="mb-8 animate-in">
      ${renderTodayPlanCard(todayPlan, { title: 'Shared Checklist', reminders: reminderInsights.messages })}
    </div>

    <div class="routine-reco-card animate-in mb-8">
      <div>
        <div class="flow-label" style="margin-bottom: 0.35rem;">Recommended For You</div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">${recommendation.title}</h2>
        <p class="text-muted" style="font-size: 0.78rem; margin-top: 0.35rem;">${recommendation.reason}</p>
      </div>
      <button class="btn-start-glass" id="btn-start-recommended">▶ Start</button>
    </div>

    <div class="routine-planner animate-in mb-8">
      <div style="display: grid; gap: var(--sp-3);">
        <input id="routine-search" class="log-input" style="width: 100%;" placeholder="Search routines or exercises" />
        <div class="routine-filter-row">
          <select id="routine-time-filter" class="setting-select">
            <option value="all">Any Duration</option>
            <option value="short">Short (≤ 8 min)</option>
            <option value="medium">Medium (9–12 min)</option>
            <option value="long">Long (13+ min)</option>
          </select>
          <select id="routine-focus-filter" class="setting-select">
            <option value="all">Any Focus</option>
            <option value="posture">Posture</option>
            <option value="mobility">Mobility</option>
            <option value="strength">Strength Prep</option>
          </select>
          <button id="btn-reset-filters" class="btn btn-secondary" style="padding: 0.45rem 0.8rem;">Reset</button>
        </div>
        <div class="text-muted" style="font-size: 0.72rem;">Tip: your rest timer is currently ${settings.restDuration}s, and walking timer is ${settings.walkingDuration} min.</div>
      </div>
    </div>

    <div id="routine-library" class="routine-library-grid animate-in">
      ${routineCatalog.map((routine) => renderRoutineCard(routine, completionMap[routine.id])).join('')}
    </div>

    <div class="mb-8 mt-8 animate-in">
      <h2 class="flow-label mb-4" style="font-size: 0.95rem;">Mindful Practice</h2>
      <div class="routine-guide-grid">
        ${renderGuideCard(walkingProtocol, walkingDone, 'walking')}
        ${renderGuideCard(standingCheckpoint, standingDone, 'standing')}
      </div>
    </div>
  `;

  const startRecommended = container.querySelector('#btn-start-recommended');
  startRecommended?.addEventListener('click', () => {
    navigate('/player/' + recommendation.id);
  });

  container.querySelectorAll('.btn-start-routine').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate('/player/' + btn.dataset.id);
    });
  });

  container.querySelectorAll('.btn-preview-routine').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const preview = container.querySelector(`#preview-${id}`);
      if (!preview) return;
      const isHidden = preview.classList.contains('hidden');
      preview.classList.toggle('hidden');
      btn.textContent = isHidden ? 'Hide Preview' : 'Preview';
    });
  });

  container.querySelectorAll('[data-guide]').forEach(card => {
    card.addEventListener('click', () => navigate('/guides/' + card.dataset.guide));
  });

  const applyFilters = () => {
    const search = String(container.querySelector('#routine-search')?.value || '').toLowerCase().trim();
    const timeFilter = container.querySelector('#routine-time-filter')?.value || 'all';
    const focusFilter = container.querySelector('#routine-focus-filter')?.value || 'all';

    container.querySelectorAll('.routine-library-item').forEach(item => {
      const text = item.dataset.searchText || '';
      const duration = Number(item.dataset.durationMin || 0);
      const focus = item.dataset.focus || '';

      const matchesSearch = !search || text.includes(search);
      const matchesTime = (
        timeFilter === 'all' ||
        (timeFilter === 'short' && duration <= 8) ||
        (timeFilter === 'medium' && duration >= 9 && duration <= 12) ||
        (timeFilter === 'long' && duration >= 13)
      );
      const matchesFocus = focusFilter === 'all' || focus === focusFilter;

      item.classList.toggle('hidden', !(matchesSearch && matchesTime && matchesFocus));
    });
  };

  container.querySelector('#routine-search')?.addEventListener('input', applyFilters);
  container.querySelector('#routine-time-filter')?.addEventListener('change', applyFilters);
  container.querySelector('#routine-focus-filter')?.addEventListener('change', applyFilters);
  container.querySelector('#btn-reset-filters')?.addEventListener('click', () => {
    container.querySelector('#routine-search').value = '';
    container.querySelector('#routine-time-filter').value = 'all';
    container.querySelector('#routine-focus-filter').value = 'all';
    applyFilters();
  });

  bindTodayPlanActions(container);
}

function renderRoutineCard(routine, doneToday) {
  const exercises = getRoutineExercises(routine);
  const durationMin = estimateDurationMin(routine.duration);
  const focus = getRoutineFocus(routine.title);
  const searchText = `${routine.title} ${exercises.map(ex => ex.name).join(' ')}`.toLowerCase();

  return `
    <div
      class="routine-library-item"
      data-search-text="${escapeAttr(searchText)}"
      data-duration-min="${durationMin}"
      data-focus="${focus}"
    >
      <div class="routine-library-card">
        <div class="flex items-center justify-between mb-3" style="gap: var(--sp-2);">
          <h3 style="font-size: 1rem; font-weight: 800; color: #fff; margin: 0;">${routine.title}</h3>
          ${doneToday ? '<span class="badge badge-success">Done</span>' : '<span class="badge">Pending</span>'}
        </div>
        <div class="text-muted" style="font-size: 0.74rem; margin-bottom: var(--sp-3);">
          ${routine.duration} · ${exercises.length} exercises · ${capitalize(focus)}
        </div>
        <div class="routine-chip-row">
          ${exercises.slice(0, 3).map(ex => `<span class="routine-chip">${ex.emoji || '•'} ${ex.name}</span>`).join('')}
          ${exercises.length > 3 ? `<span class="routine-chip">+${exercises.length - 3} more</span>` : ''}
        </div>
        <div class="flex gap-2 mt-4">
          <button class="btn-start-glass btn-start-routine" data-id="${routine.id}" style="flex: 1;">▶ Start</button>
          <button class="btn btn-secondary btn-preview-routine" data-id="${routine.id}" style="padding: 0.45rem 0.8rem;">Preview</button>
        </div>
      </div>
      <div id="preview-${routine.id}" class="hidden routine-preview-panel">
        ${exercises.map(ex => `
          <div class="routine-preview-item">
            <span style="font-size: 0.9rem">${ex.emoji || '•'}</span>
            <div style="flex: 1;">
              <div style="font-size: 0.8rem; font-weight: 700; color: #fff;">${ex.name}</div>
              <div class="text-muted" style="font-size: 0.7rem;">${ex.sets} sets · ${ex.duration ? `${ex.duration}s` : `${ex.reps} reps`}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderGuideCard(guide, done, key) {
  return `
    <div class="routine-guide-card" data-guide="${key}">
      <div class="flex items-center gap-3">
        <span style="font-size: 1.6rem">${guide.icon}</span>
        <div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #fff;">${guide.title}</div>
          <div class="text-muted" style="font-size: 0.72rem;">${guide.duration}</div>
        </div>
      </div>
      <span class="badge ${done ? 'badge-success' : ''}">${done ? 'Done' : 'Open Guide'}</span>
    </div>
  `;
}

function getRecommendation(routines, completionMap, profile) {
  const goal = profile?.goalFocus || 'posture';
  const ordered = [...routines];

  ordered.sort((a, b) => {
    const aDone = completionMap[a.id] ? 1 : 0;
    const bDone = completionMap[b.id] ? 1 : 0;
    return aDone - bDone;
  });

  const match = ordered.find((routine) => getRoutineFocus(routine.title) === goal) || ordered[0];
  const reasonMap = {
    posture: 'Chosen for alignment and posture carryover.',
    mobility: 'Chosen to improve range of motion and reduce tightness.',
    strength: 'Chosen to support strength work with better movement quality.'
  };

  return {
    id: match.id,
    title: match.title,
    reason: reasonMap[goal] || reasonMap.posture
  };
}

function getRoutineExercises(routine) {
  if (routine.sections?.length) {
    return routine.sections.flatMap(section => section.exercises || []);
  }
  return routine.exercises || [];
}

function estimateDurationMin(durationLabel = '') {
  const firstNum = Number((durationLabel.match(/\d+/) || [10])[0]);
  return firstNum || 10;
}

function getRoutineFocus(title = '') {
  const t = title.toLowerCase();
  if (t.includes('mobility') || t.includes('night')) return 'mobility';
  if (t.includes('full') || t.includes('reset') || t.includes('alignment')) return 'posture';
  return 'strength';
}

function escapeAttr(text) {
  return String(text).replace(/"/g, '&quot;');
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
