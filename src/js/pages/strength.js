/* ========================================
   PhysicalAid — Gym Schedule & Strength Page
   ======================================== */

import { gymPlan } from '../data.js';
import { getStrengthLog, saveStrengthEntry, getToday, getUserProfile } from '../storage.js';

function buildExerciseImageSearchUrl(exerciseName) {
  const q = encodeURIComponent(`${exerciseName} exercise form`);
  return `https://www.google.com/search?tbm=isch&q=${q}`;
}

export async function renderStrength(container) {
  const [log, profile] = await Promise.all([
    getStrengthLog(),
    getUserProfile()
  ]);
  const today = getToday();
  const todayEntry = log.find(e => e.date === today);

  // Monday-indexed map: Mon=0 ... Sun=6
  const now = new Date();
  const todayGymDay = (now.getDay() + 6) % 7;

  container.innerHTML = `
    <div class="mb-10 animate-in">
      <h1 class="display-heading">Gym Flow</h1>
      <p class="text-muted" style="font-size: var(--fs-md)">${gymPlan.frequency} — ${gymPlan.note}</p>
    </div>

    <!-- Week Overview Tabs (Subtle) -->
    <div class="strength-week-tabs mb-10 animate-in">
      ${gymPlan.days.map((d, i) => {
    const dayDate = getGymDayDate(i);
    const isDone = log.some(e => e.date === dayDate);
    const isToday = i === todayGymDay;
    let style = `padding: 0.5rem 0.65rem; border-radius: 12px; font-weight: 600; font-size: 0.78rem; border: 1px solid var(--border-glass); transition: all 0.3s;`;
    if (isToday) style += `background: var(--accent-primary); color: white; border-color: var(--accent-primary);`;
    else if (isDone) style += `opacity: 0.6;`;

    return `<button class="schedule-tab" data-gym-day="${i}" style="${style}">
          ${d.emoji} ${d.dayShort}${isDone ? ' ✓' : ''}
        </button>`;
  }).join('')}
    </div>

    <!-- Session Flow (Zigzag) -->
    <div class="zigzag-container animate-in">
      ${gymPlan.days.map((d, i) => renderFlowDay(d, i, i === todayGymDay, log, todayEntry, profile)).join('')}
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
      const dayIndex = btn.dataset.dayIndex;
      const exercises = {};
      container.querySelectorAll(`.log-input[data-day-index="${dayIndex}"]`).forEach(input => {
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
      setTimeout(() => {
        btn.textContent = 'Save Session';
      }, 1200);

      // Re-render so history/completion state updates instantly.
      renderStrength(container);
    });
  });
}

function renderFlowDay(day, index, isToday, log, todayEntry, profile) {
  const dayDate = getGymDayDate(index);
  const dayLog = log.find(e => e.date === dayDate);
  const isDone = !!dayLog;
  const savedEntry = (isToday ? todayEntry : dayLog)?.exercises || {};

  // Map each day focus to a representative hero image
  const heroImages = {
    'Upper Push': '/images/exercises/bench_press.png',
    'Lower Body': '/images/exercises/squats.png',
    'Gap Day (Mobility focus)': '/images/exercises/thoracic_extension.png',
    'Upper Pull': '/images/exercises/pullups.png',
    'Rest': '/images/exercises/wall_angel.png'
  };
  // Friday lower-body visual uses deadlifts.
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
             ${isToday ? '<p class="text-muted" style="font-size: 0.78rem; margin-top: 0.75rem;">Tip: open Routines and run Night Mobility to complete your gap day.</p>' : ''}
          </div>
        ` : `
          <div style="background: var(--bg-card); padding: var(--sp-6); border-radius: 24px; border: 1px solid var(--border-glass);">
            <div class="flex flex-direction-column gap-5">
              ${day.exercises.map((ex) => {
    const saved = savedEntry[ex.id] || {};
    const suggested = getSuggestedStrengthTargets(ex, profile, log);
    const hasSavedData = (saved.weight || 0) > 0 || (saved.reps || 0) > 0;
    return `
                <div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span style="font-size: 1.2rem">${ex.emoji}</span>
                      <a
                        href="${buildExerciseImageSearchUrl(ex.name)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="font-weight: 700; font-size: 0.95rem; color: #fff; text-decoration: underline; text-underline-offset: 3px;"
                      >
                        ${ex.name}
                      </a>
                    </div>
                    ${isToday ? `
                      <div class="flex items-center gap-2">
                        <input
                          class="log-input"
                          data-day-index="${index}"
                          data-exercise="${ex.id}"
                          data-field="weight"
                          type="number"
                          min="0"
                          inputmode="numeric"
                          placeholder="kg"
                          value="${saved.weight || suggested.weight}"
                          aria-label="${ex.name} weight in kilograms"
                          title="Suggested: ${suggested.weight}kg"
                        />
                        <input
                          class="log-input"
                          data-day-index="${index}"
                          data-exercise="${ex.id}"
                          data-field="reps"
                          type="number"
                          min="0"
                          inputmode="numeric"
                          placeholder="reps"
                          value="${saved.reps || suggested.reps}"
                          aria-label="${ex.name} reps"
                          title="Suggested: ${suggested.reps} reps"
                        />
                      </div>
                    ` : `
                      <div class="text-muted" style="font-size: 0.75rem; white-space: nowrap;">
                        ${hasSavedData ? `${saved.weight || 0}kg × ${saved.reps || 0}r` : '3 × 8–12'}
                      </div>
                    `}
                  </div>
                  ${isToday ? `
                    <div class="text-muted" style="font-size: 0.68rem; margin-top: 0.35rem; padding-left: 2rem;">
                      Suggested: ${suggested.weight}kg × ${suggested.reps} reps · ${suggested.note}
                    </div>
                  ` : ''}
                </div>
                `;
  }).join('')}
            </div>

            ${isToday ? `
              <div class="mt-8 pt-6" style="border-top: 1px solid var(--border-glass)">
                <button class="btn-start-glass btn-save-day w-full" data-day-index="${index}">
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
  const recent = log.slice(0, 3);
  return `
    <div class="flex flex-direction-column gap-4">
      ${recent.map(entry => `
        ${renderHistoryCard(entry)}
      `).join('')}
    </div>
  `;
}

