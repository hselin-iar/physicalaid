/* ========================================
   PhysicalAid — Firestore Storage Layer
   Enhanced: per-day activity logs with full detail
   ======================================== */

import { db, getCurrentUser } from './firebase.js';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

// ─── In-Memory Cache ───
const cache = {};

function clearCache() {
    Object.keys(cache).forEach(k => delete cache[k]);
}

function getCacheKey(key) {
    const user = getCurrentUser();
    return user ? `${user.uid}_${key}` : `anon_${key}`;
}

// ─── Helpers ───
function getToday() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getUserDocRef(docName) {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return doc(db, 'users', user.uid, 'data', docName);
}

function getUserCollectionRef(collectionName) {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return collection(db, 'users', user.uid, collectionName);
}

// ─── Settings ───
const defaultSettings = {
    restDuration: 15,
    plankDuration: 30,
    walkingDuration: 5,
    soundEnabled: true,
    darkMode: true
};

export async function getSettings() {
    const cacheKey = getCacheKey('settings');
    if (cache[cacheKey]) return { ...defaultSettings, ...cache[cacheKey] };

    try {
        const snap = await getDoc(getUserDocRef('settings'));
        const data = snap.exists() ? snap.data() : {};
        cache[cacheKey] = data;
        return { ...defaultSettings, ...data };
    } catch (error) {
        console.error('Error loading settings:', error);
        return { ...defaultSettings };
    }
}

export async function saveSettings(settings) {
    const cacheKey = getCacheKey('settings');
    cache[cacheKey] = settings;
    try {
        await setDoc(getUserDocRef('settings'), settings, { merge: true });
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// ─── User Profile ───
export async function getUserProfile() {
    const cacheKey = getCacheKey('profile');
    if (cache[cacheKey]) return cache[cacheKey];

    try {
        const snap = await getDoc(getUserDocRef('profile'));
        const data = snap.exists() ? snap.data() : {
            joinedAt: new Date().toISOString(),
            totalSessions: 0
        };
        cache[cacheKey] = data;
        return data;
    } catch (error) {
        console.error('Error loading profile:', error);
        return { joinedAt: new Date().toISOString(), totalSessions: 0 };
    }
}

export async function saveUserProfile(profile) {
    const cacheKey = getCacheKey('profile');
    cache[cacheKey] = profile;
    try {
        await setDoc(getUserDocRef('profile'), profile, { merge: true });
    } catch (error) {
        console.error('Error saving profile:', error);
    }
}

// ─── Activity Log (per-day detailed records) ───
// Structure: activityLog/{YYYY-MM-DD} → {
//   routines: { "foot-arch": { completedAt, exerciseCount }, ... },
//   totalRoutines: N,
//   totalExercises: N
// }

async function getTodayActivity() {
    const today = getToday();
    const cacheKey = getCacheKey(`activity_${today}`);
    if (cache[cacheKey]) return cache[cacheKey];

    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');
        const docRef = doc(db, 'users', user.uid, 'activityLog', today);
        const snap = await getDoc(docRef);
        const data = snap.exists() ? snap.data() : {
            routines: {},
            totalRoutines: 0,
            totalExercises: 0
        };
        cache[cacheKey] = data;
        return data;
    } catch (error) {
        console.error('Error loading today activity:', error);
        return { routines: {}, totalRoutines: 0, totalExercises: 0 };
    }
}

async function saveTodayActivity(data) {
    const today = getToday();
    const cacheKey = getCacheKey(`activity_${today}`);
    cache[cacheKey] = data;

    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');
        const docRef = doc(db, 'users', user.uid, 'activityLog', today);
        await setDoc(docRef, data);
    } catch (error) {
        console.error('Error saving today activity:', error);
    }
}

// ─── Daily Completion (derived from activityLog) ───
export async function getCompletedToday() {
    const activity = await getTodayActivity();
    const items = Object.keys(activity.routines || {});
    return { date: getToday(), items };
}

export async function markCompleted(routineId, metadata = {}) {
    const activity = await getTodayActivity();

    // Don't overwrite if already completed
    if (!activity.routines[routineId]) {
        activity.routines[routineId] = {
            completedAt: new Date().toISOString(),
            exerciseCount: metadata.exerciseCount || 0,
            durationMin: metadata.durationMin || 0,
            type: metadata.type || 'routine' // 'routine' | 'walking' | 'standing'
        };

        // Recalculate totals
        const routines = Object.values(activity.routines);
        activity.totalRoutines = routines.length;
        activity.totalExercises = routines.reduce((sum, r) => sum + (r.exerciseCount || 0), 0);

        await saveTodayActivity(activity);
        await updateStreak();

        // Update profile total sessions
        try {
            const profile = await getUserProfile();
            profile.totalSessions = (profile.totalSessions || 0) + 1;
            await saveUserProfile(profile);
        } catch (e) {
            console.error('Error updating profile sessions:', e);
        }
    }
}

export async function isCompletedToday(routineId) {
    const data = await getCompletedToday();
    return data.items.includes(routineId);
}

