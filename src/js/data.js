/* ========================================
   PhysicalAid — Exercise Data Model
   ======================================== */

// Exercise types
export const ExType = {
  TIMED: 'timed',     // hold for X seconds
  REPS: 'reps',       // do X reps (tap to count)
  TIMED_REPS: 'timed_reps' // reps but with a pace timer
};

// Each side flag
export const Sides = {
  NONE: 'none',
  EACH: 'each'   // 3×30s each = do left, then right
};

// ─── Daily Reset: Foot + Arch Foundation ───
export const footArch = {
  id: 'foot-arch',
  title: 'Foot + Arch Foundation',
  icon: '🦶',
  duration: '5–6 min',
  gradient: 'gradient-cool',
  cardClass: 'foot',
  exercises: [
    {
      id: 'single-leg-stand',
      name: 'Single-Leg Stand',
      type: ExType.TIMED,
      sets: 3,
      duration: 30,
      sides: Sides.EACH,
      purpose: 'Arch + ankle stability',
      muscle: 'Feet & Ankles',
      image: '/images/exercises/foot-arch.png',
      emoji: '🦩',
      image: '/images/exercises/single-leg-stand.png',
      steps: [
        'Stand tall, feet hip-width apart',
        'Lift one foot off the ground',
        'Keep standing knee slightly bent',
        'Press through the arch of your standing foot',
        'Hold steady — fix your gaze on one point'
      ]
    },
    {
      id: 'short-foot',
      name: 'Short Foot Exercise',
      type: ExType.REPS,
      sets: 3,
      reps: 10,
      sides: Sides.NONE,
      purpose: 'Activate intrinsic foot muscles',
      muscle: 'Foot Arch',
      image: '/images/exercises/short_foot_exercise.png',
      emoji: '🦶',
      steps: [
        'Sit or stand with foot flat on the floor',
        'Pull the ball of your foot toward your heel',
        'Lift your arch without curling toes',
        'Hold 2–3 seconds, then release',
        'Keep toes relaxed the entire time'
      ]
    },
    {
      id: 'toe-spread-scrunch',
      name: 'Toe Spread + Scrunch',
      type: ExType.REPS,
      sets: 2,
      reps: 15,
      sides: Sides.NONE,
      purpose: 'Control + arch support',
      muscle: 'Toes & Arch',
      image: '/images/exercises/toe_spread_and_scrunch.png',
      emoji: '🖐️',
      steps: [
        'Spread all toes as wide as possible',
        'Hold the spread for 1 second',
        'Scrunch toes tightly together',
        'Hold the scrunch for 1 second',
        'Alternate: spread → scrunch = 1 rep'
      ]
    },
    {
      id: 'calf-raises',
      name: 'Calf Raises (Slow)',
      type: ExType.REPS,
      sets: 3,
      reps: 15,
      sides: Sides.NONE,
      purpose: 'Ankle strength + push-off power',
      muscle: 'Calves',
      image: '/images/exercises/calf_raises.png',
      emoji: '⬆️',
      steps: [
        'Stand with feet hip-width apart',
        'Rise up onto the balls of your feet slowly (2 sec up)',
        'Squeeze calves at the top',
        'Lower back down slowly (3 sec down)',
        'Keep core engaged and body straight'
      ]
    }
  ]
};

// ─── Daily Reset: Hip + Glute Control ───
export const hipGlute = {
  id: 'hip-glute',
  title: 'Hip + Glute Control',
  icon: '🍑',
  duration: '6–8 min',
  gradient: 'gradient-pink',
  cardClass: 'hip',
  exercises: [
    {
      id: 'clamshells',
      name: 'Clamshells',
      type: ExType.REPS,
      sets: 3,
      reps: 15,
      sides: Sides.EACH,
      purpose: 'Stops duck feet',
      muscle: 'Glute Med',
      image: '/images/exercises/clamshells.png',
      emoji: '🐚',
      steps: [
        'Lie on your side, knees bent at 45°',
        'Keep feet together throughout',
        'Open top knee like a clamshell',
        'Squeeze your glute at the top',
        'Lower slowly — don\'t let gravity do the work'
      ]
    },
    {
      id: 'glute-bridges',
      name: 'Glute Bridges',
      type: ExType.REPS,
      sets: 3,
      reps: 15,
      sides: Sides.NONE,
      purpose: 'Pelvic control',
      muscle: 'Glutes',
      image: '/images/exercises/glute_bridges.png',
      emoji: '🌉',
      steps: [
        'Lie on your back, knees bent, feet flat',
        'Push through your heels to lift hips',
        'Squeeze glutes hard at the top',
        'Hold 1–2 seconds at peak',
        'Lower hips slowly back down'
      ]
    },
    {
      id: 'dead-bugs',
      name: 'Dead Bugs',
      type: ExType.REPS,
      sets: 3,
      reps: 10,
      sides: Sides.NONE,
      purpose: 'Core stability during walking',
      muscle: 'Core',
      image: '/images/exercises/dead_bug.png',
      emoji: '🐛',
      steps: [
        'Lie on back — arms straight up, knees at 90°',
        'Press lower back firmly into the floor',
        'Extend opposite arm + leg outward slowly',
        'Don\'t let your lower back arch off the floor',
        'Return to start, switch sides = 1 rep'
      ]
    },
    {
      id: 'plank',
      name: 'Plank',
      type: ExType.TIMED,
      sets: 3,
      duration: 30, // can be 30 or 45 via settings
      durationAlt: 45,
      sides: Sides.NONE,
      purpose: 'Prevents excessive shoulder swing',
      muscle: 'Core',
      image: '/images/exercises/plank.png',
      emoji: '🧱',
      steps: [
        'Forearms on the floor, elbows under shoulders',
        'Body in a straight line — head to heels',
        'Engage core: pull belly button to spine',
        'Don\'t let hips sag or pike up',
        'Breathe steadily — don\'t hold your breath'
      ]
    }
  ]
};

