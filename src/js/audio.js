/* ========================================
   PhysicalAid — Web Audio API Helper
   ======================================== */

let audioCtx = null;

function getCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Audio not available, fail silently
    }
}

// Start chime — pleasant ascending arpeggio
export function playStart() {
    playTone(523.25, 0.15, 'sine', 0.25); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.25), 100); // E5
    setTimeout(() => playTone(783.99, 0.3, 'sine', 0.3), 200); // G5
}

// Tick sound — subtle metronome
export function playTick() {
    playTone(800, 0.05, 'sine', 0.1);
}

// Countdown beep — 3-2-1
export function playCountdownBeep() {
    playTone(880, 0.1, 'square', 0.15);
}

// Final countdown beep (the last one before timer ends)
export function playFinalBeep() {
    playTone(1046.5, 0.2, 'sine', 0.3);
}

// Set complete — success chime
export function playSetComplete() {
    playTone(523.25, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.2), 80);
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.25), 160);
}

// Exercise complete — triumphant sound
export function playExerciseComplete() {
    playTone(523.25, 0.12, 'sine', 0.2);
    setTimeout(() => playTone(659.25, 0.12, 'sine', 0.2), 100);
    setTimeout(() => playTone(783.99, 0.12, 'sine', 0.2), 200);
    setTimeout(() => playTone(1046.5, 0.3, 'sine', 0.3), 300);
}

// Routine complete — celebration
export function playRoutineComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'sine', 0.25), i * 120);
    });
}

// Halfway notification
export function playHalfway() {
    playTone(600, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(700, 0.08, 'sine', 0.1), 100);
}

// Rep tap sound
export function playRepTap() {
    playTone(660, 0.05, 'sine', 0.15);
}

// Ensure audio context is initialized on user interaction
export function initAudio() {
    try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    } catch (e) {
        // fail silently
    }
}