function renderHistoryCard(entry) {
  const exercises = Object.entries(entry.exercises || {});
  const totalVolume = exercises.reduce((sum, [, data]) => {
    const reps = Number(data?.reps || 0);
    const weight = Number(data?.weight || 0);
    return sum + (reps * weight);
  }, 0);

  const topLift = exercises.reduce((best, [id, data]) => {
    const weight = Number(data?.weight || 0);
    if (!best || weight > best.weight) return { id, weight, reps: Number(data?.reps || 0) };
    return best;
  }, null);

  return `
    <details style="padding: var(--sp-4); border-radius: 18px; background: var(--bg-card); border: 1px solid var(--border-glass);">
      <summary style="list-style: none; cursor: pointer;">
        <div class="flex items-center justify-between" style="gap: var(--sp-3);">
          <div>
            <div style="font-weight: 800; font-size: 0.9rem; color: #fff;">${entry.date}</div>
            <div class="text-muted" style="font-size: 0.72rem; margin-top: 2px;">
              ${exercises.length} exercises logged
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #fff;">Vol ${totalVolume} kg·reps</div>
            <div class="text-muted" style="font-size: 0.68rem; margin-top: 2px;">
              ${topLift ? `Top: ${formatExerciseId(topLift.id)} ${topLift.weight}kg × ${topLift.reps}` : 'No loads logged'}
            </div>
          </div>
        </div>
      </summary>
      <div class="mt-4" style="display: grid; gap: var(--sp-2);">
        ${exercises.map(([id, data]) => `
          <div class="flex items-center justify-between" style="padding: 0.45rem 0.65rem; border-radius: 10px; border: 1px solid var(--border-glass);">
            <span style="font-size: 0.75rem; color: #fff; font-weight: 600;">${formatExerciseId(id)}</span>
            <span class="text-muted" style="font-size: 0.72rem;">${data.weight || 0}kg × ${data.reps || 0} reps</span>
          </div>
        `).join('')}
      </div>
    </details>
  `;
}

function formatExerciseId(id) {
  return id
    .split('-')
    .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function getSuggestedStrengthTargets(exercise, profile, strengthLog = []) {
  const recentHistory = strengthLog
    .map((entry) => {
      const data = entry?.exercises?.[exercise.id] || {};
      return {
        weight: Number(data.weight || 0),
        reps: Number(data.reps || 0)
      };
    })
    .filter(item => item.weight > 0 && item.reps > 0)
    .slice(0, 3);

  if (recentHistory.length > 0) {
    const last = recentHistory[0];
    const avgReps = Math.round(recentHistory.reduce((sum, h) => sum + h.reps, 0) / recentHistory.length);
    const allHighReps = recentHistory.every((h) => h.reps >= 12);
    const allLowReps = recentHistory.every((h) => h.reps <= 8);

    let weight = Number(last.weight || 0);
    let reps = Number(last.reps || 10);
    let note = `Based on last ${recentHistory.length} session${recentHistory.length > 1 ? 's' : ''}`;

    if (allHighReps) {
      weight = roundToNearest(weight + 2.5, 2.5);
      reps = 10;
      note = 'Progressive overload: load increased by 2.5kg';
    } else if (allLowReps) {
      reps = Math.min(12, Math.max(reps + 1, 9));
      note = 'Keep load steady and build reps first';
    } else {
      reps = Math.min(12, Math.max(avgReps + 1, reps));
      note = 'Progressive overload: add 1 rep target';
    }

    return {
      weight: Math.max(5, weight),
      reps,
      note
    };
  }

  const bodyWeight = Number(profile?.weightKg) > 0 ? Number(profile.weightKg) : 65;
  const genderFactor = String(profile?.gender || '').toLowerCase() === 'female' ? 0.7 : 1;
  const expMap = { beginner: 0.75, intermediate: 1, advanced: 1.2 };
  const expFactor = expMap[profile?.experienceLevel] || 0.75;

  const id = exercise.id || '';
  let multiplier = 0.4;

  if (id.includes('deadlift')) multiplier = 0.85;
  else if (id.includes('squat') || id.includes('leg-press')) multiplier = 0.75;
  else if (id.includes('bench')) multiplier = 0.5;
  else if (id.includes('overhead-press')) multiplier = 0.35;
  else if (id.includes('row') || id.includes('pull')) multiplier = 0.45;
  else if (id.includes('curl') || id.includes('tricep')) multiplier = 0.2;
  else if (id.includes('calf') || id.includes('lunge')) multiplier = 0.35;

  const suggestedWeight = roundToNearest(bodyWeight * multiplier * genderFactor * expFactor, 2.5);
  const reps = exercise.id.includes('deadlift') ? 8 : 10;

  return {
    weight: Math.max(5, suggestedWeight),
    reps,
    note: 'Profile-based baseline recommendation'
  };
}

function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

function getGymDayDate(gymDayIndex) {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun ... 6=Sat
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const target = new Date(monday);
  target.setDate(monday.getDate() + gymDayIndex);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