// ─── Daily Reset: Upper Body Alignment ───
export const upperBody = {
  id: 'upper-body',
  title: 'Upper Body Alignment',
  icon: '🧍',
  duration: '4–5 min',
  gradient: 'gradient-warm',
  cardClass: 'upper',
  exercises: [
    {
      id: 'wall-posture-hold',
      name: 'Wall Posture Hold',
      type: ExType.TIMED,
      sets: 2,
      duration: 60,
      sides: Sides.NONE,
      purpose: 'Neural reset',
      muscle: 'Posterior Chain',
      image: '/images/exercises/neck_stretch.png',
      emoji: '🧱',
      steps: [
        'Stand with heels, butt, and upper back against the wall',
        'Tuck chin slightly — back of head touches wall',
        'Press shoulders back and down',
        'Keep ribs down, don\'t flare chest',
        'Hold this position — breathe normally'
      ]
    },
    {
      id: 'wall-slides',
      name: 'Wall Slides / Angels',
      type: ExType.REPS,
      sets: 3,
      reps: 10,
      sides: Sides.NONE,
      purpose: 'Shoulder alignment',
      muscle: 'Shoulders',
      image: '/images/exercises/wall_angel.png',
      emoji: '👼',
      steps: [
        'Back flat against the wall, arms in "goalpost" position',
        'Keep wrists, elbows, and shoulders touching wall',
        'Slide arms up overhead slowly',
        'Go only as high as you can while keeping contact',
        'Slide back down slowly = 1 rep'
      ]
    },
    {
      id: 'doorway-stretch',
      name: 'Doorway Stretch',
      type: ExType.TIMED,
      sets: 2,
      duration: 30,
      sides: Sides.NONE,
      purpose: 'Open chest',
      muscle: 'Pectorals',
      image: '/images/exercises/doorway_stretch.png',
      emoji: '🚪',
      steps: [
        'Stand in a doorway, arms on the frame at 90°',
        'Step one foot forward through the doorway',
        'Lean forward until you feel a chest stretch',
        'Keep shoulders down — don\'t shrug',
        'Breathe deeply and hold the stretch'
      ]
    },
    {
      id: 'dead-hang',
      name: 'Dead Hang',
      type: ExType.TIMED,
      sets: 2,
      duration: 30,
      sides: Sides.NONE,
      purpose: 'Shoulder decompression',
      muscle: 'Shoulders & Grip',
      image: '/images/exercises/dead-hang.png',
      emoji: '🐒',
      steps: [
        'Grab a pull-up bar with overhand grip',
        'Let your body hang freely — fully relax',
        'Shoulders should be by your ears (passive hang)',
        'Keep core engaged slightly',
        'Breathe and let gravity decompress your spine'
      ]
    }
  ]
};

// ─── Walking Protocol ───
export const walkingProtocol = {
  id: 'walking',
  title: 'Walking Protocol',
  icon: '🚶',
  duration: '5–10 min',
  gradient: 'gradient-green',
  cardClass: 'walking',
  focusCues: [
    'Feet pointing forward (parallel)',
    'Heel → midfoot → toe roll',
    'Push off from back leg',
    'Core engaged lightly (10–15%)',
    'Arms swing naturally, not exaggerated',
    'Chest open, chin slightly tucked'
  ]
};

// ─── Standing Checkpoint ───
export const standingCheckpoint = {
  id: 'standing',
  title: 'Standing Checkpoint',
  icon: '🪞',
  duration: '2 min',
  gradient: 'gradient-primary',
  cardClass: 'standing',
  checkpoints: [
    'Feet straight',
    'Knees soft (not locked)',
    'Glutes lightly engaged',
    'Ribs down (don\'t flare chest)',
    'Shoulders back and down'
  ]
};

