/* ========================================
   PhysicalAid — Progress Page
   ======================================== */

import { journeyTimeline } from '../data.js';
import { getStreakData, getDailyLog, getStrengthSessionsThisWeek } from '../storage.js';
import { renderHeatmapCard } from '../components/heatmap.js';

export async function renderProgress(container) {
  const streak = await getStreakData();
  const dailyLog = await getDailyLog();
  const strengthSessions = await getStrengthSessionsThisWeek();

  // Determine user's journey phase
  const daysSinceStart = streak.longestStreak || streak.currentStreak || 0;
  let currentPhase = 0;
  if (daysSinceStart >= 84) currentPhase = 3;     // 3+ months
  else if (daysSinceStart >= 42) currentPhase = 2; // 6+ weeks
  else if (daysSinceStart >= 21) currentPhase = 1; // 3-4 weeks

  container.innerHTML = `
    <div class="mb-10 animate-in">
      <h1 class="display-heading">Progress</h1>
      <p class="text-muted" style="font-size: var(--fs-md)">Consistency is the only metric that matters.</p>
    </div>

    <!-- Minimalist Stat Strip -->
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
        <div class="stat-unit-label">Total Active</div>
        <div class="stat-unit-value">${Object.keys(dailyLog).length}</div>
      </div>
      <div class="stat-unit">
        <div class="stat-unit-label">Strength/Wk</div>
        <div class="stat-unit-value">${strengthSessions.length}/3</div>
      </div>
    </div>

    <!-- Floating Journey Path -->
    <div class="mb-12 animate-in">
      <h2 class="flow-label mb-8">Evolution Path</h2>
      <div class="journey-path">
        ${journeyTimeline.map((phase, i) => {
    const isActive = i === currentPhase;
    const isCompleted = i < currentPhase;
    let cls = '';
    if (isActive) cls = 'active';
    else if (isCompleted) cls = 'completed';

    return `
          <div class="journey-node ${cls}">
            <div class="journey-marker">${isCompleted ? '✓' : phase.icon}</div>
            <div style="flex: 1">
              <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-accent); text-transform: uppercase; margin-bottom: 2px;">
                Week ${phase.week} ${isActive ? '• Current' : ''}
              </div>
              <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 4px;">${phase.title}</h3>
              <p class="text-muted" style="font-size: 0.85rem">${phase.desc}</p>
            </div>
          </div>
        `;
  }).join('')}
      </div>
    </div>

    <!-- Calendar Heatmap (Subtle integration) -->
    <div class="mb-12 animate-in">
      <h2 class="flow-label mb-6">Activity Rhythm</h2>
      ${renderHeatmapCard(dailyLog, 52)}
    </div>

    <!-- Warning Signs (Non-Boxy) -->
    <div class="mt-12 mb-12 animate-in">
      <h3 class="flow-label mb-6" style="color: var(--color-warning)">Professional Guidance</h3>
      <div class="flex flex-direction-column gap-3">
        <div class="text-muted" style="font-size: 0.85rem">Consult a specialist if you experience:</div>
        <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px;">
          <li style="font-size: 0.85rem; display: flex; gap: 8px;"><span style="color: var(--color-warning)">•</span> Pain during movement</li>
          <li style="font-size: 0.85rem; display: flex; gap: 8px;"><span style="color: var(--color-warning)">•</span> Visible structural asymmetry</li>
          <li style="font-size: 0.85rem; display: flex; gap: 8px;"><span style="color: var(--color-warning)">•</span> Persistent joint discomfort</li>
          <li style="font-size: 0.85rem; display: flex; gap: 8px;"><span style="color: var(--color-warning)">•</span> Neurological symptoms (numbness)</li>
        </ul>
        <p class="mt-4" style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
          Discipline overcomes minor discomfort. Pathology requires a physician.
        </p>
      </div>
    </div>
  `;
}
