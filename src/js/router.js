/* ========================================
   PhysicalAid — Hash-based SPA Router
   ======================================== */

const routes = {};
let currentPage = null;

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

function resolveRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '') || '/';

    // Update active nav links
    document.querySelectorAll('.nav-link, .bnav-item').forEach(link => {
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
    // Initial route
    resolveRoute();
}

export function getCurrentPage() {
    return currentPage;
}
