/* ========================================
   PhysicalAid — Main Entry Point
   ======================================== */

import './style.css';
import { registerRoute, initRouter, navigate } from './js/router.js';
import { onAuthChange } from './js/firebase.js';
import { onUserChanged } from './js/storage.js';
import { startReminderLoop, stopReminderLoop } from './js/reminders.js';
import { renderDashboard } from './js/pages/dashboard.js';
import { renderPlayer } from './js/pages/player.js';
import { renderRoutines } from './js/pages/routines.js';
import { renderStrength } from './js/pages/strength.js';
import { renderGuides } from './js/pages/guides.js';
import { renderProgress } from './js/pages/progress.js';
import { renderSettings } from './js/pages/settings.js';
import { renderLogin } from './js/pages/auth.js';

// ─── Register All Routes ───
registerRoute('/', (container) => renderDashboard(container));
registerRoute('/routines', (container) => renderRoutines(container));
registerRoute('/strength', (container) => renderStrength(container));
registerRoute('/guides', (container) => renderGuides(container));
registerRoute('/guides/walking', (container) => renderGuides(container, 'walking'));
registerRoute('/guides/standing', (container) => renderGuides(container, 'standing'));
registerRoute('/progress', (container) => renderProgress(container));
registerRoute('/settings', (container) => renderSettings(container));
registerRoute('/login', () => renderLogin());

// Player routes (parameterized)
registerRoute('/player/:routineId', (routineId) => renderPlayer(routineId));

// ─── Auth State Listener ───
let routerInitialized = false;

onAuthChange((user) => {
   // Clear storage cache on auth state change
   onUserChanged();

   if (user) {
      // Show the sidebar & bottom nav
      document.getElementById('sidebar')?.classList.remove('hidden');
      document.getElementById('bottom-nav')?.classList.remove('hidden');
      document.getElementById('main-content')?.classList.remove('hidden');

      // Update user profile in sidebar
      updateSidebarProfile(user);
      startReminderLoop();
   } else {
      // Hide sidebar & bottom nav when not logged in
      document.getElementById('sidebar')?.classList.add('hidden');
      document.getElementById('bottom-nav')?.classList.add('hidden');
      stopReminderLoop();
   }

   if (!routerInitialized) {
      routerInitialized = true;
      initRouter();
   } else {
      // Re-navigate to trigger auth guard
      const hash = window.location.hash || '#/';
      const path = hash.replace('#', '') || '/';
      navigate(user ? (path === '/login' ? '/' : path) : '/login');
   }
});

function updateSidebarProfile(user) {
   const sidebar = document.getElementById('sidebar');
   if (!sidebar) return;

   // Check if profile section already exists
   let profileEl = sidebar.querySelector('.sidebar-profile');
   if (!profileEl) {
      profileEl = document.createElement('div');
      profileEl.className = 'sidebar-profile';
      sidebar.insertBefore(profileEl, sidebar.firstChild);
   }

   profileEl.innerHTML = `
    <div class="profile-info">
      <img src="${user.photoURL || ''}" alt="${user.displayName}" class="profile-avatar" referrerpolicy="no-referrer" />
      <div class="profile-details">
        <div class="profile-name">${user.displayName || 'User'}</div>
        <div class="profile-email">${user.email || ''}</div>
      </div>
    </div>
    <button class="profile-signout-btn" id="btn-signout" title="Sign Out">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    </button>
  `;

   profileEl.querySelector('#btn-signout')?.addEventListener('click', async () => {
      const { signOutUser } = await import('./js/firebase.js');
      await signOutUser();
   });
}

console.log('⚡ PhysicalAid loaded');

if ('serviceWorker' in navigator) {
   window.addEventListener('load', async () => {
      try {
         if (import.meta.env.PROD) {
            await navigator.serviceWorker.register('/sw.js');
            return;
         }

         // In local development, ensure old workers are fully removed.
         const regs = await navigator.serviceWorker.getRegistrations();
         await Promise.all(regs.map((reg) => reg.unregister()));

         if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((key) => caches.delete(key)));
         }
      } catch (error) {
         console.error('Service worker setup failed:', error);
      }
   });
}
