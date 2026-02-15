/* ========================================
   PhysicalAid — localStorage Wrapper
   ======================================== */

const KEYS = {
    SETTINGS: 'pa_settings',
    STREAKS: 'pa_streaks',
    DAILY_LOG: 'pa_daily_log',
    STRENGTH_LOG: 'pa_strength_log',
    COMPLETED_TODAY: 'pa_completed_today'
};

function getToday() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ─── Settings ───
const defaultSettings = {
    restDuration: 15,      // seconds
    plankDuration: 30,     // 30 or 45
    walkingDuration: 5,    // 5, 7, or 10 min
    soundEnabled: true,
    darkMode: true
};

export function getSettings() {
    return { ...defaultSettings, ...load(KEYS.SETTINGS, {}) };
}

export function saveSettings(settings) {
    save(KEYS.SETTINGS, settings);
}

// ─── Daily Completion ───
export function getCompletedToday() {
    const data = load(KEYS.COMPLETED_TODAY, { date: '', items: [] });
    if (data.date !== getToday()) {
        return { date: getToday(), items: [] };
    }
    return data;
}

export function markCompleted(routineId) {
    const data = getCompletedToday();
    if (!data.items.includes(routineId)) {
        data.items.push(routineId);
    }
    data.date = getToday();
    save(KEYS.COMPLETED_TODAY, data);
    updateStreak();
}

export function isCompletedToday(routineId) {
    return getCompletedToday().items.includes(routineId);
}

// ─── Streaks ───
export function getStreakData() {
    return load(KEYS.STREAKS, {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: ''
    });
}

function updateStreak() {
    const today = getToday();
    const streak = getStreakData();

    if (streak.lastActiveDate === today) return; // already counted today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastActiveDate === yesterdayStr) {
        streak.currentStreak += 1;
    } else if (streak.lastActiveDate !== today) {
        streak.currentStreak = 1; // reset
    }

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastActiveDate = today;
    save(KEYS.STREAKS, streak);
}

// ─── Daily Log (calendar heatmap) ───
export function getDailyLog() {
    return load(KEYS.DAILY_LOG, {});
    // { "2026-02-15": 3, "2026-02-14": 5 } — number of routines completed
}

export function logDailyActivity() {
    const log = getDailyLog();
    const today = getToday();
    const completed = getCompletedToday();
    log[today] = completed.items.length;
    save(KEYS.DAILY_LOG, log);
}

// ─── Strength Log ───
export function getStrengthLog() {
    return load(KEYS.STRENGTH_LOG, []);
    // [ { date: "2026-02-15", exercises: { rows: { weight: 50, reps: 12 }, ... } } ]
}

export function saveStrengthEntry(entry) {
    const log = getStrengthLog();
    // Check if entry for today exists
    const today = getToday();
    const existing = log.findIndex(e => e.date === today);
    if (existing >= 0) {
        log[existing] = { date: today, exercises: entry };
    } else {
        log.push({ date: today, exercises: entry });
    }
    // Keep last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const filtered = log.filter(e => e.date >= cutoffStr);
    save(KEYS.STRENGTH_LOG, filtered);
}

export function getStrengthSessionsThisWeek() {
    const log = getStrengthLog();
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    return log.filter(e => e.date >= weekStartStr);
}

export { getToday };
