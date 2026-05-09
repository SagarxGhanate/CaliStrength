import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { formatDateStandard, toLocalDateStr } from '../../utils/dateUtils'
import { BODY_PARTS } from '../../data/injuryFilter'
import styles from './AIWidget.module.css'

// ── CONFIG ──
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const CHAT_STORAGE_KEY = 'cs_ai_chat'

// ── PERSISTENT CHAT STATE ──
function loadChatState() {
  try {
    const s = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || { messages: [], injuries: [] }
    // Migrate old string injuries
    s.injuries = (s.injuries || []).map(inj =>
      typeof inj === 'string' ? { part: inj, date: Date.now(), permanent: false, mode: 'remove' } : inj
    )
    // Clean expired non-permanent injuries (7 days)
    const now = Date.now()
    s.injuries = s.injuries.filter(inj => {
      if (inj.permanent) return true
      return ((now - (inj.date || 0)) / (1000 * 60 * 60 * 24)) <= 7
    })
    return s
  } catch { return { messages: [], injuries: [] } }
}

function saveChatState(state, detail) {
  const trimmed = { ...state }
  if (trimmed.messages.length > 40) trimmed.messages = trimmed.messages.slice(-40)
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed))
  window.dispatchEvent(new CustomEvent('injuryUpdate', { detail: detail || null }))
}

// ── INJURY COMMAND PARSER ──
function applyCommand(cmd, part, state) {
  let rawPart = part?.toLowerCase().trim() || ''
  
  // Fuzzy match body part
  let matchedPart = BODY_PARTS.find(p => rawPart.includes(p)) || rawPart

  if (cmd === 'ADD_INJURY' || cmd === 'ADD_LIGHT_INJURY') {
    if (matchedPart) {
      const newMode = cmd === 'ADD_LIGHT_INJURY' ? 'light' : 'remove'
      const existing = state.injuries.find(i => i.part === matchedPart)
      if (existing) {
        // Update mode if it changed (e.g. remove → light)
        existing.mode = newMode
        existing.date = Date.now()
      } else {
        state.injuries.push({
          part: matchedPart,
          date: Date.now(),
          permanent: false,
          mode: newMode
        })
      }
    }
  } else if (cmd === 'CLEAR_INJURY') {
    state.injuries = state.injuries.filter(i => i.part !== matchedPart)
  } else if (cmd === 'CLEAR_ALL_INJURIES') {
    state.injuries = []
  } else if (cmd === 'REMOVE_EXERCISE') {
    if (rawPart) {
      const existing = state.injuries.find(i => i.part === rawPart && i.mode === 'exclude_exercise')
      if (!existing) {
        state.injuries.push({
          part: rawPart,
          date: Date.now(),
          permanent: true,
          mode: 'exclude_exercise'
        })
      }
    }
  }
}