// ─── Night Mobility ───
export const nightMobility = {
  id: 'night-mobility',
  title: 'Night Mobility',
  icon: '🌙',
  duration: '5 min',
  gradient: 'gradient-cool',
  cardClass: 'mobility',
  exercises: [
    {
      id: 'hip-flexor-stretch',
      name: 'Hip Flexor Stretch',
      type: ExType.TIMED,
      sets: 1,
      duration: 45,
      sides: Sides.EACH,
      purpose: 'Release tight hip flexors',
      muscle: 'Hip Flexors',
      image: '/images/exercises/side_leg_raise.png',
      emoji: '🧘',
      steps: [
        'Kneel on one knee (back knee on a pad)',
        'Front foot flat, knee at 90°',
        'Push hips forward gently',
        'Keep torso upright — don\'t lean forward',
        'Feel the stretch in the front of the back thigh'
      ]
    },
    {
      id: 'hamstring-stretch',
      name: 'Hamstring Stretch',
      type: ExType.TIMED,
      sets: 1,
      duration: 45,
      sides: Sides.EACH,
      purpose: 'Lengthen posterior chain',
      muscle: 'Hamstrings',
      image: '/images/exercises/hamstring-stretch.png',
      emoji: '🦵',
      steps: [
        'Sit on the floor, one leg extended out',
        'Tuck other foot against inner thigh',
        'Hinge at the hips toward extended leg',
        'Reach for your toes — keep back straight',
        'Don\'t round your back — lead with chest'
      ]
    },
    {
      id: 'thoracic-rotation',
      name: 'Thoracic Rotation Stretch',
      type: ExType.TIMED,
      sets: 1,
      duration: 45,
      sides: Sides.EACH,
      purpose: 'Restore spinal rotation',
      muscle: 'Thoracic Spine',
      image: '/images/exercises/thoracic_extension.png',
      emoji: '🔄',
      steps: [
        'Lie on side, knees stacked and bent at 90°',
        'Arms extended in front, palms together',
        'Open top arm toward the opposite side',
        'Rotate through mid-back, not lower back',
        'Follow your hand with your eyes — breathe out'
      ]
    }
  ]
};

// ─── Gym Plan — Beginner Split ───
export const gymPlan = {
  id: 'gym-plan',
  title: 'Gym Plan for Beginners',
  icon: '🏆',
  frequency: '4 days/week (Mon, Tue, Thu, Fri)',
  note: 'Start with 3 sets of 8–12 reps. Focus on form, not weight.',
  specificTips: [
    { label: 'Thin legs', tip: 'Prioritize squats, deadlifts, lunges (2x per week)' },
    { label: 'Posture', tip: 'Face pulls, rows, rear delt work (every upper day)' },
    { label: 'Belly fat', tip: 'Compound movements + cardio + diet' }
  ],
  days: [
    {
      day: 'Monday',
      dayShort: 'Mon',
      focus: 'Upper Push',
      image: '/images/exercises/gym-plan.png',
      emoji: '💪',
      exercises: [
        {
          id: 'bench-press', name: 'Bench Press',
          image: '/images/exercises/bench-press.png', emoji: '🏋️'
        },
        {
          id: 'overhead-press', name: 'Overhead Press',
          image: '/images/exercises/overhead-press.png', emoji: '🏋️'
        },
        {
          id: 'tricep-dips', name: 'Tricep Dips',
          image: '/images/exercises/tricep-dips.png', emoji: '💪'
        }
      ]
    },
    {
      day: 'Tuesday',
      dayShort: 'Tue',
      focus: 'Lower Body',
      emoji: '🦵',
      exercises: [
        {
          id: 'squats', name: 'Squats',
          image: '/images/exercises/squats.png', emoji: '🦵'
        },
        {
          id: 'romanian-deadlifts', name: 'Romanian Deadlifts',
          image: '/images/exercises/romanian-deadlifts.png', emoji: '🏋️'
        },
        {
          id: 'calf-raises-gym', name: 'Calf Raises',
          image: '/images/exercises/calf-raises-gym.png', emoji: '⬆️'
        },
        {
          id: 'lunges', name: 'Lunges',
          image: '/images/exercises/lunges.png', emoji: '🚶'
        }
      ]
    },
    {
      day: 'Wednesday',
      dayShort: 'Wed',
      focus: 'Rest / Posture Work',
      emoji: '🧘',
      exercises: [],
      isRest: true,
      note: 'Your daily mobility routine'
    },
    {
      day: 'Thursday',
      dayShort: 'Thu',
      focus: 'Upper Pull',
      emoji: '🚣',
      exercises: [
        {
          id: 'pull-ups', name: 'Pull-ups / Lat Pulldown',
          image: '/images/exercises/pull-ups.png', emoji: '🏋️'
        },
        {
          id: 'rows', name: 'Rows',
          image: '/images/exercises/rows.png', emoji: '🚣'
        },
        {
          id: 'face-pulls', name: 'Face Pulls',
          image: '/images/exercises/face-pulls.png', emoji: '🎯'
        },
        {
          id: 'bicep-curls', name: 'Bicep Curls',
          image: '/images/exercises/bicep-curls.png', emoji: '💪'
        }
      ]
    },
    {
      day: 'Friday',
      dayShort: 'Fri',
      focus: 'Lower Body',
      emoji: '🦵',
      exercises: [
        {
          id: 'deadlifts', name: 'Deadlifts',
          image: '/images/exercises/deadlifts.png', emoji: '🏋️'
        },
        {
          id: 'leg-press', name: 'Leg Press',
          image: '/images/exercises/leg-press.png', emoji: '🦵'
        },
        {
          id: 'bulgarian-split-squats', name: 'Bulgarian Split Squats',
          image: '/images/exercises/bulgarian-split-squats.png', emoji: '🚶'
        }
      ]
    },
    {
      day: 'Saturday–Sunday',
      dayShort: 'Sat–Sun',
      focus: 'Rest',
      emoji: '😴',
      exercises: [],
      isRest: true,
      note: 'Walk, stretch, active recovery'
    }
  ]
};

