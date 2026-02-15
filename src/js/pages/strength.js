/* ========================================
   PhysicalAid — Gym Schedule & Strength Page
   ======================================== */

import { gymPlan } from '../data.js';
import { getStrengthLog, saveStrengthEntry, getToday } from '../storage.js';

export async function renderStrength(container) {
  const log = await getStrengthLog();
  const today = getToday();
  const todayEntry = log.find(e => e.date === today);

  // Figure out what day of the week it is
  const now = new Date();
  const dayIndex = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const gymDayMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 0: 5, 6: 5 };
  const todayGymDay = gymDayMap[dayIndex];

  container.innerHTML = `
    <div class="mb-10 animate-in">
      <h1 class="display-heading">Gym Flow</h1>
      <p class="text-muted" style="font-size: var(--fs-md)">${gymPlan.frequency} — ${gymPlan.note}</p>
    </div>

    <!-- Week Overview Tabs (Subtle) -->
    <div class="flex gap-2 mb-10 animate-in overflow-x-auto pb-2" style="scrollbar-width: none;">
      ${gymPlan.days.map((d, i) => {
    const dayDate = getGymDayDate(i);
    const isDone = log.some(e => e.date === dayDate);
    const isToday = i === todayGymDay;
    let style = `padding: 0.5rem 1rem; border-radius: 12px; font-weight: 600; font-size: 0.8rem; border: 1px solid var(--border-glass); transition: all 0.3s; white-space: nowrap;`;
    if (isToday) style += `background: var(--accent-primary); color: white; border-color: var(--accent-primary);`;
    else if (isDone) style += `opacity: 0.6;`;

    return `<button class="schedule-tab" data-gym-day="${i}" style="${style}">
          ${d.emoji} ${d.dayShort}${isDone ? ' ✓' : ''}
        </button>`;
  }).join('')}
    </div>

    <!-- Session Flow (Zigzag) -->
    <div class="zigzag-container animate-in">
      ${gymPlan.days.map((d, i) => renderFlowDay(d, i, i === todayGymDay, log, todayEntry)).join('')}
    </div>

    <!-- Specific Tips (Non-Boxy) -->
    <div class="mt-12 mb-12 animate-in p-6" style="background: rgba(255,255,255,0.02); border-radius: 24px; border: 1px solid var(--border-glass);">
      <h3 class="flow-label mb-6">Specific Cues</h3>
      <div class="flex flex-direction-column gap-5">
        ${gymPlan.specificTips.map(tip => `
          <div class="flex items-start gap-4">
            <div style="color: var(--color-warning); font-weight: 800; font-size: 1.2rem; line-height: 1;">!</div>
            <div style="flex: 1">
              <div style="color: #fff; font-weight: 700; font-size: 0.9rem; margin-bottom: 2px;">${tip.label}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${tip.tip}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Recent History -->
    <div class="animate-in pb-12">
      <h3 class="flow-label mb-6">Past Sessions</h3>
      <div style="margin-top: var(--sp-4)">
        ${log.length === 0
      ? '<p class="text-muted">No sessions logged yet. Start today!</p>'
      : renderHistory(log)
    }
      </div>
    </div>
  `;

  // Tab switching: scroll to day
  container.querySelectorAll('.schedule-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const dayIdx = tab.dataset.gymDay;
      const el = container.querySelector(`#gym-day-${dayIdx}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Save buttons
  container.querySelectorAll('.btn-save-day').forEach(btn => {
    btn.addEventListener('click', async () => {
      const dayKey = btn.dataset.dayKey;
      const exercises = {};
      container.querySelectorAll(`.log-input[data-day="${dayKey}"]`).forEach(input => {
        const exId = input.dataset.exercise;
        const field = input.dataset.field;
        if (!exercises[exId]) exercises[exId] = {};
        exercises[exId][field] = parseInt(input.value) || 0;
      });

      const currentEntry = todayEntry?.exercises || {};
      const merged = { ...currentEntry };
      Object.entries(exercises).forEach(([exId, data]) => {
        merged[exId] = data;
      });

      await saveStrengthEntry(merged);

      btn.textContent = '✓ Saved';
      setTimeout(() => btn.textContent = 'Save Session', 2000);
    });
  });
}

