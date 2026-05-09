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
  const height = appData.height || 175;
  const experience = appData.experience || 'beginner';
  
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

  // For each split, randomly pick 5-7 exercises using the seeded random
  const generateSplit = (type) => {
    const pool = exercisePool[type] || [];
    if (!pool.length) return [];
    
    // Shuffle pool deterministically
    const shuffled = [...pool].sort(() => random() - 0.5);
    
    // Determine how many exercises based on experience
    let count = 7;
    if (experience === 'intermediate') count = 7;
    if (experience === 'advanced') count = 8;

    const selected = shuffled.slice(0, count);

    // Adjust sets and reps based on weight difference and experience
    return selected.map(ex => {
       const wDiff = Math.abs(weight - target);
       let sets = experience === 'beginner' ? 3 : (experience === 'advanced' ? 5 : 4);
       let reps = typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps) || 10;
       
       if (goal === 'lose') reps += Math.floor(wDiff / 5);
       if (goal === 'gain') { sets += 1; reps = Math.max(5, reps - 2); }
       
       // Tweak reps slightly based on weight
       if (typeof reps === 'number') {
         reps += (weight % 3);
       }

       return { ...ex, sets, reps: isNaN(reps) ? ex.reps : reps };
    });
  };

  if (customWorkout.push) customWorkout.push.exercises = generateSplit('push');
  if (customWorkout.pull) customWorkout.pull.exercises = generateSplit('pull');
  if (customWorkout.core) customWorkout.core.exercises = generateSplit('core');
  if (customWorkout.legs) customWorkout.legs.exercises = generateSplit('legs');

  return customWorkout;
}
