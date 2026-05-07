// skillsData.js — All 27 skills, categorized

export const SKILLS_DATA = {
  beginner: [
    { id: 'pushups',          name: 'Push Ups',           img: '/Assets/Pushups.png',             freq: '3x per week', requirements: ['Plank Hold — 20s','Knee Push Ups — 10 reps','Core Awareness — basic'] },
    { id: 'squats',           name: 'Squats',              img: '/Assets/Squats.png',              freq: '3x per week', requirements: ['Hip Mobility — basic','Ankle Mobility — basic','Bodyweight Balance — stable'] },
    { id: 'dead-hang',        name: 'Dead Hang',           img: '/Assets/DeadHang.png',            freq: '4x per week', requirements: ['Grip Strength — basic','Shoulder Awareness — basic'] },
    { id: 'glute-bridge',     name: 'Glute Bridge',        img: '/Assets/Glutebridge.png',         freq: '3x per week', requirements: ['Hip Hinge — basic','Glute Activation — basic','Core Control — basic'] },
    { id: 'elbow-plank',      name: 'Elbow Plank',         img: '/Assets/Elbow pank.png',          freq: '4x per week', requirements: ['Core Awareness — basic','Shoulder Stability — basic'] },
    { id: 'hollow-body',      name: 'Hollow Body Hold',    img: '/Assets/Hollow body hold.png',    freq: '4x per week', requirements: ['Plank Hold — 30s','Dead Bug — 10 reps','Leg Raises — 10 reps'] },
    { id: 'superman-hold',    name: 'Superman Hold',       img: '/Assets/Superman hold.png',       freq: '3x per week', requirements: ['Back Extension — 10 reps','Hip Hinge — basic','Glute Activation — basic'] },
    { id: 'tricep-dips',      name: 'Tricep Dips',         img: '/Assets/TricepDips.png',          freq: '3x per week', requirements: ['Push Ups — 10 reps','Shoulder Stability — basic','Tricep Strength — basic'] },
    { id: 'mountain-climbers', name:'Mountain Climbers',   img: '/Assets/mountain climbers.png',   freq: '3x per week', requirements: ['Plank Hold — 30s','Hip Flexor Mobility — basic','Core Stability — basic'] },
  ],
  intermediate: [
    { id: 'dips',             name: 'Dips',                img: '/Assets/Dips.png',                freq: '3x per week', requirements: ['Tricep Dips — 15 reps','Push Ups — 20 reps','Shoulder Stability — good','Straight Bar Support — 20s'] },
    { id: 'pullups',          name: 'Pull Ups',            img: '/Assets/Pullups.png',             freq: '3x per week', requirements: ['Dead Hang — 30s','Australian Pull Ups — 10 reps','Negative Pull Ups — 5 reps'] },
    { id: 'australian-pulls', name: 'Australian Pull Ups', img: '/Assets/Austrailian Pulls.png',   freq: '3x per week', requirements: ['Dead Hang — 20s','Row Movement — basic','Scapular Retraction — basic'] },
    { id: 'hanging-knee',     name: 'Hanging Knee Raises', img: '/Assets/Hanging Knee Raises.png', freq: '3x per week', requirements: ['Dead Hang — 30s','Core Compression — basic','Hip Flexor Strength — basic'] },
    { id: 'jump-squats',      name: 'Jump Squats',         img: '/Assets/Jump squats.png',         freq: '3x per week', requirements: ['Squats — 20 reps','Ankle Stability — good','Landing Mechanics — basic'] },
    { id: 'lsit',             name: 'L-Sit',               img: '/Assets/L-sit.png',               freq: '4x per week', requirements: ['Support Hold — 30s','Hollow Body Hold — 40s','Knee Raises — 15 reps','Tuck L-Sit — 10s'] },
    { id: 'dragon-flag',      name: 'Dragon Flag',         img: '/Assets/Dragon Flag.png',         freq: '3x per week', requirements: ['Hollow Body Hold — 45s','Hanging Knee Raises — 15 reps','Leg Raises — 12 reps','Core Strength — good'] },
  ],
  advanced: [
    { id: 'handstand',        name: 'Handstand',           img: '/Assets/Handstand.png',           freq: '4x per week', requirements: ['Wall Handstand — 45s','Pike Push Ups — 15 reps','Shoulder Taps — 15 reps','Kick Up — 5 reps'] },
    { id: 'pistol-squats',    name: 'Pistol Squats',       img: '/Assets/Pistol squats.png',       freq: '3x per week', requirements: ['Squats — 30 reps','Single Leg Balance — 30s','Hip Flexor Mobility — good','Jump Squats — 15 reps'] },
    { id: 'front-lever',      name: 'Front Lever',         img: '/Assets/Front Lever.png',         freq: '3x per week', requirements: ['Pull Ups — 12 reps','Tuck Lever — 10s','Hollow Hold — 45s','Dragon Flag — 5 reps'] },
    { id: 'back-lever',       name: 'Back Lever',          img: '/Assets/Back Lever.png',          freq: '3x per week', requirements: ['Skin The Cat — 5 reps','German Hang — 30s','Pull Ups — 10 reps','Tuck Back Lever — 10s'] },
    { id: 'planche-lean',     name: 'Planche Lean',        img: '/Assets/Planche Lean.png',        freq: '4x per week', requirements: ['Push Ups — 30 reps','Dips — 20 reps','Tuck Planche — 5s','Wrist Conditioning — good'] },
    { id: 'ring-dips',        name: 'Ring Dips',           img: '/Assets/Ring Dips.png',           freq: '3x per week', requirements: ['Bar Dips — 20 reps','Ring Support Hold — 20s','Shoulder Stability — advanced'] },
    { id: 'hspu',             name: 'Handstand Push Ups',  img: '/Assets/HSPU.png',                freq: '3x per week', requirements: ['Handstand — 30s freestanding','Pike Push Ups — 20 reps','Wall HSPU — 5 reps'] },
  ],
  elite: [
    { id: 'muscle-ups',       name: 'Muscle Ups',          img: '/Assets/Muscle-ups.jpg',          freq: '3x per week', badge: 'HOT', requirements: ['Dead Hang — 1 min','Pull Ups — 12 reps','Bar Dips — 25 reps','High Pull Ups — 10 reps'] },
    { id: 'full-planche',     name: 'Full Planche',        img: '/Assets/Full Planche.png',        freq: '3x per week', requirements: ['Planche Lean — 30s','Straddle Planche — 5s','Tuck Planche — 15s','Straight Body Tension — advanced'] },
    { id: 'one-arm-pushup',   name: 'One Arm Push Up',     img: '/Assets/One arm pushups.png',     freq: '3x per week', requirements: ['Push Ups — 40 reps','Archer Push Ups — 10 reps each side','Core Stability — advanced','Shoulder Strength — advanced'] },
    { id: 'iron-cross',       name: 'Iron Cross',          img: '/Assets/Iron cross.png',          freq: '2x per week', requirements: ['Ring Dips — 15 reps','Ring Support Hold — 45s','Ring Fly — partial range','Straight Arm Strength — advanced'] },
    { id: 'human-flag',       name: 'Human Flag',          img: '/Assets/Human flag.png',          freq: '3x per week', requirements: ['Pull Ups — 15 reps','Handstand — 30s','Core Stability — elite','Straight Arm Strength — elite'] },
  ],
};

