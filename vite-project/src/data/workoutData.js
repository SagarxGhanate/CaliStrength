export const ALL_WORKOUTS = {
// =====================
// WORKOUT_DATA (Shared Globally)
// =====================
gain: {

    push: {
        label: 'Push Day',
        title: 'Upper Body Push',
        subtitle: 'Focus on chest, shoulders and triceps',
        duration: 55,
        intensity: 'High',
        cardio: [
            { name: 'Jumping Jacks', detail: '30 sec' },
            { name: 'High Knees', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Arm Circles', detail: '20 sec' },
            { name: 'Shoulder Rolls', detail: '20 sec' },
            { name: 'Scapular Push-ups', detail: '10 reps' },
        ],
        exercises: [
            { name: 'Incline Push-ups', sets: 3, reps: 12, desc: 'Build base pushing strength', img: '/Assets/incline pushups.png' },
            { name: 'Standard Push-ups', sets: 4, reps: 15, desc: 'Core pushing movement', img: '/Assets/Pushups.png' },
            { name: 'Dips', sets: 4, reps: 12, desc: 'Parallel bars, full range of motion', img: '/Assets/Dips.png' },
            { name: 'Decline Push-ups', sets: 3, reps: 10, desc: 'Upper chest focus', img: '/Assets/decline pushups.png' },
            { name: 'Pike Push-ups', sets: 3, reps: 10, desc: 'Shoulder strength builder', img: '/Assets/Pike Pushups.png' },
            { name: 'Diamond Push-ups', sets: 3, reps: 10, desc: 'Tricep isolation', img: '/Assets/diamond pushups.png' },
            { name: 'Wall Handstand Hold', sets: 3, reps: '20s', desc: 'Shoulder stability', img: '/Assets/wall handstand.png' },
        ],
        cooldown: [
            { name: 'Chest Stretch', detail: '30 sec each side' },
            { name: 'Tricep Stretch', detail: '20 sec each side' },
            { name: "Child's Pose", detail: '45 sec' },
        ]
    },

    core: {
        label: 'Core Day',
        title: 'Core & Stability',
        subtitle: 'Build a rock solid midsection',
        duration: 45,
        intensity: 'Medium',
        cardio: [
            { name: 'Mountain Climbers', detail: '45 sec' },
            { name: 'Plank Jacks', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Cat-Cow', detail: '10 reps' },
            { name: 'Bird Dog', detail: '10 reps each side' },
            { name: 'Dead Bug', detail: '10 reps each side' },
        ],
        exercises: [
            { name: 'Forearm Plank', sets: 3, reps: '60s', desc: 'Hold straight line, squeeze glutes', img: '/Assets/plank hold.png' },
            { name: 'Hollow Body Hold', sets: 3, reps: '30s', desc: 'Lower back pressed to floor', img: '/Assets/Hollow body hold.png' },
            { name: 'Lying Leg Raises', sets: 4, reps: 12, desc: 'Lower back flat, slow descent', img: '/Assets/laying leg raises.png' },
            { name: 'Russian Twists', sets: 3, reps: 30, desc: 'Touch floor on each side', img: '/Assets/Hanging Knee Raises.png' },
            { name: 'Side Plank', sets: 3, reps: '30s each', desc: 'Keep hips high', img: '/Assets/side plank.png' },
            { name: 'Bicycle Crunches', sets: 3, reps: 20, desc: 'Elbow to opposite knee', img: '/Assets/biycle crunches.png' },
            { name: 'Superman Hold', sets: 3, reps: '30s', desc: 'Lift chest and legs, hold', img: '/Assets/Superman hold.png' },
        ],
        cooldown: [
            { name: 'Cobra Stretch', detail: '45 sec' },
            { name: "Child's Pose", detail: '45 sec' },
        ]
    },

    pull: {
        label: 'Pull Day',
        title: 'Upper Body Pull',
        subtitle: 'Focus on back, biceps and grip strength',
        duration: 55,
        intensity: 'High',
        cardio: [
            { name: 'Mountain Climbers', detail: '30 sec' },
            { name: 'Butt Kicks', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Arm Swings', detail: '20 sec' },
            { name: 'Scapular Pull-ups', detail: '10 reps' },
            { name: 'Band Pull-aparts', detail: '15 reps' },
        ],
        exercises: [
            { name: 'Australian Pull-ups', sets: 3, reps: 12, desc: 'Build pulling foundation. Lean back under a low bar, keeping body straight, and pull chest to bar.', benefits: 'Fantastic regression exercise that builds essential base strength in the lats, rhomboids, and biceps required for standard pull-ups and eventually muscle-ups.', img: '/Assets/Austrailian Pulls.png' },
            { name: 'Bodyweight Rows', sets: 3, reps: 8, desc: 'Build strength progressively', benefits: 'Helps your neuro-muscular system adapt to the vertical pulling motion if you cannot yet do a full bodyweight pull-up.', img: '/Assets/Pullups.png' },
            { name: 'Pull-ups', sets: 4, reps: 8, desc: 'Strict form, chin over bar', benefits: 'The king of upper body pulling. Develops a wide back, massive grip strength, and is the absolute prerequisite for muscle-ups.', img: '/Assets/Pullups.png' },
            { name: 'Chin-ups', sets: 3, reps: 8, desc: 'Supinated grip, bicep focus', img: '/Assets/chinups.png' },
            { name: 'Wide Grip Pull-ups', sets: 3, reps: 6, desc: 'Lat width development', img: '/Assets/wide pullups.png' },
            { name: 'Negative Pull-ups', sets: 3, reps: 5, desc: 'Slow descent, 5 seconds', img: '/Assets/negative pulls.png' },
            { name: 'Hanging Knee Raises', sets: 3, reps: 12, desc: 'Core and hip flexor strength', img: '/Assets/Hanging Knee Raises.png' },
        ],
        cooldown: [
            { name: 'Lat Stretch', detail: '30 sec each side' },
            { name: 'Bicep Stretch', detail: '20 sec each side' },
            { name: 'Dead Hang', detail: '30 sec' },
        ]
    },

    legs: {
        label: 'Legs + Core',
        title: 'Lower Body & Core',
        subtitle: 'Focus on legs, glutes and core stability',
        duration: 60,
        intensity: 'Medium',
        cardio: [
            { name: 'Jump Rope', detail: '30 sec' },
            { name: 'Fast Feet Shuffle', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Hip Circles', detail: '20 sec each side' },
            { name: 'Leg Swings', detail: '15 reps each' },
            { name: 'Bodyweight Good Mornings', detail: '10 reps' },
        ],
        exercises: [
            { name: 'Bodyweight Squats', sets: 4, reps: 20, desc: 'Full depth, controlled pace', img: '/Assets/Squats.png' },
            { name: 'Reverse Lunges', sets: 3, reps: 12, desc: '12 reps each leg', img: '/Assets/forward-backward lunges.png' },
            { name: 'Walking Lunges', sets: 3, reps: 10, desc: '10 reps each leg', img: '/Assets/forward-backward lunges.png' },
            { name: 'Jump Squats', sets: 3, reps: 15, desc: 'Explosive power development', img: '/Assets/Jump squats.png' },
            { name: 'Calf Raises', sets: 3, reps: 5, desc: 'Assisted or full, each leg', img: '/Assets/calves raises.png' },
            { name: 'Glute Bridges', sets: 4, reps: 20, desc: 'Full hip extension at top', img: '/Assets/Glutebridge.png' },
            { name: 'Hanging Leg Raises', sets: 3, reps: 10, desc: 'Straight legs, controlled', img: '/Assets/hanging leg raises.png' },
        ],
        cooldown: [
            { name: 'Hip Flexor Stretch', detail: '30 sec each side' },
            { name: 'Quad Stretch', detail: '30 sec each side' },
            { name: 'Pigeon Pose', detail: '45 sec each side' },
        ]
    },

    rest: {
        label: 'Rest Day',
        title: 'Rest & Recovery',
        subtitle: 'Active recovery — stretch and breathe',
        duration: 20,
        intensity: 'Low',
        cardio: [],
        warmup: [],
        exercises: [
            { name: 'Full Body Stretch', sets: 1, reps: '3 min', desc: 'Head to toe mobility flow', img: '' },
            { name: 'Foam Rolling', sets: 1, reps: '5 min', desc: 'Target sore muscle groups', img: '' },
            { name: 'Deep Breathing', sets: 1, reps: '2 min', desc: 'Box breathing — 4-4-4-4', img: '' },
            { name: 'Cat-Cow Stretch', sets: 3, reps: 10, desc: 'Spine mobility', img: '' },
            { name: 'Pigeon Pose', sets: 2, reps: '45s', desc: 'Hip flexor release', img: '' },
        ],
        cooldown: [
            { name: 'Meditation / Breathing', detail: '5 min' },
        ]
    }
},
// =====================
// WORKOUT_DATA (Shared Globally)
// =====================
lose: {

    push: {
        label: 'Fat Burn Push',
        title: 'Upper Body Push',
        subtitle: 'Focus on chest, shoulders and triceps',
        duration: 55,
        intensity: 'High',
        cardio: [
            { name: 'Jumping Jacks', detail: '30 sec' },
            { name: 'High Knees', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Arm Circles', detail: '20 sec' },
            { name: 'Shoulder Rolls', detail: '20 sec' },
            { name: 'Scapular Push-ups', detail: '10 reps' },
        ],
        exercises: [
            { name: 'Burpees', sets: 3, reps: 12, desc: 'Build base pushing strength', img: '/Assets/burphees.png' },
            { name: 'Standard Push-ups', sets: 4, reps: 15, desc: 'Core pushing movement', img: '/Assets/Pushups.png' },
            { name: 'Mountain Climbers', sets: 4, reps: 12, desc: 'Parallel bars, full range of motion', img: '/Assets/mountain climbers.png' },
            { name: 'Decline Push-ups', sets: 3, reps: 10, desc: 'Upper chest focus', img: '/Assets/decline pushups.png' },
            { name: 'Pike Push-ups', sets: 3, reps: 10, desc: 'Shoulder strength builder', img: '/Assets/Pike Pushups.png' },
            { name: 'Diamond Push-ups', sets: 3, reps: 10, desc: 'Tricep isolation', img: '/Assets/diamond pushups.png' },
            { name: 'Wall Handstand Hold', sets: 3, reps: '20s', desc: 'Shoulder stability', img: '/Assets/wall handstand.png' },
        ],
        cooldown: [
            { name: 'Chest Stretch', detail: '30 sec each side' },
            { name: 'Tricep Stretch', detail: '20 sec each side' },
            { name: "Child's Pose", detail: '45 sec' },
        ]
    },

    core: {
        label: 'HIIT Core',
        title: 'Core & Endurance',
        subtitle: 'Burn fat and build stability',
        duration: 45,
        intensity: 'High',
        cardio: [
            { name: 'Burpees', detail: '30 sec' },
            { name: 'Mountain Climbers', detail: '45 sec' },
        ],
        warmup: [
            { name: 'Dynamic Plank', detail: '30 sec' },
            { name: 'Bird Dog', detail: '10 reps each side' },
            { name: 'Dead Bug', detail: '10 reps each side' },
        ],
        exercises: [
            { name: 'Plank Jacks', sets: 4, reps: 20, desc: 'Jump feet in and out in plank', img: '/Assets/plank jacks.png' },
            { name: 'Mountain Climbers', sets: 4, reps: 40, desc: 'Fast pace, knees to chest', img: '/Assets/mountain climbers.png' },
            { name: 'V-Ups', sets: 3, reps: 15, desc: 'Touch toes at the top', img: '/Assets/v ups.png' },
            { name: 'Russian Twists', sets: 4, reps: 40, desc: 'Fast, controlled rotations', img: '/Assets/Hanging Knee Raises.png' },
            { name: 'Flutter Kicks', sets: 3, reps: '45s', desc: 'Small kicks, lower back flat', img: '/Assets/flutter kicks.png' },
            { name: 'Side Plank Dips', sets: 3, reps: 15, desc: 'Hips down and up', img: '/Assets/side plank.png' },
            { name: 'Hollow Body Rock', sets: 3, reps: 20, desc: 'Maintain banana shape', img: '/Assets/Hollow body hold.png' },
        ],
        cooldown: [
            { name: 'Cobra Stretch', detail: '45 sec' },
            { name: "Child's Pose", detail: '45 sec' },
        ]
    },

    pull: {
        label: 'Cardio Pull',
        title: 'Upper Body Pull',
        subtitle: 'Focus on back, biceps and grip strength',
        duration: 55,
        intensity: 'High',
        cardio: [
            { name: 'Mountain Climbers', detail: '30 sec' },
            { name: 'Butt Kicks', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Arm Swings', detail: '20 sec' },
            { name: 'Scapular Pull-ups', detail: '10 reps' },
            { name: 'Band Pull-aparts', detail: '15 reps' },
        ],
        exercises: [
            { name: 'Jumping Pull-ups', sets: 3, reps: 12, desc: 'Build pulling foundation. Lean back under a low bar, keeping body straight, and pull chest to bar.', benefits: 'Fantastic regression exercise that builds essential base strength in the lats, rhomboids, and biceps required for standard pull-ups and eventually muscle-ups.', img: '/Assets/Austrailian Pulls.png' },
            { name: 'Bodyweight Rows', sets: 3, reps: 8, desc: 'Build strength progressively', benefits: 'Helps your neuro-muscular system adapt to the vertical pulling motion if you cannot yet do a full bodyweight pull-up.', img: '/Assets/Pullups.png' },
            { name: 'Pull-ups', sets: 4, reps: 8, desc: 'Strict form, chin over bar', benefits: 'The king of upper body pulling. Develops a wide back, massive grip strength, and is the absolute prerequisite for muscle-ups.', img: '/Assets/Pullups.png' },
            { name: 'Chin-ups', sets: 3, reps: 8, desc: 'Supinated grip, bicep focus', img: '/Assets/chinups.png' },
            { name: 'Wide Grip Pull-ups', sets: 3, reps: 6, desc: 'Lat width development', img: '/Assets/wide pullups.png' },
            { name: 'Negative Pull-ups', sets: 3, reps: 5, desc: 'Slow descent, 5 seconds', img: '/Assets/negative pulls.png' },
            { name: 'Hanging Knee Raises', sets: 3, reps: 12, desc: 'Core and hip flexor strength', img: '/Assets/Hanging Knee Raises.png' },
        ],
        cooldown: [
            { name: 'Lat Stretch', detail: '30 sec each side' },
            { name: 'Bicep Stretch', detail: '20 sec each side' },
            { name: 'Dead Hang', detail: '30 sec' },
        ]
    },

    legs: {
        label: 'HIIT Legs',
        title: 'Lower Body & Core',
        subtitle: 'Focus on legs, glutes and core stability',
        duration: 60,
        intensity: 'Medium',
        cardio: [
            { name: 'Jump Rope', detail: '30 sec' },
            { name: 'Fast Feet Shuffle', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Hip Circles', detail: '20 sec each side' },
            { name: 'Leg Swings', detail: '15 reps each' },
            { name: 'Bodyweight Good Mornings', detail: '10 reps' },
        ],
        exercises: [
            { name: 'Bodyweight Squats', sets: 4, reps: 20, desc: 'Full depth, controlled pace', img: '/Assets/Squats.png' },
            { name: 'Reverse Lunges', sets: 3, reps: 12, desc: '12 reps each leg', img: '/Assets/forward-backward lunges.png' },
            { name: 'Walking Lunges', sets: 3, reps: 10, desc: '10 reps each leg', img: '/Assets/forward-backward lunges.png' },
            { name: 'Jump Squats', sets: 3, reps: 15, desc: 'Explosive power development', img: '/Assets/Jump squats.png' },
            { name: 'Calf Raises', sets: 3, reps: 5, desc: 'Assisted or full, each leg', img: '/Assets/calves raises.png' },
            { name: 'Glute Bridges', sets: 4, reps: 20, desc: 'Full hip extension at top', img: '/Assets/Glutebridge.png' },
            { name: 'Hanging Leg Raises', sets: 3, reps: 10, desc: 'Straight legs, controlled', img: '/Assets/hanging leg raises.png' },
        ],
        cooldown: [
            { name: 'Hip Flexor Stretch', detail: '30 sec each side' },
            { name: 'Quad Stretch', detail: '30 sec each side' },
            { name: 'Pigeon Pose', detail: '45 sec each side' },
        ]
    },

    rest: {
        label: 'Rest Day',
        title: 'Rest & Recovery',
        subtitle: 'Active recovery — stretch and breathe',
        duration: 20,
        intensity: 'Low',
        cardio: [],
        warmup: [],
        exercises: [
            { name: 'Full Body Stretch', sets: 1, reps: '3 min', desc: 'Head to toe mobility flow', img: '' },
            { name: 'Foam Rolling', sets: 1, reps: '5 min', desc: 'Target sore muscle groups', img: '' },
            { name: 'Deep Breathing', sets: 1, reps: '2 min', desc: 'Box breathing — 4-4-4-4', img: '' },
            { name: 'Cat-Cow Stretch', sets: 3, reps: 10, desc: 'Spine mobility', img: '' },
            { name: 'Pigeon Pose', sets: 2, reps: '45s', desc: 'Hip flexor release', img: '' },
        ],
        cooldown: [
            { name: 'Meditation / Breathing', detail: '5 min' },
        ]
    }
},
// =====================
// WORKOUT_DATA (Shared Globally)
// =====================
fit: {

    push: {
        label: 'Push Day',
        title: 'Upper Body Push',
        subtitle: 'Focus on chest, shoulders and triceps',
        duration: 55,
        intensity: 'High',
        cardio: [
            { name: 'Jumping Jacks', detail: '30 sec' },
            { name: 'High Knees', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Arm Circles', detail: '20 sec' },
            { name: 'Shoulder Rolls', detail: '20 sec' },
            { name: 'Scapular Push-ups', detail: '10 reps' },
        ],
        exercises: [
            { name: 'Incline Push-ups', sets: 3, reps: 12, desc: 'Build base pushing strength', img: '/Assets/incline pushups.png' },
            { name: 'Standard Push-ups', sets: 4, reps: 15, desc: 'Core pushing movement', img: '/Assets/Pushups.png' },
            { name: 'Dips', sets: 4, reps: 12, desc: 'Parallel bars, full range of motion', img: '/Assets/Dips.png' },
            { name: 'Decline Push-ups', sets: 3, reps: 10, desc: 'Upper chest focus', img: '/Assets/decline pushups.png' },
            { name: 'Pike Push-ups', sets: 3, reps: 10, desc: 'Shoulder strength builder', img: '/Assets/Pike Pushups.png' },
            { name: 'Diamond Push-ups', sets: 3, reps: 10, desc: 'Tricep isolation', img: '/Assets/diamond pushups.png' },
            { name: 'Wall Handstand Hold', sets: 3, reps: '20s', desc: 'Shoulder stability', img: '/Assets/wall handstand.png' },
        ],
        cooldown: [
            { name: 'Chest Stretch', detail: '30 sec each side' },
            { name: 'Tricep Stretch', detail: '20 sec each side' },
            { name: "Child's Pose", detail: '45 sec' },
        ]
    },

    core: {
        label: 'Core Day',
        title: 'Core & Stability',
        subtitle: 'Build a rock solid midsection',
        duration: 45,
        intensity: 'Medium',
        cardio: [
            { name: 'Mountain Climbers', detail: '45 sec' },
            { name: 'Plank Jacks', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Cat-Cow', detail: '10 reps' },
            { name: 'Bird Dog', detail: '10 reps each side' },
            { name: 'Dead Bug', detail: '10 reps each side' },
        ],
        exercises: [
            { name: 'Forearm Plank', sets: 3, reps: '60s', desc: 'Hold straight line, squeeze glutes', img: '/Assets/plank hold.png' },
            { name: 'Hollow Body Hold', sets: 3, reps: '30s', desc: 'Lower back pressed to floor', img: '/Assets/Hollow body hold.png' },
            { name: 'Lying Leg Raises', sets: 4, reps: 12, desc: 'Lower back flat, slow descent', img: '/Assets/laying leg raises.png' },
            { name: 'Russian Twists', sets: 3, reps: 30, desc: 'Touch floor on each side', img: '/Assets/Hanging Knee Raises.png' },
            { name: 'Side Plank', sets: 3, reps: '30s each', desc: 'Keep hips high', img: '/Assets/side plank.png' },
            { name: 'Bicycle Crunches', sets: 3, reps: 20, desc: 'Elbow to opposite knee', img: '/Assets/biycle crunches.png' },
            { name: 'Superman Hold', sets: 3, reps: '30s', desc: 'Lift chest and legs, hold', img: '/Assets/Superman hold.png' },
        ],
        cooldown: [
            { name: 'Cobra Stretch', detail: '45 sec' },
            { name: "Child's Pose", detail: '45 sec' },
        ]
    },

    pull: {
        label: 'Pull Day',
        title: 'Upper Body Pull',
        subtitle: 'Focus on back, biceps and grip strength',
        duration: 55,
        intensity: 'High',
        cardio: [
            { name: 'Mountain Climbers', detail: '30 sec' },
            { name: 'Butt Kicks', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Arm Swings', detail: '20 sec' },
            { name: 'Scapular Pull-ups', detail: '10 reps' },
            { name: 'Band Pull-aparts', detail: '15 reps' },
        ],
        exercises: [
            { name: 'Australian Pull-ups', sets: 3, reps: 12, desc: 'Build pulling foundation. Lean back under a low bar, keeping body straight, and pull chest to bar.', benefits: 'Fantastic regression exercise that builds essential base strength in the lats, rhomboids, and biceps required for standard pull-ups and eventually muscle-ups.', img: '/Assets/Austrailian Pulls.png' },
            { name: 'Bodyweight Rows', sets: 3, reps: 8, desc: 'Build strength progressively', benefits: 'Helps your neuro-muscular system adapt to the vertical pulling motion if you cannot yet do a full bodyweight pull-up.', img: '/Assets/Pullups.png' },
            { name: 'Pull-ups', sets: 4, reps: 8, desc: 'Strict form, chin over bar', benefits: 'The king of upper body pulling. Develops a wide back, massive grip strength, and is the absolute prerequisite for muscle-ups.', img: '/Assets/Pullups.png' },
            { name: 'Chin-ups', sets: 3, reps: 8, desc: 'Supinated grip, bicep focus', img: '/Assets/chinups.png' },
            { name: 'Wide Grip Pull-ups', sets: 3, reps: 6, desc: 'Lat width development', img: '/Assets/wide pullups.png' },
            { name: 'Negative Pull-ups', sets: 3, reps: 5, desc: 'Slow descent, 5 seconds', img: '/Assets/negative pulls.png' },
            { name: 'Hanging Knee Raises', sets: 3, reps: 12, desc: 'Core and hip flexor strength', img: '/Assets/Hanging Knee Raises.png' },
        ],
        cooldown: [
            { name: 'Lat Stretch', detail: '30 sec each side' },
            { name: 'Bicep Stretch', detail: '20 sec each side' },
            { name: 'Dead Hang', detail: '30 sec' },
        ]
    },

    legs: {
        label: 'Legs + Core',
        title: 'Lower Body & Core',
        subtitle: 'Focus on legs, glutes and core stability',
        duration: 60,
        intensity: 'Medium',
        cardio: [
            { name: 'Jump Rope', detail: '30 sec' },
            { name: 'Fast Feet Shuffle', detail: '30 sec' },
        ],
        warmup: [
            { name: 'Hip Circles', detail: '20 sec each side' },
            { name: 'Leg Swings', detail: '15 reps each' },
            { name: 'Bodyweight Good Mornings', detail: '10 reps' },
        ],
        exercises: [
            { name: 'Bodyweight Squats', sets: 4, reps: 20, desc: 'Full depth, controlled pace', img: '/Assets/Squats.png' },
            { name: 'Reverse Lunges', sets: 3, reps: 12, desc: '12 reps each leg', img: '/Assets/forward-backward lunges.png' },
            { name: 'Walking Lunges', sets: 3, reps: 10, desc: '10 reps each leg', img: '/Assets/forward-backward lunges.png' },
            { name: 'Jump Squats', sets: 3, reps: 15, desc: 'Explosive power development', img: '/Assets/Jump squats.png' },
            { name: 'Calf Raises', sets: 3, reps: 5, desc: 'Assisted or full, each leg', img: '/Assets/calves raises.png' },
            { name: 'Glute Bridges', sets: 4, reps: 20, desc: 'Full hip extension at top', img: '/Assets/Glutebridge.png' },
            { name: 'Hanging Leg Raises', sets: 3, reps: 10, desc: 'Straight legs, controlled', img: '/Assets/hanging leg raises.png' },
        ],
        cooldown: [
            { name: 'Hip Flexor Stretch', detail: '30 sec each side' },
            { name: 'Quad Stretch', detail: '30 sec each side' },
            { name: 'Pigeon Pose', detail: '45 sec each side' },
        ]
    },

    rest: {
        label: 'Rest Day',
        title: 'Rest & Recovery',
        subtitle: 'Active recovery — stretch and breathe',
        duration: 20,
        intensity: 'Low',
        cardio: [],
        warmup: [],
        exercises: [
            { name: 'Full Body Stretch', sets: 1, reps: '3 min', desc: 'Head to toe mobility flow', img: '' },
            { name: 'Foam Rolling', sets: 1, reps: '5 min', desc: 'Target sore muscle groups', img: '' },
            { name: 'Deep Breathing', sets: 1, reps: '2 min', desc: 'Box breathing — 4-4-4-4', img: '' },
            { name: 'Cat-Cow Stretch', sets: 3, reps: 10, desc: 'Spine mobility', img: '' },
            { name: 'Pigeon Pose', sets: 2, reps: '45s', desc: 'Hip flexor release', img: '' },
        ],
        cooldown: [
            { name: 'Meditation / Breathing', detail: '5 min' },
        ]
    }
}
};

export function getTailoredWorkout(appData) {
  const goal = appData?.goal || 'fit';
  const baseWorkout = ALL_WORKOUTS[goal] || ALL_WORKOUTS['fit'];

  if (!appData?.profile || !appData?.weightHistory?.length) {
    return baseWorkout;
  }

  // The deterministic seed based on exact metrics
  const age = appData.profile.age || 25;
  const weight = appData.weightHistory[0]?.weight || 70;
  const target = appData.profile.targetWeight || 70;
  const height = appData.height || appData.profile?.height || 175;
  const experience = appData.experience || appData.profile?.experience || appData.level || 'beginner';
  
  // ── Progressive Difficulty ──
  // Determine how many days the user has been training
  let daysSinceStart = 0;
  if (appData.startDate) {
    const start = new Date(appData.startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    daysSinceStart = Math.max(0, Math.floor((now - start) / 86400000));
  }

  // Difficulty classification for exercises
  // 'hard' exercises are too tough for beginners (dips, handstands, burpees, pike pushups, pull-ups, etc.)
  // 'medium' exercises require some base strength
  // 'easy' exercises are beginner-friendly
  const HARD_EXERCISES = [
    'dips', 'wall handstand', 'handstand', 'pike push-up', 'pike push',
    'diamond push-up', 'diamond push', 'decline push-up', 'decline push',
    'burpee', 'pull-up', 'pull up', 'pullup', 'chin-up', 'chin up', 'chinup',
    'wide grip', 'negative pull', 'muscle up', 'muscle-up',
    'jumping pull', 'hanging leg raise', 'v-up', 'v up',
    'hollow body rock', 'dragon flag', 'front lever',
    'human flag', 'full planche', 'pistol squat',
    'jump squat', 'box jump',
  ];

  const MEDIUM_EXERCISES = [
    'dips', 'pike push-up', 'pike push', 'diamond push-up', 'diamond push',
    'decline push-up', 'decline push', 'burpee',
    'australian pull', 'bodyweight row', 'negative pull',
    'jumping pull', 'hollow body hold', 'side plank dip',
    'flutter kick', 'bicycle crunch', 'v-up', 'v up',
    'jump squat', 'walking lunge',
  ];

  // Determine allowed difficulty based on experience + days
  // Beginners: days 0-10 = easy only, days 11-20 = easy+medium, days 21+ = all
  // Intermediate/Advanced: no restrictions
  let allowedDifficulty = 'all'; // 'easy', 'easy+medium', 'all'
  if (experience === 'beginner') {
    if (daysSinceStart <= 10) {
      allowedDifficulty = 'easy';
    } else if (daysSinceStart <= 20) {
      allowedDifficulty = 'easy+medium';
    }
  }

  // Helper to classify exercise difficulty
  const getExerciseDifficulty = (name) => {
    const lower = name.toLowerCase();
    if (HARD_EXERCISES.some(h => lower.includes(h))) return 'hard';
    if (MEDIUM_EXERCISES.some(m => lower.includes(m))) return 'medium';
    return 'easy';
  };

  // Helper to check if exercise is allowed at current difficulty level
  const isExerciseAllowed = (name) => {
    if (allowedDifficulty === 'all') return true;
    const diff = getExerciseDifficulty(name);
    if (allowedDifficulty === 'easy') return diff === 'easy';
    if (allowedDifficulty === 'easy+medium') return diff === 'easy' || diff === 'medium';
    return true;
  };

  // Create a unique numeric seed
  const seedStr = `${age}-${weight}-${target}-${height}-${experience}-${goal}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 1000000007;
  }

  // Simple pseudo-random function
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (Math.abs(seed) - 1) / 2147483646;
  };

  // Deeply clone the base workout to not mutate ALL_WORKOUTS
  const customWorkout = JSON.parse(JSON.stringify(baseWorkout));

  // Gather all available exercises across all goals & splits to act as our "AI DB"
  const exercisePool = { push: [], pull: [], core: [], legs: [] };
  Object.values(ALL_WORKOUTS).forEach(g => {
    if (g.push) exercisePool.push.push(...g.push.exercises);
    if (g.pull) exercisePool.pull.push(...g.pull.exercises);
    if (g.core) exercisePool.core.push(...g.core.exercises);
    if (g.legs) exercisePool.legs.push(...g.legs.exercises);
  });

  // Deduplicate pool
  const uniquePool = (arr) => {
     const seen = new Set();
     return arr.filter(ex => {
       if (seen.has(ex.name)) return false;
       seen.add(ex.name);
       return true;
     });
  };
  exercisePool.push = uniquePool(exercisePool.push);
  exercisePool.pull = uniquePool(exercisePool.pull);
  exercisePool.core = uniquePool(exercisePool.core);
  exercisePool.legs = uniquePool(exercisePool.legs);

  // Calculate BMI to detect overweight users
  const bmi = weight / ((height / 100) ** 2);
  const isOverweight = bmi > 25;

  // For each split, randomly pick 5-7 exercises using the seeded random
  const generateSplit = (type) => {
    let pool = exercisePool[type] || [];
    if (!pool.length) return [];

    // ── Filter by progressive difficulty & BMI ──
    if (allowedDifficulty !== 'all') {
      let filtered = pool.filter(ex => isExerciseAllowed(ex.name));
      // BMI Check: If overweight, avoid high-impact jumps
      if (isOverweight) {
        filtered = filtered.filter(ex => !ex.name.toLowerCase().includes('jump'));
      }
      // Only use filtered if we have at least 4 exercises
      if (filtered.length >= 4) {
        pool = filtered;
      }
    } else if (isOverweight) {
      // Even if advanced, heavily overweight users shouldn't do crazy jumps
      pool = pool.filter(ex => !ex.name.toLowerCase().includes('jump box'));
    }
    
    // Shuffle pool deterministically using the unique seed
    const shuffled = [...pool].sort(() => random() - 0.5);
    
    // Determine how many exercises based on experience and age
    let count = 7;
    if (experience === 'beginner' && daysSinceStart <= 10) count = 5; 
    else if (experience === 'beginner') count = 6;
    else if (experience === 'intermediate') count = 7;
    else if (experience === 'advanced') count = 8;

    // Age adjustment: Older athletes get slightly less volume but retain intensity
    if (age > 45 && count > 5) count -= 1;

    const selected = shuffled.slice(0, count);

    // Adjust sets and reps based precisely on the unique combination of user data
    return selected.map(ex => {
       let sets = experience === 'beginner' ? 3 : (experience === 'advanced' ? 5 : 4);
       let reps = typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps) || 10;

       // 1. Base progression scaling
       if (experience === 'beginner' && daysSinceStart <= 10) {
         reps = Math.max(5, Math.floor(reps * 0.6));
         sets = Math.min(sets, 3);
       } else if (experience === 'beginner' && daysSinceStart <= 20) {
         reps = Math.max(6, Math.floor(reps * 0.8));
       }
       
       // 2. Goal scaling
       const wDiff = weight - target;
       if (goal === 'lose') {
         // Need more endurance/cardio effect -> slightly higher reps
         reps += Math.floor(Math.abs(wDiff) / 5);
       }
       if (goal === 'gain') {
         // Need hypertrophy -> more sets, controlled reps
         sets += 1; 
         reps = Math.max(5, reps - 2); 
       }
       
       // 3. Ultra-fine metric scaling (Guarantees different plans for slight data differences)
       if (typeof reps === 'number') {
         // Age penalty factor (older = slightly lower reps to protect joints, compensated by form)
         const agePenalty = age > 30 ? Math.floor((age - 30) / 10) : 0;
         reps = Math.max(5, reps - agePenalty);

         // Weight micro-adjustment: Every 3kg difference alters the rep scheme
         const weightMod = Math.floor(weight % 3);
         if (weightMod === 1) reps += 1;
         else if (weightMod === 2) reps -= 1;

         // Height micro-adjustment: Taller people have longer levers, making calisthenics harder
         if (height > 185 && ex.name.toLowerCase().includes('push')) {
           reps = Math.max(5, reps - 1); // 1 less rep for long arms on pushups
         }
       }

       return { ...ex, sets, reps: isNaN(reps) ? ex.reps : reps };
    });
  };

  if (customWorkout.push) customWorkout.push.exercises = generateSplit('push');
  if (customWorkout.pull) customWorkout.pull.exercises = generateSplit('pull');
  if (customWorkout.core) customWorkout.core.exercises = generateSplit('core');
  if (customWorkout.legs) customWorkout.legs.exercises = generateSplit('legs');

  // Age-based Warmup/Cooldown adjustments
  if (age > 40) {
    ['push', 'pull', 'core', 'legs'].forEach(split => {
      if (customWorkout[split]) {
        if (customWorkout[split].warmup) {
           customWorkout[split].warmup.push({ name: 'Extra Joint Rotations', detail: '60 sec' });
        }
        if (customWorkout[split].duration) {
           customWorkout[split].duration += 5; // Add 5 mins to expected duration
        }
      }
    });
  }

  return customWorkout;
}
