/* ========================================
   PhysicalAid — Gym Schedule & Strength Page
   ======================================== */

import { gymPlan } from '../data.js';
import { getStrengthLog, saveStrengthEntry, getToday } from '../storage.js';

export function renderStrength(container) {
  const log = getStrengthLog();
  const today = getToday();
  const todayEntry = log.find(e => e.date === today);

  // Figure out what day of the week it is
  const now = new Date();
  const dayIndex = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  // Map JS day to our gym plan days: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat-Sun=5
  const gymDayMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 0: 5, 6: 5 };
  const todayGymDay = gymDayMap[dayIndex];

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Gym Schedule</span> 🏆</h1>
      <p class="page-description">${gymPlan.frequency} — ${gymPlan.note}</p>
    </div>

    <!-- Week Overview Tabs -->
    <div class="strength-schedule mb-6 animate-in">
      ${gymPlan.days.map((d, i) => {
    const dayDate = getGymDayDate(i);
    const isDone = log.some(e => e.date === dayDate);
    const isToday = i === todayGymDay;
    let cls = '';
    if (isDone) cls = 'completed';
    else if (isToday) cls = 'active';
    return `<div class="schedule-day ${cls}" data-gym-day="${i}" style="cursor:pointer">
          ${d.emoji} ${d.dayShort}${isDone ? ' ✓' : isToday ? ' ←' : ''}
        </div>`;
  }).join('')}
    </div>

    <!-- Day Cards -->
    <div id="gym-days-container">
      ${gymPlan.days.map((d, i) => renderDayCard(d, i, i === todayGymDay, log, todayEntry)).join('')}
    </div>

    <!-- Specific Tips -->
    <div class="glass-card no-hover mb-6 animate-in">
      <h3 class="section-title mb-4" style="font-size: var(--fs-md)">🎯 For Your Specific Issues</h3>
      <div class="checklist">
        ${gymPlan.specificTips.map(tip => `
          <div class="checklist-item">
            <div class="check-icon" style="border-color: var(--color-warning); font-size: 0.6rem;">!</div>
            <div>
              <span style="font-weight: var(--fw-semibold); color: var(--color-warning);">${tip.label}:</span>
              <span class="text-secondary" style="font-size: var(--fs-sm)"> ${tip.tip}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Recent History -->
    <div class="glass-card no-hover animate-in">
      <h3 class="section-title mb-4" style="font-size: var(--fs-md)">📊 Recent Sessions</h3>
      ${log.length === 0
      ? '<p class="text-muted">No sessions logged yet. Start today!</p>'
      : renderHistory(log)
    }
    </div>
  `;

  // Tab switching: scroll to day
  container.querySelectorAll('.schedule-day[data-gym-day]').forEach(tab => {
    tab.addEventListener('click', () => {
      const dayIdx = tab.dataset.gymDay;
      const card = container.querySelector(`#gym-day-${dayIdx}`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Save buttons
  container.querySelectorAll('.btn-save-day').forEach(btn => {
    btn.addEventListener('click', () => {
      const dayKey = btn.dataset.dayKey;
      const exercises = {};
      container.querySelectorAll(`.log-input[data-day="${dayKey}"]`).forEach(input => {
        const exId = input.dataset.exercise;
        const field = input.dataset.field;
        if (!exercises[exId]) exercises[exId] = {};
        exercises[exId][field] = parseInt(input.value) || 0;
      });

      // Merge with today's entry
      const currentEntry = todayEntry?.exercises || {};
      const merged = { ...currentEntry };
      // Store under the day focus name as prefix
      Object.entries(exercises).forEach(([exId, data]) => {
        merged[exId] = data;
      });

      saveStrengthEntry(merged);

      // Visual feedback
      btn.textContent = '✓ Saved!';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-success');
      setTimeout(() => {
        btn.textContent = '💾 Save';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-primary');
      }, 2000);
    });
  });
}

function renderDayCard(day, index, isToday, log, todayEntry) {
  const dayDate = getGymDayDate(index);
  const dayLog = log.find(e => e.date === dayDate);
  const isDone = !!dayLog;

  if (day.isRest) {
    return `
      <div class="glass-card no-hover mb-4 animate-in" id="gym-day-${index}" style="opacity: 0.7;">
        <div class="flex items-center gap-4">
          <span style="font-size: var(--fs-2xl)">${day.emoji}</span>
          <div>
            <div style="font-size: var(--fs-md); font-weight: var(--fw-semibold);">${day.day} — ${day.focus}</div>
            <div class="text-muted" style="font-size: var(--fs-sm)">${day.note || 'Recovery day'}</div>
          </div>
          ${isToday ? '<span class="badge badge-accent" style="margin-left: auto;">Today</span>' : ''}
        </div>
      </div>
    `;
  }

  return `
    <div class="glass-card no-hover mb-4 animate-in ${isToday ? '' : ''}" id="gym-day-${index}" 
         style="${isToday ? 'border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);' : ''}">
      
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <span style="font-size: var(--fs-2xl)">${day.emoji}</span>
          <div>
            <div style="font-size: var(--fs-md); font-weight: var(--fw-bold);">${day.day}</div>
            <div class="text-accent" style="font-size: var(--fs-sm)">${day.focus}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          ${isToday ? '<span class="badge badge-accent">Today</span>' : ''}
          ${isDone ? '<span class="badge badge-success">✓ Logged</span>' : ''}
        </div>
      </div>

      <!-- Exercise Grid -->
      <div class="exercise-grid mb-4">
        ${day.exercises.map((ex, i) => `
          <div class="exercise-card">
            <div class="exercise-card-top">
              <span class="exercise-card-emoji">${ex.emoji}</span>
              <span class="exercise-card-num">${i + 1}</span>
            </div>
            <div class="exercise-card-name">${ex.name}</div>
            <div class="exercise-card-detail">3 × 8–12 reps</div>
          </div>
        `).join('')}
      </div>

      <!-- Logging Form (only show for today or expand on click) -->
      ${isToday ? `
        <div style="border-top: 1px solid var(--border-glass); padding-top: var(--sp-4);">
          <div class="flex items-center justify-between mb-4">
            <span style="font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text-secondary);">Log Today's Progress</span>
            <button class="btn btn-primary btn-save-day" data-day-key="${day.focus}">💾 Save</button>
          </div>
          <table class="log-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Weight (kg)</th>
                <th>Reps</th>
              </tr>
            </thead>
            <tbody>
              ${day.exercises.map(ex => {
    const saved = todayEntry?.exercises?.[ex.id] || {};
    return `
                  <tr>
                    <td>${ex.emoji} ${ex.name}</td>
                    <td><input type="number" class="log-input" data-day="${day.focus}" data-exercise="${ex.id}" data-field="weight" value="${saved.weight || ''}" placeholder="0"></td>
                    <td><input type="number" class="log-input" data-day="${day.focus}" data-exercise="${ex.id}" data-field="reps" value="${saved.reps || ''}" placeholder="0"></td>
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

function renderHistory(log) {
  const recent = log.slice(-5).reverse();
  return `
    <div class="exercise-list">
      ${recent.map(entry => `
        <div class="exercise-item" style="flex-direction: column; align-items: flex-start;">
          <div class="flex items-center gap-4 w-full">
            <span class="badge">${entry.date}</span>
          </div>
          <div class="flex gap-4" style="flex-wrap: wrap; margin-top: var(--sp-2);">
            ${Object.entries(entry.exercises || {}).map(([id, data]) => `
              <span class="text-muted" style="font-size: var(--fs-xs)">
                ${id}: ${data.weight || 0}kg × ${data.reps || 0}r
              </span>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getGymDayDate(gymDayIndex) {
  // gymDayIndex: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat-Sun
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  if (gymDayIndex <= 4) {
    const target = new Date(monday);
    target.setDate(monday.getDate() + gymDayIndex);
    return target.toISOString().split('T')[0];
  } else {
    // Saturday
    const target = new Date(monday);
    target.setDate(monday.getDate() + 5);
    return target.toISOString().split('T')[0];
  }
}