function renderFlowDay(day, index, isToday, log, todayEntry) {
  const dayDate = getGymDayDate(index);
  const dayLog = log.find(e => e.date === dayDate);
  const isDone = !!dayLog;

  // Map each day focus to a representative hero image
  const heroImages = {
    'Upper Push': '/images/exercises/bench_press.png',
    'Lower Body': '/images/exercises/squats.png',
    'Rest / Posture Work': '/images/exercises/thoracic_extension.png',
    'Upper Pull': '/images/exercises/pullups.png',
    'Rest': '/images/exercises/wall_angel.png',
  };
  // For Friday's second Lower Body, use deadlifts
  const heroImage = index === 4 ? '/images/exercises/deadlifts.png' : (heroImages[day.focus] || '/images/exercises/wall_angel.png');

  return `
    <div class="zigzag-item ${isToday ? 'active' : ''}" id="gym-day-${index}">
      <div class="zigzag-marker"></div>
      
      <div class="zigzag-content">
        <div class="flex flex-direction-column gap-2 mb-4">
          <div class="flow-label" style="font-size: 0.7rem;">${day.day} ${isToday ? '• Today' : ''} ${isDone ? '• Complete' : ''}</div>
          <h2 style="font-size: 1.5rem; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
            ${day.focus}
          </h2>
        </div>

        ${day.isRest ? `
          <div style="background: var(--bg-card); padding: var(--sp-6); border-radius: 24px; border: 1px solid var(--border-glass);">
             <p class="text-muted" style="font-size: 0.9rem; margin: 0;">${day.note || 'Recovery day'}</p>
          </div>
        ` : `
          <div style="background: var(--bg-card); padding: var(--sp-6); border-radius: 24px; border: 1px solid var(--border-glass);">
            <div class="flex flex-direction-column gap-5">
              ${day.exercises.map((ex, i) => {
    const saved = todayEntry?.exercises?.[ex.id] || {};
    return `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span style="font-size: 1.2rem">${ex.emoji}</span>
                    <div style="font-weight: 700; font-size: 0.95rem; color: #fff">${ex.name}</div>
                  </div>
                  <div class="text-muted" style="font-size: 0.75rem; white-space: nowrap;">3 × 8–12</div>
                </div>
                `;
  }).join('')}
            </div>

            ${isToday ? `
              <div class="mt-8 pt-6" style="border-top: 1px solid var(--border-glass)">
                <button class="btn-start-glass btn-save-day w-full" data-day-key="${day.focus}">
                  Save Session
                </button>
              </div>
            ` : ''}
          </div>
        `}
      </div>

      <div class="zigzag-image">
        <img src="${heroImage}" alt="${day.focus}">
      </div>
    </div>
  `;
}

function renderHistory(log) {
  const recent = log.slice(-3).reverse();
  return `
    <div class="flex flex-direction-column gap-4">
      ${recent.map(entry => `
        <div class="flex flex-direction-column gap-1" style="padding: var(--sp-4); border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border-glass);">
          <div class="flex items-center justify-between">
            <span style="font-weight: 700; font-size: 0.8rem;">${entry.date}</span>
          </div>
          <div class="flex gap-3 flex-wrap">
            ${Object.entries(entry.exercises || {}).map(([id, data]) => `
              <span class="text-muted" style="font-size: 0.65rem">
                ${id.split('-').map(w => w[0]).join('').toUpperCase()}: ${data.weight || 0}kg × ${data.reps || 0}r
              </span>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function getGymDayDate(gymDayIndex) {
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
    const target = new Date(monday);
    target.setDate(monday.getDate() + 5);
    return target.toISOString().split('T')[0];
  }
}