// ─── Sitting Rules ───
export const sittingRules = {
  rules: [
    'Both feet flat on the floor',
    'Knees at 90°',
    'Hips slightly higher than knees',
    'Back supported OR sit tall (no elbow-on-thigh collapse)',
    'Screen at eye level'
  ],
  reset: 'If you catch yourself slouching: Reset immediately. Don\'t wait.'
};

// ─── Sleeping Position ───
export const sleepingPosition = {
  best: [
    'On back, pillow under knees',
    'On side, pillow between knees'
  ],
  avoid: [
    'Stomach sleeping',
    'Twisted spine positions'
  ],
  note: 'Keep neck neutral. Not tilted.'
};

// ─── Journey Timeline ───
export const journeyTimeline = [
  { week: '1–2', title: 'Feels Robotic', icon: '🤖', desc: 'Everything feels awkward. That\'s normal. Your body is learning new patterns.' },
  { week: '3–4', title: 'Walking Improves', icon: '🚶', desc: 'Conscious walking starts to feel more natural. Posture awareness increases.' },
  { week: '6+', title: 'Natural Posture Shift', icon: '🧘', desc: 'Good posture starts happening automatically. Less mental effort needed.' },
  { week: '12–24', title: 'Real Structural Change', icon: '💪', desc: 'Muscles adapt. Alignment becomes your default. This is permanent change.' }
];

// ─── Motivational Quotes ───
export const quotes = [
  { text: 'Consistency > Intensity', sub: 'Your daily routine' },
  { text: 'You don\'t need 20 YouTube videos. You need 90 days of discipline.', sub: 'The truth' },
  { text: 'Do not over-optimize this. Just show up.', sub: 'Final instruction' },
  { text: 'Your hips are the engine. Right now they\'re asleep.', sub: 'Wake them up' },
  { text: 'Start tonight. And don\'t disappear after 3 days.', sub: 'The commitment' },
  { text: 'It will feel awkward. That\'s normal.', sub: 'The process' },
  { text: 'Visual feedback > guessing. Film yourself.', sub: 'Walking protocol' },
  // Appearance & Grooming Tips
  { text: 'Fix your posture immediately — it makes you look taller and more confident.', sub: 'Appearance upgrade' },
  { text: 'Dress in clothes that fit. Not baggy, not too tight.', sub: 'Appearance upgrade' },
  { text: 'Basic skincare: cleanser + moisturizer + sunscreen. Every day.', sub: 'Appearance upgrade' },
  { text: 'Get a proper haircut. Ask your barber what suits your face shape.', sub: 'Appearance upgrade' },
  { text: 'Clear skin matters more than a beard. Focus on skincare.', sub: 'Grooming tip' },
  { text: 'Keep your face clean-shaven or maintain stubble neatly.', sub: 'Grooming tip' },
  { text: 'Many guys can\'t grow beards at 19. Some start at 25. Don\'t stress it.', sub: 'Grooming tip' },
  { text: 'Focus on your eyebrows — clean up any unibrow if needed.', sub: 'Grooming tip' },
  { text: 'You can look great without a beard. Own it.', sub: 'Grooming tip' }
];

// ─── All routine sections (for dashboard & player) ───
export const allRoutines = [footArch, hipGlute, upperBody];
export const dailyResetFull = {
  id: 'daily-reset',
  title: 'Full Daily Reset',
  icon: '🔄',
  duration: '15–20 min',
  sections: [footArch, hipGlute, upperBody]
};