export const CATEGORIES = [
  { key: 'beginner',     label: 'Beginner',     icon: 'signal_cellular_alt_1_bar', color: '#22c55e' },
  { key: 'intermediate', label: 'Intermediate', icon: 'signal_cellular_alt_2_bar', color: '#ec5b13' },
  { key: 'advanced',     label: 'Advanced',     icon: 'signal_cellular_alt',       color: '#ef4444' },
  { key: 'elite',        label: 'Elite',        icon: 'signal_cellular_alt',       color: '#818cf8' },
];

export const SKILL_VIDEOS = {
  'Push Ups':           'https://www.youtube.com/watch?v=IODxDxX7oi4',
  'Squats':             'https://www.youtube.com/watch?v=aclHkVaku9U',
  'Dead Hang':          'https://youtu.be/GwMTIwfOPQE?si=tqkGQuYlTCjeWKDF',
  'Glute Bridge':       'https://youtu.be/OUgsJ8-Vi0E?si=qXEuBRGRWrOk0QT6',
  'Elbow Plank':        'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  'Hollow Body Hold':   'https://www.youtube.com/watch?v=LlDNef_Ztsc',
  'Superman Hold':      'https://www.youtube.com/watch?v=z6PJMT2y8GQ',
  'Tricep Dips':        'https://youtu.be/0326dy_-CzM?si=LfSNoJwHkGyQL7IW',
  'Mountain Climbers':  'https://youtu.be/ZhiCSdOVJp0?si=nXN6z3g0lWpRTekz',
  'Dips':               'https://www.youtube.com/watch?v=2z8JmcrW-As',
  'Pull Ups':           'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  'Australian Pull Ups':'https://www.youtube.com/watch?v=hXTc1mDnZCw',
  'Hanging Knee Raises':'https://www.youtube.com/watch?v=JB2oyawG9KI',
  'Jump Squats':        'https://www.youtube.com/watch?v=U4s4mEQ5VqU',
  'L-Sit':              'https://youtu.be/HxDP7SqggpI?si=k7BuOajWGfclEDDS',
  'Dragon Flag':        'https://youtu.be/pvz7k5gO-DE?si=bsW0M3Sck6Xagebs',
  'Handstand':          'https://www.youtube.com/watch?v=aXDxa79u0xQ',
  'Pistol Squats':      'https://www.youtube.com/watch?v=vq5-vdgJc0I',
  'Front Lever':        'https://www.youtube.com/watch?v=5g8-sj-8snc',
  'Back Lever':         'https://youtu.be/FZZqbeZti84?si=Pg8KnHIBATZIOGZr',
  'Planche Lean':       'https://www.youtube.com/watch?v=wKV5zVJTYBo',
  'Ring Dips':          'https://www.youtube.com/watch?v=3Vq6k2G7uZg',
  'Handstand Push Ups': 'https://youtu.be/fMTlYYHSy2A?si=6ZMXsr0Zv83sr9jB',
  'Muscle Ups':         'https://youtu.be/w016kSjobr8?si=Vwn0a935TRTzUgQJ',
  'Full Planche':       'https://www.youtube.com/watch?v=OmKfROtB45Q',
  'One Arm Push Up':    'https://www.youtube.com/watch?v=xp1tgjT_3k0',
  'Iron Cross':         'https://www.youtube.com/watch?v=mDrxNmEa57o',
  'Human Flag':         'https://www.youtube.com/watch?v=TF9XhvYh_m8',
};

