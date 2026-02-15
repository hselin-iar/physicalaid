/* ========================================
   PhysicalAid — Dashboard Page
   ======================================== */

import { allRoutines, walkingProtocol, standingCheckpoint, nightMobility, quotes } from '../data.js';
import { getCompletedToday, getStreakData, isCompletedToday, getDailyLog, getUserProfile } from '../storage.js';
import { navigate } from '../router.js';
import { renderHeatmapCard, renderMinimalHeatmap } from '../components/heatmap.js';
import { getCurrentUser, signOutUser } from '../firebase.js';


export async function renderDashboard(container) {
  const streak = await getStreakData();
  const completed = await getCompletedToday();
  const dailyLog = await getDailyLog();
  const profile = await getUserProfile();
  const user = getCurrentUser();
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
    <!-- Top Header (Breadcrumb + Profile) -->
    <div class="flex items-center justify-between mb-8 animate-in" style="position: relative; z-index: 100;">
      <div style="font-size: var(--fs-md); font-weight: 500; color: var(--text-muted);">Home</div>
      <div class="flex gap-4" style="position: relative;">
        <button class="btn-icon" id="dashboard-notify">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button class="profile-avatar-btn" id="dashboard-profile" title="Profile">
          <img src="${user?.photoURL || ''}" alt="" class="profile-avatar-img" referrerpolicy="no-referrer" />
        </button>

        <!-- Profile Dropdown -->
        <div class="profile-dropdown hidden" id="profile-dropdown">
          <div class="profile-dropdown-header">
            <img src="${user?.photoURL || ''}" alt="" class="profile-dropdown-avatar" referrerpolicy="no-referrer" />
            <div class="profile-dropdown-info">
              <div class="profile-dropdown-name">${user?.displayName || 'User'}</div>
              <div class="profile-dropdown-email">${user?.email || ''}</div>
            </div>
          </div>
          <div class="profile-dropdown-divider"></div>
          <div class="profile-dropdown-stats">
            <div class="profile-stat">
              <span class="profile-stat-value">${profile.totalSessions || 0}</span>
              <span class="profile-stat-label">Sessions</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat-value">${streak.currentStreak || 0}</span>
              <span class="profile-stat-label">Day Streak</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat-value">${streak.longestStreak || 0}</span>
              <span class="profile-stat-label">Best Streak</span>
            </div>
          </div>
          <div class="profile-dropdown-divider"></div>
          <div class="profile-dropdown-meta">
            <span>Member since ${profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Today'}</span>
          </div>
          <div class="profile-dropdown-divider"></div>
          <div class="profile-dropdown-actions">
            <button class="profile-dropdown-item" id="profile-goto-settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
            <button class="profile-dropdown-item profile-dropdown-signout" id="profile-signout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Dashboard Header: Greeting, Progress, Heatmap -->
    <div class="dashboard-top-row animate-in">
      <!-- Greeting Selection -->
      <div class="dashboard-greeting-col">
        <h1 class="user-greeting">
          <span>Good ${getTimeOfDay()},</span>
          ${user?.displayName?.split(' ')[0] || 'Warrior'}
        </h1>
      </div>

      <!-- Floating Gauge (Boutique) -->
      <div class="dashboard-gauge-col">
        <div class="floating-gauge">
          <svg width="180" height="120" viewBox="0 0 120 80">
            <!-- Background Arc -->
            <path d="M 20 60 A 40 40 0 1 1 100 60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8" stroke-linecap="round" />
            <!-- Progress Arc -->
            <path d="M 20 60 A 40 40 0 1 1 100 60" fill="none" stroke="url(#arc-gradient)" stroke-width="8" stroke-linecap="round"
                  stroke-dasharray="126" stroke-dashoffset="${126 - (126 * completionPct / 100)}" 
                  style="transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);" />
            <defs>
              <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#7c3aed" />
                <stop offset="100%" stop-color="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <div class="floating-gauge-label">
            <div class="floating-gauge-val">${completedCount}/6</div>
            <div class="floating-gauge-text">tasks</div>
          </div>
        </div>
      </div>

      <!-- Heatmap -->
      <div class="dashboard-heatmap-col">
        ${renderMinimalHeatmap(dailyLog, 24)}
      </div>
    </div>


    <!-- Section: Daily Reset -->
    <div class="mb-8 animate-in">
      <h2 class="section-heading">Daily Reset</h2>
      <p class="section-sub">High-quality alignment routine</p>
      
      <div class="grid-3">
        ${renderNewCard(allRoutines[0], '/images/exercises/foot-arch-foundation-realistic.png')}
        ${renderNewCard(allRoutines[1], '/images/exercises/hip-glute-control-realistic.png')}
        ${renderNewCard(allRoutines[2], '/images/exercises/upper-body-alignment-realistic.png')}
      </div>
    </div>

    <!-- Section: Quick Routines -->
    <div class="mb-8 animate-in">
      <h2 class="section-heading">Quick Routines</h2>
      <p class="section-sub">Specific protocols for mobility</p>

      <div class="grid-3">
        ${renderNewCard(walkingProtocol, '/images/exercises/walking-protocol-realistic.png', true)}
        ${renderNewCard(standingCheckpoint, '/images/exercises/standing-checkpoint-realistic.png', true)}
        ${renderNewCard(nightMobility, '/images/exercises/night-mobility-realistic.png')}
      </div>
    </div>
  `;

  // Shell Actions
  container.querySelector('#dashboard-notify')?.addEventListener('click', () => {
    alert('No new notifications for your Warrior spirit today!');
  });

  // Profile dropdown toggle
  const profileBtn = container.querySelector('#dashboard-profile');
  const dropdown = container.querySelector('#profile-dropdown');

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown?.contains(e.target) && !profileBtn?.contains(e.target)) {
      dropdown?.classList.add('hidden');
    }
  });

  // Settings link
  container.querySelector('#profile-goto-settings')?.addEventListener('click', () => {
    dropdown?.classList.add('hidden');
    navigate('/settings');
  });

  // Sign out
  container.querySelector('#profile-signout')?.addEventListener('click', async () => {
    dropdown?.classList.add('hidden');
    await signOutUser();
  });

  // Routine card event listeners

  container.querySelectorAll('.routine-card-new').forEach(card => {
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

function renderNewCard(routine, imagePath, isGuide = false) {
  const img = routine.image || imagePath;

  return `
    <div class="routine-card-new cursor-pointer" data-routine-id="${routine.id}">
      <div class="card-image">
        <img src="${img}" alt="${routine.title}" loading="lazy" />
      </div>
      <div class="card-content">
        <div class="card-info">
          <h3>${routine.title}</h3>
          <div class="card-meta">
            <span>⏱ ${routine.duration}</span>
          </div>
        </div>
        <button class="btn-start-glass">${isGuide ? 'Guide' : 'Start'}</button>
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
