/* ========================================
   PhysicalAid — Main Entry Point
   ======================================== */

import './style.css';
import { registerRoute, initRouter } from './js/router.js';
import { renderDashboard } from './js/pages/dashboard.js';
import { renderPlayer } from './js/pages/player.js';
import { renderRoutines } from './js/pages/routines.js';
import { renderStrength } from './js/pages/strength.js';
import { renderGuides } from './js/pages/guides.js';
import { renderProgress } from './js/pages/progress.js';
import { renderSettings } from './js/pages/settings.js';

// ─── Register All Routes ───
registerRoute('/', (container) => renderDashboard(container));
registerRoute('/routines', (container) => renderRoutines(container));
registerRoute('/strength', (container) => renderStrength(container));
registerRoute('/guides', (container) => renderGuides(container));
registerRoute('/guides/walking', (container) => renderGuides(container, 'walking'));
registerRoute('/guides/standing', (container) => renderGuides(container, 'standing'));
registerRoute('/progress', (container) => renderProgress(container));
registerRoute('/settings', (container) => renderSettings(container));

// Player routes (parameterized)
registerRoute('/player/:routineId', (routineId) => renderPlayer(routineId));

// ─── Initialize Router ───
initRouter();

// ─── Service Worker Registration (for offline support later) ───
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/sw.js').catch(() => {});
// }

console.log('⚡ PhysicalAid loaded');