// ── SYSTEM PROMPT BUILDER ──
function buildSystemPrompt(appData) {
  const profile = appData?.profile || {}
  const name = profile.name || 'Athlete'
  const dob = profile.dob || null
  const height = appData?.height || profile.height || null
  const gender = appData?.gender || profile.gender || null
  const role = profile.role || 'Athlete'
  const bio = profile.bio || ''
  const experience = appData?.experience || appData?.experienceLevel || 'beginner'

  let age = null
  if (dob) {
    const b = new Date(dob)
    if (!isNaN(b)) age = new Date().getFullYear() - b.getFullYear()
  }
  if (!age && appData?.age) age = appData.age
  if (!age && profile.age) age = profile.age

  // Weight data
  const wh = Array.isArray(appData?.weightHistory) ? appData.weightHistory : []
  const latestWeight = wh.length > 0 ? wh[wh.length - 1].weight : null
  const prevWeight = wh.length > 1 ? wh[wh.length - 2].weight : null
  const recentWeights = wh.slice(-7).map(w => `${w.date}: ${w.weight}kg`).join(', ') || 'None logged'
  const totalWeightEntries = wh.length

  // Weight trend
  let weightTrend = 'stable'
  if (wh.length >= 2) {
    const diff = parseFloat(wh[wh.length - 1].weight) - parseFloat(wh[wh.length - 2].weight)
    if (diff > 0.3) weightTrend = `gaining (+${diff.toFixed(1)}kg)`
    else if (diff < -0.3) weightTrend = `losing (${diff.toFixed(1)}kg)`
  }

  // Workout history
  const workoutH = Array.isArray(appData?.workoutHistory) ? appData.workoutHistory : []
  const totalWorkouts = workoutH.length
  const recentWorkouts = workoutH.slice(-10).map(w => {
    const parts = []
    parts.push(w.date || 'Unknown date')
    parts.push(w.type || w.split || 'Workout')
    if (w.duration) parts.push(`${w.duration}min`)
    if (w.totalReps) parts.push(`${w.totalReps} reps`)
    return parts.join(' — ')
  }).join('\n  ') || 'None'

  // Today & yesterday
  const today = toLocalDateStr(new Date())
  const todayWorkout = workoutH.find(w => toLocalDateStr(w.date) === today)
  const todayStr = todayWorkout
    ? `${todayWorkout.type || todayWorkout.split || 'Workout'} (${todayWorkout.duration || 0} min, ${todayWorkout.totalReps || 0} reps)`
    : 'Not started yet'

  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = toLocalDateStr(yesterdayDate)
  const yWorkout = workoutH.find(w => toLocalDateStr(w.date) === yesterday)
  const yesterdayStr = yWorkout
    ? `${yWorkout.type || yWorkout.split || 'Workout'} (${yWorkout.totalReps || 0} reps)`
    : 'Rest / not logged'

  // Streak
  const streak = localStorage.getItem('calistrength-streak') || 0
  const longestStreak = appData?.longestStreak || 0

  // All exercise data (PRs, progression)
  const allExReps = Array.isArray(appData?.allExerciseReps) ? appData.allExerciseReps : []
  const exerciseSummary = allExReps.slice(0, 20).map(ex => {
    const daysCount = ex.daysLogged ? Object.keys(ex.daysLogged).length : 0
    return `• ${ex.name}: ${ex.totalReps || 0} total reps, PR: ${ex.highestPR || 0} reps, logged ${daysCount} time(s)`
  }).join('\n') || 'No exercises logged yet'

  // Total reps across all exercises
  const grandTotalReps = allExReps.reduce((sum, ex) => sum + (ex.totalReps || 0), 0)

  // Skills
  let skillsInfo = 'No skills tracked'
  try {
    const skills = JSON.parse(localStorage.getItem('caliSkills')) || {}
    const ongoing = skills.ongoing || []
    const mastered = skills.mastered || []
    if (ongoing.length || mastered.length) {
      skillsInfo = `Ongoing: ${ongoing.map(s => s.name || s).join(', ') || 'none'} | Mastered: ${mastered.map(s => s.name || s).join(', ') || 'none'}`
    }
  } catch { /* empty */ }

  // Inactive days calculation
  let inactiveDays = 0
  const cwDate = new Date()
  cwDate.setDate(cwDate.getDate() - 1)
  for (let i = 0; i < 30; i++) {
    const dStr = toLocalDateStr(cwDate)
    const hasWorkout = workoutH.some(w => toLocalDateStr(w.date) === dStr)
    const hasWeight = wh.some(w => toLocalDateStr(w.date) === dStr)
    if (!hasWorkout && !hasWeight) {
      inactiveDays++
      cwDate.setDate(cwDate.getDate() - 1)
    } else break
  }

  // Active injuries from chat storage
  let injuries = []
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || {}
    injuries = saved.injuries || []
  } catch { /* empty */ }

  // Rest time setting
  const restTime = appData?.restTime || 90

  // Goal mapping
  const goalMap = { gain: 'Gain Weight / Build Muscle', lose: 'Lose Weight / Fat Loss', fit: 'Stay Fit / Maintain' }
  const goalStr = goalMap[appData?.goal] || appData?.goal || 'not set'

  return `You are the AI Coach inside CaliStrength — a premium calisthenics fitness app. You are a world-class personal trainer who knows everything about bodyweight training, nutrition, and athletic performance.

═══════════════════════════════════════
COMPLETE USER PROFILE
═══════════════════════════════════════
Name: ${name}
Age: ${age || 'unknown'}
Height: ${height ? height + ' cm' : 'unknown'}
Gender: ${gender || 'unknown'}
Role: ${role}
Bio: ${bio || 'not set'}
Experience Level: ${experience}

═══════════════════════════════════════
BODY & WEIGHT DATA
═══════════════════════════════════════
Current weight: ${latestWeight ? latestWeight + ' kg' : 'not logged'}
Previous weight: ${prevWeight ? prevWeight + ' kg' : 'not logged'}
Target weight: ${appData?.targetweight ? appData.targetweight + ' kg' : 'not set'}
Weight trend: ${weightTrend}
Total weight logs: ${totalWeightEntries}
Recent weights (last 7): ${recentWeights}

═══════════════════════════════════════
FITNESS GOAL & TRAINING
═══════════════════════════════════════
Main goal: ${goalStr}
Rest timer setting: ${restTime} seconds between sets
Current streak: ${streak} day(s)
Longest streak ever: ${longestStreak} day(s)
Total workouts completed: ${totalWorkouts}
Grand total reps (all exercises): ${grandTotalReps}

═══════════════════════════════════════
TODAY & RECENT ACTIVITY
═══════════════════════════════════════
Today's workout: ${todayStr}
Yesterday's workout: ${yesterdayStr}
Inactive days (consecutive before today): ${inactiveDays}

Recent workout sessions (last 10):
  ${recentWorkouts}

═══════════════════════════════════════
EXERCISE LOG & PERSONAL RECORDS
═══════════════════════════════════════
${exerciseSummary}

═══════════════════════════════════════
SKILLS PROGRESS
═══════════════════════════════════════
${skillsInfo}

═══════════════════════════════════════
ACTIVE INJURIES
═══════════════════════════════════════
${injuries.length ? injuries.map(i => `• ${i.part} (${i.mode || 'remove'} mode${i.permanent ? ', permanent' : ', 7-day auto-clear'})`).join('\n') : 'None — all clear'}

═══════════════════════════════════════
HOW CALISTRENGTH APP WORKS — COMPLETE GUIDE
═══════════════════════════════════════
CaliStrength is a premium calisthenics/bodyweight training app. Here is a COMPLETE guide to every feature:

📱 NAVIGATION:
- Sidebar (desktop): Dashboard, Workout, Progress, Activity, Weight, Skills, Daily Report, Analyzer, Records, Profile, Settings
- Bottom footer (mobile): Same navigation but compact icons
- Header: Page title + notification bell + search + sidebar toggle
- AI Coach (you!): Floating button bottom-right on every page

🏠 DASHBOARD (Home / Overview):
- Welcome greeting with user's name
- 3 stat cards: Day's Weight (links to /weight), Workout Day (shows Day N, links to /workout), Current Streak (fire icon)
- Today's Session card: Shows the current split (Push/Core/Pull/Legs), exercise list preview (first 5), duration, intensity, exercise count. "Start Session" button navigates to /workout
- Next Skill card: Shows the skill the user marked as their next goal from the Skills page
- Weekly Sessions ring chart: Shows X of 6 sessions completed this week (Mon-Sat)
- Latest PRs: Top 5 personal records
- Notification bell: Opens the notification panel drawer

💪 WORKOUT PAGE (/workout):
- Shows today's split based on the Push → Core → Pull → Legs rotation cycle
- Sunday is ALWAYS a rest day (no workout)
- Workout structure: Warmup exercises → Cardio → Main exercises → Cooldown/Stretch
- Each exercise shows: name, sets × reps (or hold time for isometric exercises)
- User clicks "Start Workout" to begin logging. A rest timer (configurable in settings, default 30 sec) runs between sets
- After each set, user enters their actual reps achieved
- Workout auto-saves to MySQL backend after completion
- Exercise plans adapt based on: user's Goal (gain/lose/fit), Experience Level (beginner/intermediate/advanced), and active Injuries

📊 PROGRESS PAGE (/progress):
- Weekly/Monthly/All-time activity bar charts
- Total reps trends over time
- Weight progress graph
- Muscle focus breakdown (how many Push vs Pull vs Legs vs Core sessions)

🏆 PERSONAL RECORDS (/records):
- Lists every exercise with the user's best (highest reps) performance
- Searchable exercise list
- Progression chart for each exercise over time

⚖️ WEIGHT TRACKING (/weight):
- Cycle Status card: Shows Day X of ${appData?.targetDays || 30} (based on user's target: 30, 60, or 90 days)
- Daily Weight card with trend indicator (green arrow = good direction for goal, red = bad)
- Target Weight card showing how many kg to go
- Progress graph with bar chart of recent weights
- "Add Today's Weight" form — weight can ONLY be logged ONCE per day. A confirmation popup appears with a 3-second delay before the Add button activates
- Weight history table

📋 DAILY REPORT (/daily-report):
- Beautiful summary card of today's workout activity
- Shows split type, duration, total reps, calories burned
- Can be shared as an image (screenshot-friendly design)

🎯 SKILLS PAGE (/skills):
- Lists 12 calisthenics skills in 4 tiers: Beginner (Push Ups, Squats, Dead Hang), Intermediate (Dips, Pull Ups, L-Sit, Dragon Flag), Advanced (Handstand, Front Lever), Elite (Muscle Ups, Human Flag, Full Planche)
- User can mark skills as "ongoing" or "mastered"
- User can set a "Next Skill" which appears on the Dashboard
- Skill mastery is tracked and reported in weekly summaries

⚙️ SETTINGS (/settings):
- General tab: Fitness Goal (Gain/Lose/Stay Fit), Experience Level, Rest Timer, Injury management, Theme (Dark/Light mode)
- Account tab: Name, Age, Gender, Height, Current Weight, Target Weight, Role, Bio
- Privacy tab: Email (read-only), Phone, Change Password
- "Start New Journey" (Reset App): Deletes all workout/weight/progress data from the database but preserves the user's account and onboarding data. The last recorded weight carries over as Day 1's weight for the new journey
- Log Out: Confirmation popup before signing out

🔔 NOTIFICATIONS:
- Weekly Performance Report (every Sunday): Sessions count, total reps, weight change, top muscle group, PRs achieved, skills mastered, coach's motivational note
- Final Journey Report: When the user reaches their target day (30, 60, or 90), a comprehensive detailed report is generated covering the entire journey
- Achievement badges: Streak milestones (7+ days), Iron Grip (10+ pull-up sessions), Core of Steel (5+ core sessions)
- Inactivity warnings (3+ days without workout)
- Today's session reminder
- Welcome notification for new users

🔄 JOURNEY SYSTEM:
- Users set a target duration during onboarding: 30, 60, or 90 days
- The app tracks their Day number (Day 1, Day 2, etc.) from their start date
- On the final day (target day), a comprehensive Journey Report is generated
- Users can "Reset & Start Fresh" from Settings to begin a new journey
- When resetting, the last weight carries over so Day 1 of the new journey starts where the previous one ended

═══════════════════════════════════════
YOUR BEHAVIOR RULES
═══════════════════════════════════════
1. You are ${name}'s personal AI fitness coach. ALWAYS use their name naturally in conversation.
2. ONLY answer questions about: exercise, calisthenics, gym training, diet, nutrition, calories, weight management, sports performance, recovery, stretching, and anything health/fitness related.
3. If asked ANYTHING unrelated (coding, movies, news, math, general knowledge, technology, etc.), respond ONLY with: "I'm your fitness coach ${name}! I can only help with workouts, diet, nutrition, and health-related topics. What fitness question can I help you with?"
4. NEVER reveal or discuss: API keys, technology stack, how you work internally, that you are an AI language model, Groq, React, JavaScript, or any technical implementation details. If asked, say: "I'm your CaliStrength Coach — let's focus on your training!"
5. Use their complete profile data to give highly personalized answers. Reference their actual weight, goals, exercise history, and PRs when relevant.
6. Keep answers: short, practical, motivating, easy to follow. Use bullet points. Sound like a real coach, not a robot.
7. If the user says HI or hello:
${inactiveDays > 0
      ? `   - You MUST say: "Hey ${name}! I noticed you've been away for ${inactiveDays} day(s) — is everything okay? Remember, consistency is key! Let's get back on track. What can I help you with today?"`
      : `   - Greet warmly: "Hey ${name}! Good to see you. I'm your CaliStrength Coach — how can I help you crush your goals today?"`}
8. When giving calorie/macro advice, ALWAYS calculate based on their actual weight (${latestWeight || '?'}kg), height (${height || '?'}cm), age (${age || '?'}), and goal (${goalStr}).
9. When recommending exercises, consider their experience level (${experience}) and any active injuries.
10. If they ask about their progress, reference their actual data: ${grandTotalReps} total reps, ${totalWorkouts} workouts, streak of ${streak} days.

═══════════════════════════════════════
INJURY MANAGEMENT PROTOCOL
═══════════════════════════════════════
PHASE 1 — When user mentions ANY injury (neck, shoulder, elbow, wrist, back, knee, etc.):
- Show empathy and ask: "I understand ${name}. Would you like me to completely remove exercises that could trigger pain, or would you prefer to keep them but switch to light, controlled movements?"
- 🛑 DO NOT output any [ADD_INJURY] commands in Phase 1!

PHASE 2 — After user responds:
- "Remove" / "can't do it" → Output: [ADD_INJURY:bodypart] and tell them: "Done ${name}! I've removed all exercises that could aggravate your ${'{bodypart}'} for 7 days. Your workout split has been automatically adjusted with safe alternatives."
- "Light movements" / "I can still do light" → Output: [ADD_LIGHT_INJURY:bodypart] and tell them: "Got it ${name}! I've switched affected exercises to lighter versions with reduced reps for 7 days. Listen to your body and stop if anything hurts."

RECOVERY — When user says they're healed:
- Phase 1: "That's amazing ${name}! Ready to bring back all your exercises?"
- Phase 2 (after YES): Output [CLEAR_INJURY:bodypart] or [CLEAR_ALL_INJURIES] and say: "Welcome back to full power ${name}! Your complete workout plan is restored."

SPECIFIC EXERCISE REMOVAL:
- If user just wants to completely remove/skip a specific exercise (e.g. "remove burpees" or "I don't want to do pushups"):
- Output: [REMOVE_EXERCISE:exercise_name] (e.g. [REMOVE_EXERCISE:Burpees]) and say: "Done ${name}! I've removed that exercise from your plan."

HIDDEN COMMANDS (never show these to user, they are stripped from your response):
[ADD_INJURY:knee] [ADD_LIGHT_INJURY:shoulder] [CLEAR_INJURY:knee] [CLEAR_ALL_INJURIES] [REMOVE_EXERCISE:Burpees]

═══════════════════════════════════════
TONE & PERSONALITY
═══════════════════════════════════════
- Motivating, real coach energy. Like a friend who's also your trainer.
- Examples: "You're killing it ${name}!", "Stay consistent, the results will follow!", "Let's make today count!"
- NEVER give medical advice. Only safe fitness guidance. If something sounds medical, say: "I'd recommend seeing a doctor for that ${name}. I can help adjust your workouts in the meantime."
- Be concise. No walls of text unless they ask for a detailed plan.`
}

