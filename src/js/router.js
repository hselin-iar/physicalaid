/* ========================================
   PhysicalAid — Hash-based SPA Router
   ======================================== */

import { getCurrentUser } from './firebase.js';

const routes = {};
let currentPage = null;

// Pages that don't require authentication
const publicPages = ['/login'];

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

function resolveRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '') || '/';

    // Cleanup auth overlay if exists
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
        authContainer.remove();
        document.getElementById('app')?.classList.remove('hidden');
    }

    // Auth guard — redirect to login if not authenticated
    const user = getCurrentUser();
    if (!user && !publicPages.includes(path)) {
        navigate('/login');
        return;
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (user && path === '/login') {
        navigate('/');
        return;
    }

    // Update active nav links
    document.querySelectorAll('.nav-link, .bnav-item, .nav-item').forEach(link => {
        const page = link.dataset.page;
        const isActive = (
            (path === '/' && page === 'dashboard') ||
            path.startsWith('/' + page)
        );
        link.classList.toggle('active', isActive);
    });

    // Find matching route
    let handler = routes[path];

    // Check for parameterized routes (e.g., /player/:id)
    if (!handler) {
        for (const [routePath, routeHandler] of Object.entries(routes)) {
            if (routePath.includes(':')) {
                const regex = new RegExp('^' + routePath.replace(/:[^/]+/g, '([^/]+)') + '$');
                const match = path.match(regex);
                if (match) {
                    handler = () => routeHandler(match[1]);
                    break;
                }
            }
        }
    }

    if (handler) {
        // For login page, render directly (not in #main-content)
        if (path === '/login') {
            handler();
            return;
        }

        const main = document.getElementById('main-content');
        if (main) {
            currentPage = path;
            main.innerHTML = '';
            main.style.animation = 'none';
            // Force reflow
            void main.offsetHeight;
            main.style.animation = 'fadeIn 0.3s ease';
            handler(main);
        }
    }
}

export function initRouter() {
    window.addEventListener('hashchange', resolveRoute);
    // Initial route — will be called after auth state is ready
    resolveRoute();
}

export function getCurrentPage() {
    return currentPage;
}
