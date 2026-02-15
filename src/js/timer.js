/* ========================================
   PhysicalAid — Timer / Exercise Player Engine
   ======================================== */

import { ExType, Sides } from './data.js';
import { getSettings, markCompleted } from './storage.js';
import * as audio from './audio.js';

let state = {
    running: false,
    paused: false,
    routineId: '',
    exercises: [],       // flattened list (sides expanded)
    currentIndex: 0,
    currentSet: 1,
    totalSets: 1,
    timeRemaining: 0,
    repCount: 0,
    targetReps: 0,
    isResting: false,
    intervalId: null,
    onUpdate: null,      // callback for UI updates
    onComplete: null,    // callback when routine finishes
    cachedSettings: null // settings cached at routine start
};

function getOverlay() {
    return document.getElementById('player-overlay');
}

// Flatten exercises: expand "each side" into separate entries
function flattenExercises(exercises) {
    const flat = [];
    for (const ex of exercises) {
        if (ex.sides === Sides.EACH) {
            flat.push({ ...ex, sideName: 'Left' });
            flat.push({ ...ex, sideName: 'Right' });
        } else {
            flat.push({ ...ex, sideName: null });
        }
    }
    return flat;
}

// Get effective duration for timed exercises (respects settings)
function getEffectiveDuration(exercise) {
    const settings = state.cachedSettings;
    if (exercise.id === 'plank' && settings.plankDuration) {
        return settings.plankDuration;
    }
    return exercise.duration || 30;
}

// ─── Start a routine ───
export async function startRoutine(routineId, exercises, onUpdate, onComplete) {
    audio.initAudio();

    // Cache settings at start to avoid async calls during timer ticks
    const settings = await getSettings();

    const flat = flattenExercises(exercises);

    state = {
        running: true,
        paused: false,
        routineId,
        exercises: flat,
        currentIndex: 0,
        currentSet: 1,
        totalSets: flat[0]?.sets || 1,
        timeRemaining: 0,
        repCount: 0,
        targetReps: 0,
        isResting: false,
        intervalId: null,
        onUpdate,
        onComplete,
        cachedSettings: settings
    };

    const overlay = getOverlay();
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    audio.playStart();
    startCurrentExercise();
}

function startCurrentExercise() {
    const ex = state.exercises[state.currentIndex];
    if (!ex) {
        finishRoutine();
        return;
    }

    state.totalSets = ex.sets;
    state.isResting = false;

    if (ex.type === ExType.TIMED) {
        state.timeRemaining = getEffectiveDuration(ex);
        state.repCount = 0;
        state.targetReps = 0;
        startTimer();
    } else {
        // Rep-based
        state.repCount = 0;
        state.targetReps = ex.reps;
        state.timeRemaining = 0;
    }

    fireUpdate();
}

function startTimer() {
    clearInterval(state.intervalId);
    const settings = state.cachedSettings;

    state.intervalId = setInterval(() => {
        if (state.paused) return;

        state.timeRemaining--;

        // Audio cues
        if (settings.soundEnabled) {
            const ex = state.exercises[state.currentIndex];
            const totalTime = state.isResting ? settings.restDuration : getEffectiveDuration(ex);

            if (!state.isResting && state.timeRemaining === Math.floor(totalTime / 2)) {
                audio.playHalfway();
            }
            if (state.timeRemaining <= 3 && state.timeRemaining > 0) {
                audio.playCountdownBeep();
            }
        }

        if (state.timeRemaining <= 0) {
            clearInterval(state.intervalId);

            if (state.isResting) {
                // Rest done, move to next set or exercise
                state.isResting = false;
                advanceAfterSet();
            } else {
                // Set complete
                if (settings.soundEnabled) audio.playSetComplete();
                handleSetComplete();
            }
        }

        fireUpdate();
    }, 1000);
}

// Called when user taps the rep button
export function countRep() {
    if (!state.running || state.isResting) return;

    const ex = state.exercises[state.currentIndex];
    if (ex.type !== ExType.REPS) return;

    const settings = state.cachedSettings;
    state.repCount++;
    if (settings.soundEnabled) audio.playRepTap();

    if (state.repCount >= state.targetReps) {
        if (settings.soundEnabled) audio.playSetComplete();
        handleSetComplete();
    }

    fireUpdate();
}