// ── FORMAT AI TEXT ──
function formatMsg(text) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**'))
        return <strong key={i}>{line.slice(2, -2)}</strong>
      if (line.match(/^\d+\./))
        return <span key={i} className={styles.listItem}>{line}</span>
      if (line.startsWith('💡'))
        return <span key={i} className={styles.tip}>{line}</span>
      if (line.startsWith('•') || line.startsWith('-'))
        return <span key={i} className={styles.bullet}>{line}</span>
      if (line === '') return <br key={i} />
      return <span key={i}>{line}</span>
    })
}

// ── QUICK CHIPS ──
const QUICK_QUESTIONS = [
  "Today's workout",
  'I have an injury',
  'Calories?',
  'Push day plan',
  'Protein sources',
  'Recovery tips',
]

export default function AIWidget() {
  const { appData } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [chatState, setChatState] = useState(() => loadChatState())
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const bottomRef = useRef(null)
  const messagesRef = useRef(null)
  const inputRef = useRef(null)
  const busyRef = useRef(false)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBtn(false)
  }, [chatState.messages, typing])

  // Scroll to bottom instantly when opening + focus input
  useEffect(() => {
    if (open) {
      setUnread(0)
      // Instant scroll to bottom on open
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'instant' })
        inputRef.current?.focus()
      }, 50)
    }
  }, [open])

  // Track scroll position to show/hide "jump to latest" button
  const handleMessagesScroll = useCallback(() => {
    const el = messagesRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }, [])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBtn(false)
  }, [])

  // ── SEND MESSAGE ──
  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || busyRef.current) return

    setInput('')
    const newState = { ...chatState, injuries: chatState.injuries.map(i => ({...i})) }
    newState.messages = [...newState.messages, { role: 'user', content: msg }]
    setChatState({ ...newState })
    saveChatState(newState)

    busyRef.current = true
    setTyping(true)

    try {
      const systemPrompt = buildSystemPrompt(appData)
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newState.messages.slice(-20)
          ]
        })
      })

      const data = await res.json()
      setTyping(false)

      if (data.error) {
        const errMsg = data.error.message || 'Unknown error'
        newState.messages = [...newState.messages, { role: 'assistant', content: `Error: ${errMsg}` }]
        setChatState({ ...newState })
        saveChatState(newState)
      } else {
        let reply = data.choices?.[0]?.message?.content || 'Something went wrong. Try again.'

        // Parse commands from AI response
        const cmdRegex = /\[(ADD_INJURY|ADD_LIGHT_INJURY|CLEAR_INJURY|CLEAR_ALL_INJURIES|REMOVE_EXERCISE):?([^\]]*)\]/g
        
        // Execute all commands found
        const matches = [...reply.matchAll(cmdRegex)]
        let injuryChanged = false
        let changedDetail = null
        matches.forEach(match => {
          const [fullMatch, cmd, part] = match
          applyCommand(cmd, part, newState)
          injuryChanged = true
          changedDetail = { command: cmd, part: part?.trim() }
        })

        // ── FALLBACK: If AI didn't output command tags but response implies action ──
        if (matches.length === 0) {
          const replyLower = reply.toLowerCase()
          const isLightAction = replyLower.includes('lighter') || replyLower.includes('light mode') ||
            replyLower.includes('reduced reps') || replyLower.includes('light version') ||
            replyLower.includes('switched affected') || replyLower.includes('reduced sets') ||
            replyLower.includes('lighter versions')
          const isRemoveAction = replyLower.includes('removed all exercises') || replyLower.includes('safe alternatives') ||
            replyLower.includes('removed exercises') || replyLower.includes('automatically adjusted') ||
            replyLower.includes("i've removed")
          const isClearAction = replyLower.includes('fully restored') || replyLower.includes('full power') ||
            replyLower.includes('workout plan is restored') || replyLower.includes('cleared all') ||
            replyLower.includes('welcome back') || replyLower.includes('glad you') ||
            replyLower.includes('great to hear') || replyLower.includes('back to full') ||
            replyLower.includes('exercises are restored') || replyLower.includes('no more restrictions')

          // Also detect recovery phrases from user's recent messages
          const recentUserMsgs = newState.messages.filter(m => m.role === 'user').slice(-3).map(m => m.content.toLowerCase()).join(' ')
          const userSaysRecovered = recentUserMsgs.includes('i\'m fine') || recentUserMsgs.includes('im fine') ||
            recentUserMsgs.includes('feeling better') || recentUserMsgs.includes('i\'m kidding') ||
            recentUserMsgs.includes('im kidding') || recentUserMsgs.includes('healed') ||
            recentUserMsgs.includes('recovered') || recentUserMsgs.includes('all good') ||
            recentUserMsgs.includes('no injury') || recentUserMsgs.includes('just kidding') ||
            recentUserMsgs.includes('i was joking') || recentUserMsgs.includes('no more injury') ||
            recentUserMsgs.includes('cancel injury') || recentUserMsgs.includes('remove injury')

          // If user said they're recovered AND AI confirmed, clear injuries
          if (userSaysRecovered && (isClearAction || replyLower.includes('glad') || replyLower.includes('awesome') || replyLower.includes('amazing') || replyLower.includes('that\'s great'))) {
            if (newState.injuries.length > 0) {
              const contextText = [...newState.messages.slice(-6).map(m => m.content), reply].join(' ').toLowerCase()
              const detectedPart = BODY_PARTS.find(p => contextText.includes(p))
              if (detectedPart) {

                applyCommand('CLEAR_INJURY', detectedPart, newState)
                injuryChanged = true
                changedDetail = { command: 'CLEAR_INJURY', part: detectedPart }
              } else {

                applyCommand('CLEAR_ALL_INJURIES', '', newState)
                injuryChanged = true
                changedDetail = { command: 'CLEAR_ALL_INJURIES', part: '' }
              }
            }
          } else if (isLightAction || isRemoveAction || isClearAction) {
            // Scan recent messages + reply for a body part
            const contextText = [...newState.messages.slice(-6).map(m => m.content), reply].join(' ').toLowerCase()
            const detectedPart = BODY_PARTS.find(p => contextText.includes(p))

            if (detectedPart) {
              let fallbackCmd = 'ADD_INJURY'
              if (isLightAction) fallbackCmd = 'ADD_LIGHT_INJURY'
              if (isClearAction) fallbackCmd = 'CLEAR_INJURY'
              

              applyCommand(fallbackCmd, detectedPart, newState)
              injuryChanged = true
              changedDetail = { command: fallbackCmd, part: detectedPart }
            } else if (isClearAction) {

              applyCommand('CLEAR_ALL_INJURIES', '', newState)
              injuryChanged = true
              changedDetail = { command: 'CLEAR_ALL_INJURIES', part: '' }
            }
          }
        }

        // Remove commands from visible text
        reply = reply.replace(cmdRegex, '').trim()

        newState.messages = [...newState.messages, { role: 'assistant', content: reply }]

        // Show unread badge if chat is closed
        if (!open) setUnread(prev => prev + 1)

        setChatState({ ...newState })
        saveChatState(newState, changedDetail)

        // If an injury command was processed, close chat and navigate to workout
        if (injuryChanged) {
          setTimeout(() => {
            setOpen(false)
            navigate('/workout')
          }, 1800)
        }
      }
    } catch {
      setTyping(false)
      newState.messages = [...newState.messages, { role: 'assistant', content: 'Network error. Check your connection and try again.' }]
      setChatState({ ...newState })
      saveChatState(newState)
    }

    busyRef.current = false
  }, [input, chatState, appData, open, navigate])

  // ── CLEAR CHAT ──
  const clearChat = useCallback(() => {
    const fresh = { messages: [], injuries: chatState.injuries }
    setChatState(fresh)
    saveChatState(fresh)
  }, [chatState.injuries])

  // ── REMOVE INJURY ──
  const removeInjury = useCallback((index) => {
    const updated = { ...chatState }
    updated.injuries = [...updated.injuries]
    updated.injuries.splice(index, 1)
    setChatState(updated)
    saveChatState(updated)
  }, [chatState])

  // ── TOGGLE PERMANENT ──
  const togglePermanent = useCallback((index) => {
    const updated = { ...chatState }
    updated.injuries = [...updated.injuries]
    updated.injuries[index] = { ...updated.injuries[index], permanent: !updated.injuries[index].permanent }
    setChatState(updated)
    saveChatState(updated)
  }, [chatState])

  const userName = appData?.profile?.name || 'User'
  const userInitials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Coach"
      >
        <span className="material-symbols-outlined">
          {open ? 'close' : 'smart_toy'}
        </span>
        {!open && <span className={styles.triggerLabel}>AI Coach</span>}
        {!open && unread > 0 && <span className={styles.badge}>{unread}</span>}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <div className={styles.botAvatar}>
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div>
                <p className={styles.botName}>CaliStrength Coach</p>
                <p className={styles.botStatus}>
                  <span className={styles.onlineDot} />
                  AI · Fitness · Diet · Injury Support
                </p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.headerBtn} onClick={clearChat} title="Clear chat">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <button className={styles.headerBtn} onClick={() => setOpen(false)} title="Close">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
          </div>

          {/* Injury Bar */}
          {chatState.injuries.length > 0 && (
            <div className={styles.injuryBar}>
              <span className={styles.injLabel}>Injuries:</span>
              <div className={styles.injTags}>
                {chatState.injuries.map((inj, i) => (
                  <span key={i} className={styles.injTag} title={`${inj.mode === 'light' ? 'Light mode' : 'Remove mode'}${inj.permanent ? ' · Permanent' : ' · Active 7 days'}`}
                    style={inj.mode === 'light' ? { borderColor: '#f59e0b' } : {}}
                  >
                    <button
                      className={styles.injPermBtn}
                      onClick={() => togglePermanent(i)}
                      style={{ color: inj.permanent ? '#ef4444' : 'rgba(255,255,255,0.4)' }}
                      title="Toggle Permanent"
                    >P</button>
                    {inj.mode === 'light' ? '⚡ ' : '🚫 '}{inj.part}
                    <button className={styles.injRemoveBtn} onClick={() => removeInjury(i)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className={styles.messages} ref={messagesRef} onScroll={handleMessagesScroll}>
            {chatState.messages.length === 0 && (
              <div className={`${styles.msgRow} ${styles.botRow}`}>
                <div className={styles.smallAvatar}>
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div className={`${styles.bubble} ${styles.botBubble}`}>
                  <span>Hey {userName}! 👋 I&apos;m your AI Calisthenics Coach. Ask me anything about exercises, workouts, diet, or injuries!</span>
                </div>
              </div>
            )}

            {chatState.messages.map((m, i) => (
              <div key={i} className={`${styles.msgRow} ${m.role === 'user' ? styles.userRow : styles.botRow}`}>
                {m.role !== 'user' && (
                  <div className={styles.smallAvatar}>
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                )}
                <div className={`${styles.bubble} ${m.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                  {formatMsg(m.content)}
                </div>
                {m.role === 'user' && (
                  <div className={`${styles.smallAvatar} ${styles.userAvatar}`}>
                    {userInitials}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className={`${styles.msgRow} ${styles.botRow}`}>
                <div className={styles.smallAvatar}>
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div className={`${styles.bubble} ${styles.botBubble} ${styles.typingBubble}`}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Jump to latest button */}
          {showScrollBtn && (
            <button className={styles.jumpToLatest} onClick={scrollToBottom}>
              <span className="material-symbols-outlined">keyboard_double_arrow_down</span>
            </button>
          )}

          {/* Quick Chips */}
          {chatState.messages.length === 0 && (
            <div className={styles.quickRow}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} className={styles.quickBtn} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.chatInput}
              placeholder="Ask your AI coach..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              className={`${styles.sendBtn} ${(!input.trim() || typing) ? styles.sendDisabled : ''}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
