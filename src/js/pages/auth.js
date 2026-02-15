/* ========================================
   PhysicalAid — Login / Auth Page
   ======================================== */

import { signInWithGoogle, signOutUser, getCurrentUser } from '../firebase.js';
import { navigate } from '../router.js';
import { migrateLocalStorageToFirestore } from '../storage.js';

export function renderLogin() {
  const app = document.getElementById('app');
  const user = getCurrentUser();

  if (user) {
    navigate('/');
    return;
  }

  app.innerHTML = `
    <div class="auth-page">
      <!-- Left Side: Hero (Desktop) -->
      <div class="auth-hero">
        <img src="/images/auth-hero.jpg" alt="Workout" class="auth-hero-bg" loading="lazy">
        <div class="auth-gradient-overlay"></div>
        
        <div class="glass-stats-card animate-in">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="pulse-dot"></div>
              <span class="text-xs font-bold tracking-wider uppercase">Live Tracking</span>
            </div>
            <span class="text-xs text-gray-400 font-mono">00:42:15</span>
          </div>
          
          <div class="mb-6">
            <p class="text-xs text-gray-400 mb-1">Heart Rate</p>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold">142</span>
              <span class="text-xs text-gray-400">BPM</span>
              <span class="ml-auto text-red-500 animate-pulse">❤</span>
            </div>
          </div>

          <div class="pt-4 border-t border-white/10">
            <p class="text-sm text-gray-300 mb-2">Form Score: <span class="text-green-400 font-bold">98%</span></p>
            <div class="w-full bg-white/10 rounded-full h-1.5">
              <div class="bg-green-500 h-1.5 rounded-full" style="width: 98%"></div>
            </div>
          </div>
        </div>

        <div class="hero-text-overlay animate-in" style="animation-delay: 0.1s">
          <h2 class="hero-title">Push your <span class="text-gradient">limits</span>.</h2>
          <p class="text-gray-300 text-lg">AI-powered form correction and real-time performance analytics for every workout.</p>
        </div>
      </div>

      <!-- Right Side: Login Form -->
      <div class="auth-form-container">
        <!-- Mobile Background -->
        <div class="mobile-hero-bg">
          <img src="/images/mobile-auth-hero.jpg" alt="Background" class="mobile-hero-img">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]"></div>
        </div>

        <div class="auth-content animate-in" style="animation-delay: 0.2s">
          <div class="auth-brand">
            <h1 class="auth-logo-text">Physical<span class="text-gradient">Aid</span></h1>
            <p class="text-gray-400 text-sm tracking-wide mt-2">Your daily posture & strength companion</p>
          </div>

          <div class="space-y-6">
            <button class="btn-google-glass" id="btn-google-signin">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div class="auth-divider">
              <div class="auth-divider-line"></div>
              <span class="auth-divider-text">Secure Access</span>
              <div class="auth-divider-line"></div>
            </div>

            <div id="login-error" class="auth-error-card" style="display: none;">
              <span class="text-red-500 text-sm">⚠</span>
              <div>
                <h4 class="text-sm font-semibold text-red-400">Authentication Failed</h4>
                <p class="text-xs text-red-400/70 mt-1">Please try signing in again.</p>
              </div>
            </div>
          </div>

          <div class="auth-footer">
            <p>v2.4.0-stable</p>
            <div class="mt-4 text-xs text-gray-500">
              By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind sign-in button
  document.getElementById('btn-google-signin')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-google-signin');
    const errorEl = document.getElementById('login-error');

    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
    btn.innerHTML = '<span class="login-spinner"></span> Signing in...';
    errorEl.style.display = 'none';

    try {
      await signInWithGoogle();
      await migrateLocalStorageToFirestore();
      navigate('/');
    } catch (error) {
      errorEl.style.display = 'flex';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            `;
    }
  });
}