export const SKILL_STEPS_MAP = {
  'Dips': [
    'Form correction: Grip the bar firmly, body straight, chest up, lower back in, core tight.',
    'Step 1: Keep hands straight and stabilize your body.',
    'Step 2: Go down, lean forward slightly, bend your elbows till 90 degrees, keep chest out and hold.',
    'Step 3: Push back up, make hands straight, and keep your core tight.',
  ],
  'Push Ups': [
    'Form correction: Keep a straight line from head to heels, core tight, and hands shoulder-width apart.',
    'Step 1: Lower your body until your chest is just above the floor.',
    'Step 2: Keep your elbows tucked in at about a 45-degree angle.',
    'Step 3: Push back up powerfully to the starting position.',
  ],
  'Pull Ups': [
    'Form correction: Hang with arms fully extended, engage your core, and pull shoulders down and back.',
    'Step 1: Initiate the pull by driving your elbows down toward your hips.',
    'Step 2: Pull yourself up until your chin clears the bar.',
    'Step 3: Lower yourself down with control to a dead hang.',
  ],
  'Human Flag': [
    'Form correction: Grip a vertical pole firmly with both hands; bottom hand pushes while top hand pulls.',
    'Step 1: Tuck your knees to your chest and find balance by engaging your obliques and lats.',
    'Step 2: Keep your core fully contracted to prevent rotation.',
    'Step 3: Gradually extend your legs straight out, starting with one leg or a straddle.',
    'Step 4: Hold the body parallel to the ground with locked elbows.',
  ],
};

export const DEFAULT_STEPS = [
  'Form correction: Ensure proper alignment, brace your core, and maintain tension.',
  'Step 1: Get into the starting position with correct posture.',
  'Step 2: Perform the eccentric (lowering) phase under control.',
  'Step 3: Hold the bottom position briefly if required.',
  'Step 4: Push/pull explosively back to the starting position.',
];

export function getSkillById(id) {
  for (const cat of Object.values(SKILLS_DATA)) {
    const found = cat.find(s => s.id === id);
    if (found) return found;
  }
  return null;
}

export function getCategoryForSkill(id) {
  for (const [key, skills] of Object.entries(SKILLS_DATA)) {
    if (skills.find(s => s.id === id)) return key;
  }
  return 'beginner';
}

export function getYouTubeEmbedId(url) {
  if (!url) return 'IODxDxX7oi4';
  if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
  return 'IODxDxX7oi4';
}
