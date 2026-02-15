/* ========================================
   PhysicalAid — Progress Page
   ======================================== */

import { journeyTimeline } from '../data.js';
import { getStreakData, getDailyLog, getStrengthSessionsThisWeek } from '../storage.js';
import { renderHeatmapCard } from '../components/heatmap.js';

export function renderProgress(container) {
  const streak = getStreakData();
  const dailyLog = getDailyLog();
  const strengthSessions = getStrengthSessionsThisWeek();

  // Determine user's journey phase
  const daysSinceStart = streak.longestStreak || streak.currentStreak || 0;
  let currentPhase = 0;
  if (daysSinceStart >= 84) currentPhase = 3;     // 3+ months
  else if (daysSinceStart >= 42) currentPhase = 2; // 6+ weeks
  else if (daysSinceStart >= 21) currentPhase = 1; // 3-4 weeks

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title"><span class="gradient-text">Progress</span> 📈</h1>
      <p class="page-description">Track your journey. Remember: 90 days of discipline is all you need.</p>
    </div>

    <!-- Streak Stats -->
    <div class="stats-row mb-8">
      <div class="glass-card stat-card no-hover animate-in">
        <div class="streak-display" style="justify-content: center">
          <span class="streak-fire">🔥</span>
          <div>
            <div class="streak-number">${streak.currentStreak}</div>
            <div class="streak-label">Current Streak</div>
          </div>
        </div>
      </div>
      <div class="glass-card stat-card no-hover animate-in">
        <div class="stat-value">${streak.longestStreak}</div>
        <div class="stat-label">Longest Streak</div>
      </div>
      <div class="glass-card stat-card no-hover animate-in">
        <div class="stat-value">${Object.keys(dailyLog).length}</div>
        <div class="stat-label">Total Active Days</div>
      </div>
      <div class="glass-card stat-card no-hover animate-in">
        <div class="stat-value">${strengthSessions.length}/3</div>
        <div class="stat-label">Strength This Week</div>
      </div>
    </div>

    <!-- Journey Timeline -->
    <div class="glass-card no-hover mb-8 animate-in">
      <h2 class="section-title mb-6" style="font-size: var(--fs-lg)">🗺️ Your Journey</h2>
      <div class="timeline">
        ${journeyTimeline.map((phase, i) => `
          <div class="timeline-item">
            <div class="timeline-dot ${i < currentPhase ? 'completed' : i === currentPhase ? 'active' : ''}"></div>
            <div class="timeline-title">
              ${phase.icon} Week ${phase.week} — ${phase.title}
              ${i === currentPhase ? '<span class="badge badge-accent" style="margin-left: var(--sp-2)">You are here</span>' : ''}
              ${i < currentPhase ? '<span class="badge badge-success" style="margin-left: var(--sp-2)">✓</span>' : ''}
            </div>
            <div class="timeline-desc">${phase.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Calendar Heatmap -->
    ${renderHeatmapCard(dailyLog, 52)}

    <!-- Warning Signs -->
    <div class="warning-panel animate-in">
      <div class="warning-panel-title">⚠️ When to See a Professional</div>
      <ul class="warning-list">
        <li>• Pain during any exercise</li>
        <li>• One shoulder noticeably lower than the other</li>
        <li>• Chronic knee pain</li>
        <li>• Numbness or tingling</li>
      </ul>
      <p class="mt-4" style="font-size: var(--fs-sm); color: var(--text-secondary)">
        Otherwise, this is conditioning, not pathology. Keep going.
      </p>
    </div>
  `;
}
