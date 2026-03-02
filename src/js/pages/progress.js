/* ========================================
   PhysicalAid — Progress Page
   ======================================== */

import { getStreakData, getDailyLog, getStrengthSessionsThisWeek, getActivityDetailsForDate, getToday, getStrengthLog } from '../storage.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function renderProgress(container) {
  const [streak, dailyLog, strengthSessions, strengthLog] = await Promise.all([
    getStreakData(),
    getDailyLog(),
    getStrengthSessionsThisWeek(),
    getStrengthLog()
  ]);

  const state = {
    monthCursor: startOfMonth(new Date()),
    selectedDate: getToday(),
    dailyLog,
    strengthLog
  };

  const monthlyDates = getDatesForMonthGrid(state.monthCursor);
  const monthActiveDays = monthlyDates.filter(d => state.dailyLog[toDateKey(d)] > 0).length;
  const strengthPr = computeStrengthPR(strengthLog);

  container.innerHTML = `
    <div class="mb-8 animate-in">
      <h1 class="display-heading">Progress</h1>
      <p class="text-muted" style="font-size: var(--fs-md)">Track each day, not just streaks.</p>
    </div>

    <div class="stat-strip animate-in">
      <div class="stat-unit">
        <div class="stat-unit-label">Current Streak</div>
        <div class="stat-unit-value" style="color: var(--text-accent)">🔥 ${streak.currentStreak} Days</div>
      </div>
      <div class="stat-unit">
        <div class="stat-unit-label">Longest Streak</div>
        <div class="stat-unit-value">${streak.longestStreak}</div>
      </div>
      <div class="stat-unit">
        <div class="stat-unit-label">Strength This Week</div>
        <div class="stat-unit-value">${strengthSessions.length}/4</div>
      </div>
      <div class="stat-unit">
        <div class="stat-unit-label">Active Days (Month)</div>
        <div class="stat-unit-value">${monthActiveDays}</div>
      </div>
    </div>

    <div class="animate-in mb-8" style="padding: var(--sp-5); border-radius: 20px; border: 1px solid var(--border-glass); background: var(--bg-card);">
      <div class="flex items-center justify-between mb-4">
        <h2 class="flow-label" style="margin: 0;">Daily Calendar</h2>
        <div style="display: flex; gap: var(--sp-2);">
          <button id="btn-prev-month" class="btn btn-secondary" style="padding: 0.35rem 0.7rem;">←</button>
          <button id="btn-next-month" class="btn btn-secondary" style="padding: 0.35rem 0.7rem;">→</button>
        </div>
      </div>
      <div id="progress-month-title" style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: var(--sp-3);"></div>
      <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; margin-bottom: 6px;">
        ${WEEKDAYS.map(d => `<div style="font-size: 0.68rem; color: var(--text-muted); text-align: center;">${d}</div>`).join('')}
      </div>
      <div id="progress-calendar-grid"></div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: var(--sp-3); font-size: 0.7rem; color: var(--text-muted);">
        <span>Tap any day to inspect details</span>
        <span id="progress-day-summary"></span>
      </div>
    </div>

    <div id="progress-day-detail" class="animate-in mb-8"></div>

    <div class="animate-in" style="padding: var(--sp-5); border-radius: 20px; border: 1px solid var(--border-glass); background: var(--bg-card);">
      <h2 class="flow-label mb-4" style="margin-bottom: var(--sp-4);">Strength Snapshot</h2>
      <div class="flex items-center justify-between">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Heaviest logged set</div>
          <div style="font-size: 1rem; font-weight: 700; color: #fff; margin-top: 2px;">${strengthPr ? `${strengthPr.exercise} — ${strengthPr.weight}kg × ${strengthPr.reps}` : 'No strength data yet'}</div>
        </div>
        <button id="btn-jump-today" class="btn btn-secondary" style="padding: 0.45rem 0.8rem;">Jump to Today</button>
      </div>
    </div>
  `;

  const calendarGrid = container.querySelector('#progress-calendar-grid');
  const monthTitle = container.querySelector('#progress-month-title');
  const detailEl = container.querySelector('#progress-day-detail');
  const daySummary = container.querySelector('#progress-day-summary');

  const renderCalendar = () => {
    const dates = getDatesForMonthGrid(state.monthCursor);
    const monthLabel = state.monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthTitle.textContent = monthLabel;

    calendarGrid.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px;">
        ${dates.map((dateObj) => renderCalendarCell(dateObj, state)).join('')}
      </div>
    `;

    const monthDays = dates.filter(d => d.getMonth() === state.monthCursor.getMonth());
    const active = monthDays.filter(d => state.dailyLog[toDateKey(d)] > 0).length;
    daySummary.textContent = `${active}/${monthDays.length} active days`;

    calendarGrid.querySelectorAll('[data-date]').forEach(cell => {
      cell.addEventListener('click', async () => {
        state.selectedDate = cell.dataset.date;
        renderCalendar();
        await renderDayDetail(detailEl, state.selectedDate);
      });
    });
  };

  container.querySelector('#btn-prev-month')?.addEventListener('click', async () => {
    state.monthCursor = addMonths(state.monthCursor, -1);
    renderCalendar();
    await renderDayDetail(detailEl, state.selectedDate);
  });

  container.querySelector('#btn-next-month')?.addEventListener('click', async () => {
    state.monthCursor = addMonths(state.monthCursor, 1);
    renderCalendar();
    await renderDayDetail(detailEl, state.selectedDate);
  });

  container.querySelector('#btn-jump-today')?.addEventListener('click', async () => {
    state.monthCursor = startOfMonth(new Date());
    state.selectedDate = getToday();
    renderCalendar();
    await renderDayDetail(detailEl, state.selectedDate);
  });

  renderCalendar();
  await renderDayDetail(detailEl, state.selectedDate);
}

async function renderDayDetail(target, dateKey) {
  const detail = await getActivityDetailsForDate(dateKey);
  const isToday = dateKey === getToday();
  const routineItems = detail.routineItems || [];
  const strengthExercises = Object.entries(detail.strengthEntry?.exercises || {});

  target.innerHTML = `
    <div style="padding: var(--sp-5); border-radius: 20px; border: 1px solid var(--border-glass); background: var(--bg-card);">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 style="font-size: 1rem; margin: 0; color: #fff;">${formatDateLabel(dateKey)} ${isToday ? '• Today' : ''}</h2>
          <div class="text-muted" style="font-size: 0.72rem; margin-top: 3px;">
            ${detail.totalRoutines} completion logs · ${detail.totalExercises} total routine exercises
          </div>
        </div>
        <div class="badge ${detail.totalRoutines > 0 ? 'badge-success' : ''}">
          ${detail.totalRoutines > 0 ? 'Active Day' : 'No Activity'}
        </div>
      </div>

      <div style="display: grid; gap: var(--sp-4);">
        <div>
          <div class="flow-label mb-2" style="margin-bottom: 0.45rem;">Routine Completions</div>
          ${routineItems.length === 0 ? '<div class="text-muted" style="font-size: 0.78rem;">No routines logged for this date.</div>' : `
            <div style="display: grid; gap: 6px;">
              ${routineItems.map(item => `
                <div class="flex items-center justify-between" style="padding: 0.5rem 0.65rem; border-radius: 10px; border: 1px solid var(--border-glass);">
                  <span style="font-size: 0.78rem; color: #fff; font-weight: 600;">${formatRoutineName(item.id)}</span>
                  <span class="text-muted" style="font-size: 0.7rem;">${item.exerciseCount || 0} exercises</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div>
          <div class="flow-label mb-2" style="margin-bottom: 0.45rem;">Strength Log</div>
          ${strengthExercises.length === 0 ? '<div class="text-muted" style="font-size: 0.78rem;">No strength entries for this date.</div>' : `
            <div style="display: grid; gap: 6px;">
              ${strengthExercises.map(([id, setData]) => `
                <div class="flex items-center justify-between" style="padding: 0.5rem 0.65rem; border-radius: 10px; border: 1px solid var(--border-glass);">
                  <span style="font-size: 0.78rem; color: #fff; font-weight: 600;">${formatRoutineName(id)}</span>
                  <span class="text-muted" style="font-size: 0.72rem;">${setData.weight || 0}kg × ${setData.reps || 0} reps</span>
                </div>
              `).join('')}
            </div>
          `}
          ${strengthExercises.length > 0 ? `
            <div class="text-muted" style="font-size: 0.72rem; margin-top: 0.55rem;">
              Total strength volume: ${detail.totalStrengthVolume} kg·reps
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderCalendarCell(dateObj, state) {
  const dateKey = toDateKey(dateObj);
  const inCurrentMonth = dateObj.getMonth() === state.monthCursor.getMonth();
  const count = state.dailyLog[dateKey] || 0;
  const selected = dateKey === state.selectedDate;
  const isToday = dateKey === getToday();

  let bg = 'transparent';
  if (count >= 5) bg = 'rgba(16, 185, 129, 0.45)';
  else if (count >= 3) bg = 'rgba(16, 185, 129, 0.32)';
  else if (count >= 1) bg = 'rgba(16, 185, 129, 0.18)';

  let border = '1px solid var(--border-glass)';
  if (selected) border = '1px solid var(--accent-primary)';
  else if (isToday) border = '1px solid rgba(129, 140, 248, 0.5)';

  return `
    <button
      data-date="${dateKey}"
      style="
        width: 100%;
        aspect-ratio: 1/1;
        border-radius: 10px;
        border: ${border};
        background: ${bg};
        color: ${inCurrentMonth ? '#fff' : 'rgba(255,255,255,0.35)'};
        font-size: 0.78rem;
        font-weight: ${selected || isToday ? 700 : 500};
        position: relative;
      "
      title="${dateKey}: ${count} activities"
    >
      ${dateObj.getDate()}
      ${count > 0 ? '<span style="position:absolute; bottom:4px; right:5px; width:5px; height:5px; border-radius:999px; background:#34d399;"></span>' : ''}
    </button>
  `;
}

function computeStrengthPR(strengthLog) {
  let best = null;
  for (const day of strengthLog) {
    const exercises = Object.entries(day.exercises || {});
    for (const [id, setData] of exercises) {
      const weight = Number(setData?.weight || 0);
      const reps = Number(setData?.reps || 0);
      if (!best || weight > best.weight) {
        best = { exercise: formatRoutineName(id), weight, reps };
      }
    }
  }
  return best;
}

function formatRoutineName(id) {
  return id
    .replace(/-session$/, '')
    .split('-')
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatDateLabel(dateKey) {
  const dateObj = parseDateKey(dateKey);
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, diff) {
  return new Date(date.getFullYear(), date.getMonth() + diff, 1);
}

function toDateKey(dateObj) {
  const d = String(dateObj.getDate()).padStart(2, '0');
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const y = dateObj.getFullYear();
  return `${y}-${m}-${d}`;
}

function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function getDatesForMonthGrid(monthDate) {
  const first = startOfMonth(monthDate);
  const firstWeekday = (first.getDay() + 6) % 7; // Mon=0
  const start = new Date(first);
  start.setDate(first.getDate() - firstWeekday);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}