function handleSetComplete() {
    if (state.currentSet < state.totalSets) {
        // More sets to go → rest
        startRest();
    } else {
        // All sets done for this exercise
        const settings = state.cachedSettings;
        if (settings.soundEnabled) audio.playExerciseComplete();
        advanceToNextExercise();
    }
}

function startRest() {
    const settings = state.cachedSettings;
    state.isResting = true;
    state.timeRemaining = settings.restDuration;
    startTimer();
    fireUpdate();
}

function advanceAfterSet() {
    state.currentSet++;
    const ex = state.exercises[state.currentIndex];

    if (ex.type === ExType.TIMED) {
        state.timeRemaining = getEffectiveDuration(ex);
        startTimer();
    } else {
        state.repCount = 0;
    }

    fireUpdate();
}

function advanceToNextExercise(immediate = false) {
    clearTimeout(state.transitionTimeout);
    state.currentIndex++;
    state.currentSet = 1;

    if (state.currentIndex >= state.exercises.length) {
        finishRoutine();
    } else {
        // Navigate immediately or with delay
        if (immediate) {
            if (state.running) {
                const settings = state.cachedSettings;
                if (settings.soundEnabled) audio.playStart();
                startCurrentExercise();
            }
        } else {
            // Brief pause before next exercise (auto-advance)
            state.transitionTimeout = setTimeout(() => {
                if (state.running) {
                    const settings = state.cachedSettings;
                    if (settings.soundEnabled) audio.playStart();
                    startCurrentExercise();
                }
            }, 1500);
            fireUpdate();
        }
    }
}

async function finishRoutine() {
    clearInterval(state.intervalId);
    clearTimeout(state.transitionTimeout);
    state.running = false;

    const settings = state.cachedSettings;
    if (settings.soundEnabled) audio.playRoutineComplete();

    // Mark completed with exercise metadata
    const uniqueExercises = new Set(state.exercises.map(e => e.id)).size;
    await markCompleted(state.routineId, {
        exerciseCount: uniqueExercises,
        type: 'routine'
    });

    if (state.onComplete) {
        state.onComplete(state.routineId);
    }

    fireUpdate();
}

// ─── Controls ───
export function pauseResume() {
    if (!state.running) return;
    state.paused = !state.paused;
    fireUpdate();
}

export function skipExercise() {
    if (!state.running) return;
    clearInterval(state.intervalId);
    advanceToNextExercise();
}

export function previousExercise() {
    if (!state.running) return;
    if (state.currentIndex === 0 && state.currentSet === 1) return; // Already at start

    clearInterval(state.intervalId);

    // Logic: Go to start of previous exercise. 
    // Ideally we should go to previous exercise index.
    if (state.currentIndex > 0) {
        state.currentIndex--;
        state.currentSet = 1;
        startCurrentExercise();
    } else {
        // If at index 0 but later set?
        // Let's just restart the current exercise if at index 0
        state.currentSet = 1;
        startCurrentExercise();
    }
}

export function restartExercise() {
    if (!state.running) return;
    clearInterval(state.intervalId);
    state.currentSet = 1;
    startCurrentExercise();
}

export function stopRoutine() {
    clearInterval(state.intervalId);
    state.running = false;
    state.paused = false;

    const overlay = getOverlay();
    overlay.classList.add('hidden');
    document.body.style.overflow = '';

    fireUpdate();
}

// ─── State Getters ───
export function getState() {
    const ex = state.exercises[state.currentIndex] || null;

    // Calculate total duration for progress ring
    let totalDuration = 0;
    if (state.isResting) {
        const settings = state.cachedSettings;
        totalDuration = settings ? settings.restDuration : 15;
    } else if (ex && ex.type === ExType.TIMED) {
        totalDuration = getEffectiveDuration(ex);
    }

    return {
        running: state.running,
        paused: state.paused,
        routineId: state.routineId,
        currentExercise: ex,
        currentIndex: state.currentIndex,
        totalExercises: state.exercises.length,
        currentSet: state.currentSet,
        totalSets: state.totalSets,
        timeRemaining: state.timeRemaining,
        totalDuration: totalDuration,
        repCount: state.repCount,
        targetReps: state.targetReps,
        isResting: state.isResting,
        finished: !state.running && state.currentIndex >= state.exercises.length,
        progress: state.exercises.length > 0
            ? (state.currentIndex / state.exercises.length) * 100
            : 0
    };
}

function fireUpdate() {
    if (state.onUpdate) {
        state.onUpdate(getState());
    }
}
