/* ========================================
   PhysicalAid — Dashboard Page
   ======================================== */

import { allRoutines, walkingProtocol, standingCheckpoint, nightMobility, gymPlan } from '../data.js';
import { getStreakData, getDailyLog, getUserProfile, saveUserProfile, getStrengthLog, getToday, isProfileComplete, getTodayPlan } from '../storage.js';
import { navigate } from '../router.js';
import { renderMinimalHeatmap } from '../components/heatmap.js';
import { getCurrentUser, signOutUser } from '../firebase.js';

let dashboardOutsideClickHandler = null;

export async function renderDashboard(container) {
  const [streak, dailyLog, profile, strengthLog, todayPlan] = await Promise.all([
    getStreakData(),
    getDailyLog(),
    getUserProfile(),
    getStrengthLog(),
    getTodayPlan()
  ]);
  const user = getCurrentUser();
  const today = getToday();
  const hasGymLogToday = strengthLog.some(e => e.date === today);
  const gymDay = getTodayGymDay();
  const needsProfileSetup = !isProfileComplete(profile);

  // Count total daily trackables: 6 routine items + strength session.
  const totalRoutines = todayPlan.total || 7;
  const completedCount = todayPlan.doneCount || 0;
  const completionPct = Math.round((completedCount / totalRoutines) * 100);

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
            <div class="floating-gauge-val">${completedCount}/${totalRoutines}</div>
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

    <div class="mb-8 animate-in">
      <h2 class="section-heading">Today in Gym Plan</h2>
      <p class="section-sub">Your scheduled focus for today</p>
      <div style="padding: var(--sp-5); border-radius: 22px; border: 1px solid var(--border-glass); background: var(--bg-card);">
        <div class="flex items-center justify-between" style="gap: var(--sp-3);">
          <div>
            <div class="flow-label" style="margin: 0 0 0.35rem;">${gymDay.day}</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #fff;">${gymDay.focus}</div>
            <div class="text-muted" style="font-size: 0.75rem; margin-top: 0.25rem;">
              ${gymDay.isRest ? gymDay.note || 'Mobility and active recovery' : `${gymDay.exercises.length} exercises planned`}
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
            <span class="badge ${hasGymLogToday ? 'badge-success' : ''}">
              ${hasGymLogToday ? 'Logged Today' : 'Not Logged'}
            </span>
            <button id="btn-open-strength" class="btn-start-glass" style="padding: 0.45rem 0.8rem;">
              Open Strength
            </button>
          </div>
        </div>
        ${gymDay.isRest ? '' : `
          <div style="display: grid; gap: 6px; margin-top: var(--sp-4);">
            ${gymDay.exercises.slice(0, 3).map(ex => `<div class="text-muted" style="font-size: 0.74rem;">• ${ex.name}</div>`).join('')}
          </div>
        `}
      </div>
    </div>

    ${needsProfileSetup ? `
      <div class="mb-8 animate-in" id="profile-setup-card" style="padding: var(--sp-5); border-radius: 22px; border: 1px solid rgba(245, 158, 11, 0.45); background: rgba(245, 158, 11, 0.06);">
        <h2 class="section-heading" style="margin-bottom: 0.35rem;">Finish Your Profile</h2>
        <p class="text-muted" style="font-size: 0.78rem; margin-bottom: var(--sp-4);">Add these once so we can personalize routine and gym suggestions.</p>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;">
          <input id="profile-age" class="log-input" type="number" min="10" max="90" placeholder="Age" value="${profile.age || ''}" style="width: 100%;" />
          <select id="profile-gender" class="setting-select" style="width: 100%;">
            <option value="">Gender</option>
            <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Male</option>
            <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Female</option>
            <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>Other</option>
          </select>
          <input id="profile-height" class="log-input" type="number" min="120" max="230" placeholder="Height (cm)" value="${profile.heightCm || ''}" style="width: 100%;" />
          <input id="profile-weight" class="log-input" type="number" min="35" max="250" placeholder="Weight (kg)" value="${profile.weightKg || ''}" style="width: 100%;" />
        </div>
        <div class="mt-4">
          <button id="btn-save-profile-setup" class="btn-start-glass" style="width: 100%;">Save Personalization Data</button>
        </div>
      </div>
    ` : ''}
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
  if (dashboardOutsideClickHandler) {
    document.removeEventListener('click', dashboardOutsideClickHandler);
  }
  dashboardOutsideClickHandler = (e) => {
    if (!dropdown?.contains(e.target) && !profileBtn?.contains(e.target)) {
      dropdown?.classList.add('hidden');
    }
  };
  document.addEventListener('click', dashboardOutsideClickHandler);

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

  container.querySelector('#btn-open-strength')?.addEventListener('click', () => {
    navigate('/strength');
  });

  container.querySelector('#btn-save-profile-setup')?.addEventListener('click', async () => {
    const age = Number(container.querySelector('#profile-age')?.value || 0);
    const gender = String(container.querySelector('#profile-gender')?.value || '').trim();
    const heightCm = Number(container.querySelector('#profile-height')?.value || 0);
    const weightKg = Number(container.querySelector('#profile-weight')?.value || 0);

    if (!age || !gender || !heightCm || !weightKg) {
      alert('Please enter age, gender, height, and weight.');
      return;
    }

    await saveUserProfile({
      ...profile,
      age,
      gender,
      heightCm,
      weightKg,
      onboardingCompleted: true
    });
    await renderDashboard(container);
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

function getTodayGymDay() {
  const dayIndex = (new Date().getDay() + 6) % 7; // Mon=0
  return gymPlan.days[dayIndex] || gymPlan.days[0];
}