// ─── Streaks ───
export async function getStreakData() {
    const cacheKey = getCacheKey('streaks');
    if (cache[cacheKey]) return cache[cacheKey];

    try {
        const snap = await getDoc(getUserDocRef('streaks'));
        const data = snap.exists() ? snap.data() : {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: ''
        };
        cache[cacheKey] = data;
        return data;
    } catch (error) {
        console.error('Error loading streak data:', error);
        return { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
    }
}

async function updateStreak() {
    const today = getToday();
    const streak = await getStreakData();

    if (streak.lastActiveDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastActiveDate === yesterdayStr) {
        streak.currentStreak += 1;
    } else if (streak.lastActiveDate !== today) {
        streak.currentStreak = 1;
    }

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastActiveDate = today;

    const cacheKey = getCacheKey('streaks');
    cache[cacheKey] = streak;

    try {
        await setDoc(getUserDocRef('streaks'), streak);
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}

// ─── Daily Log (heatmap — reads from activityLog) ───
export async function getDailyLog() {
    const cacheKey = getCacheKey('dailyLog');
    if (cache[cacheKey]) return cache[cacheKey];

    try {
        const colRef = getUserCollectionRef('activityLog');
        const snapshot = await getDocs(colRef);
        const log = {};
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            log[docSnap.id] = data.totalRoutines || Object.keys(data.routines || {}).length || 0;
        });
        cache[cacheKey] = log;
        return log;
    } catch (error) {
        console.error('Error loading daily log:', error);
        return {};
    }
}

// ─── Strength Log ───
export async function getStrengthLog() {
    const cacheKey = getCacheKey('strengthLog');
    if (cache[cacheKey]) return cache[cacheKey];

    try {
        const colRef = getUserCollectionRef('strengthLog');
        const snapshot = await getDocs(colRef);
        const entries = [];
        snapshot.forEach(docSnap => {
            entries.push({ date: docSnap.id, ...docSnap.data() });
        });
        // Sort by date descending
        entries.sort((a, b) => b.date.localeCompare(a.date));
        cache[cacheKey] = entries;
        return entries;
    } catch (error) {
        console.error('Error loading strength log:', error);
        return [];
    }
}

export async function saveStrengthEntry(entry) {
    const today = getToday();

    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const docRef = doc(db, 'users', user.uid, 'strengthLog', today);
        await setDoc(docRef, { exercises: entry });

        // Invalidate cache so next read gets fresh data
        const cacheKey = getCacheKey('strengthLog');
        delete cache[cacheKey];
    } catch (error) {
        console.error('Error saving strength entry:', error);
    }
}

export async function getStrengthSessionsThisWeek() {
    const log = await getStrengthLog();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    return log.filter(e => e.date >= weekStartStr);
}

// ─── Migration: localStorage → Firestore ───
export async function migrateLocalStorageToFirestore() {
    const user = getCurrentUser();
    if (!user) return;

    // Check if already migrated
    try {
        const snap = await getDoc(getUserDocRef('_migrated'));
        if (snap.exists()) return;
    } catch {
        // Continue with migration
    }

    console.log('Migrating localStorage data to Firestore...');

    try {
        // Settings
        const rawSettings = localStorage.getItem('pa_settings');
        if (rawSettings) {
            await setDoc(getUserDocRef('settings'), JSON.parse(rawSettings), { merge: true });
        }

        // Streaks
        const rawStreaks = localStorage.getItem('pa_streaks');
        if (rawStreaks) {
            await setDoc(getUserDocRef('streaks'), JSON.parse(rawStreaks));
        }

        // Daily Log → migrate to activityLog subcollection
        const rawDailyLog = localStorage.getItem('pa_daily_log');
        if (rawDailyLog) {
            const log = JSON.parse(rawDailyLog);
            for (const [date, count] of Object.entries(log)) {
                const docRef = doc(db, 'users', user.uid, 'activityLog', date);
                await setDoc(docRef, {
                    routines: {},
                    totalRoutines: count,
                    totalExercises: 0,
                    migratedFromLocalStorage: true
                });
            }
        }

        // Completed Today
        const rawCompleted = localStorage.getItem('pa_completed_today');
        if (rawCompleted) {
            const completed = JSON.parse(rawCompleted);
            if (completed.date && completed.items?.length) {
                const routines = {};
                for (const id of completed.items) {
                    routines[id] = { completedAt: '', exerciseCount: 0, type: 'routine' };
                }
                const docRef = doc(db, 'users', user.uid, 'activityLog', completed.date);
                await setDoc(docRef, {
                    routines,
                    totalRoutines: completed.items.length,
                    totalExercises: 0,
                    migratedFromLocalStorage: true
                }, { merge: true });
            }
        }

        // Strength Log
        const rawStrength = localStorage.getItem('pa_strength_log');
        if (rawStrength) {
            const entries = JSON.parse(rawStrength);
            for (const entry of entries) {
                const docRef = doc(db, 'users', user.uid, 'strengthLog', entry.date);
                await setDoc(docRef, { exercises: entry.exercises });
            }
        }

        // Create profile
        await setDoc(getUserDocRef('profile'), {
            joinedAt: new Date().toISOString(),
            totalSessions: 0
        });

        // Mark as migrated
        await setDoc(getUserDocRef('_migrated'), {
            migratedAt: new Date().toISOString(),
            source: 'localStorage'
        });

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// ─── Auth State Reset ───
export function onUserChanged() {
    clearCache();
}

export { getToday };
