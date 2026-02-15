/* ========================================
   PhysicalAid — Dashboard Page
   ======================================== */

import { allRoutines, walkingProtocol, standingCheckpoint, nightMobility, quotes } from '../data.js';
import { getCompletedToday, getStreakData, isCompletedToday, getDailyLog } from '../storage.js';
import { navigate } from '../router.js';
import { renderHeatmapCard } from '../components/heatmap.js';

export function renderDashboard(container) {
  const streak = getStreakData();
  const completed = getCompletedToday();
  const dailyLog = getDailyLog();
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  // Count total routines available
  const totalRoutines = 6; // foot, hip, upper, walking, standing, mobility
  const completedCount = completed.items.length;
  const completionPct = Math.round((completedCount / totalRoutines) * 100);

  // Calculate weekly completion
  const now = new Date();
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    weekDays.push(d.toISOString().split('T')[0]);
  }
  const activeDays = weekDays.filter(d => dailyLog[d] && dailyLog[d] > 0).length;

  container.innerHTML = `
    <div class="page-hero animate-in">
      <h1 class="page-title">
        Good ${getTimeOfDay()}, <span class="gradient-text">Warrior</span> ⚡
      </h1>
      <p class="page-description">Your daily posture & alignment routine. Consistency beats intensity.</p>
    </div>

    <!-- Motivational Banner -->
    <div class="motive-banner animate-in">
      <div class="motive-quote">"${quote.text}"</div>
      <div class="motive-author">— ${quote.sub}</div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="glass-card stat-card no-hover animate-in">
        <div class="streak-display" style="justify-content: center">
          <span class="streak-fire">🔥</span>
          <div>
            <div class="streak-number">${streak.currentStreak}</div>
            <div class="streak-label">Day Streak</div>
          </div>
        </div>
      </div>
      <div class="glass-card stat-card no-hover animate-in">
        <div class="stat-value">${completedCount}/${totalRoutines}</div>
        <div class="stat-label">Done Today</div>
      </div>
      <div class="glass-card stat-card no-hover animate-in">
        <div class="stat-value">${streak.longestStreak}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="glass-card stat-card no-hover animate-in">
        <div class="stat-value">${activeDays}/7</div>
        <div class="stat-label">This Week</div>
      </div>
    </div>

    <!-- Compact Activity Heatmap -->
    ${renderHeatmapCard(dailyLog, 52)}

    <!-- Today's Progress Bar -->
    <div class="glass-card no-hover animate-in mb-6">
      <div class="flex items-center justify-between mb-3">
        <span class="section-title" style="font-size: var(--fs-sm)">Today's Progress</span>
        <span class="badge ${completionPct === 100 ? 'badge-success' : 'badge-accent'}">${completionPct}%</span>
      </div>
      <div class="player-progress-bar" style="height: 6px; border-radius: 3px;">
        <div class="player-progress-fill" style="width: ${completionPct}%; border-radius: 3px; height: 100%;"></div>
      </div>
    </div>

    <!-- Quick Launch: Daily Reset -->
    <div class="section-header animate-in">
      <div>
        <h2 class="section-title">🔄 Daily Reset</h2>
        <p class="section-subtitle">15–20 min • 3 sections</p>
      </div>
      <button class="btn btn-primary" id="btn-start-full-reset">▶ Start Full Reset</button>
    </div>

    <div class="grid-3 mb-8">
      ${allRoutines.map(routine => renderLaunchCard(routine)).join('')}
    </div>

    <!-- Quick Launch: Other Routines -->
    <div class="section-header animate-in">
      <h2 class="section-title">⚡ Quick Routines</h2>
    </div>
    <div class="grid-3 mb-6">
      ${renderLaunchCard(walkingProtocol, true)}
      ${renderLaunchCard(standingCheckpoint, true)}
      ${renderLaunchCard(nightMobility)}
    </div>
  `;

  // Event listeners
  container.querySelector('#btn-start-full-reset')?.addEventListener('click', () => {
    navigate('/player/daily-reset');
  });

  container.querySelectorAll('.launch-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.routineId;
      if (id === 'walking' || id === 'standing') {
        navigate('/guides/' + id);
      } else {
        navigate('/player/' + id);
      }
    });
  });
}

function renderLaunchCard(routine, isGuide = false) {
  const done = isCompletedToday(routine.id);
  return `
    <div class="glass-card launch-card ${routine.cardClass} animate-in" data-routine-id="${routine.id}">
      <div class="launch-card-header">
        <div class="launch-card-icon">${routine.icon}</div>
        <div>
          <div class="launch-card-title">${routine.title}</div>
          <div class="launch-card-meta">${routine.duration}</div>
        </div>
      </div>
      <div class="launch-card-status">
        ${done
      ? '<span class="badge badge-success">✓ Done</span>'
      : `<span class="badge">${isGuide ? 'Open Guide' : '▶ Start'}</span>`
    }
      </div>
    </div>
  `;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
