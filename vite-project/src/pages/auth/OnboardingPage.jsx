import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { formatDateStandard } from '../../utils/dateUtils'
import styles from './OnboardingPage.module.css'
import lightLogo from '../../assets/Logo/Light theme logo.png'
import darkLogo from '../../assets/Logo/Dark theme logo.png'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function OnboardingPage() {
  const { theme, setAppData } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genMessage, setGenMessage] = useState('Analyzing your fitness level and goals...')

  const [formData, setFormData] = useState({
    goal: '',
    experience: '',
    gender: 'male',
    age: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    targetDays: '30'
  })

  const [bfResult, setBfResult] = useState(null)

  const handleNextToStep2 = () => {
    if (!formData.goal || !formData.experience || !formData.age) {
      alert('Please fill missing fields.')
      return
    }
    setStep(2)
  }

  const handleNextToStep3 = () => {
    const w = parseFloat(formData.currentWeight)
    const h = parseFloat(formData.height)
    const age = parseInt(formData.age)
    const gender = formData.gender

    if (!w || !h || !age) {
      alert('Please input weight and height.')
      return
    }

    const heightM = h / 100
    const bmi = w / (heightM * heightM)
    const genderFactor = gender === 'male' ? 1 : 0
    const bf = (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4

    setBfResult({ bmi, bf })
    setTimeout(() => setStep(3), 1500)
  }

  const handleCompleteSetup = async (e) => {
    e.preventDefault()

    let goalVal = formData.goal
    if (goalVal === 'maintain') goalVal = 'fit'

    const currentW = parseFloat(formData.currentWeight)
    const targetW  = parseFloat(formData.targetWeight)
    const dateStr  = formatDateStandard(new Date())

    // ── 1. Save to MySQL via your backend ──────────────────────────────────
    try {
      const token = localStorage.getItem('cs_token')
      if (token) {
        const res = await fetch(`${API}/auth/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            goal:            goalVal,
            experience:      formData.experience,
            gender:          formData.gender,
            age:             parseInt(formData.age),
            height_cm:       parseFloat(formData.height),
            current_weight:  currentW,
            target_weight:   targetW,
            target_days:     parseInt(formData.targetDays),
            start_date:      dateStr,
          }),
        })
        if (res.ok) {
          // Update stored user as onboarded
          const stored = JSON.parse(localStorage.getItem('cs_user') || '{}')
          stored.is_onboarded = true
          localStorage.setItem('cs_user', JSON.stringify(stored))
        } else {
          const err = await res.json()
          console.error('Onboarding API error:', err)
        }
      }
    } catch (err) {
      console.error('Failed to save onboarding to backend:', err)
      // Still continue — don't block the user
    }

    // ── 2. Also save locally so the rest of the app still works ────────────
    // Get real user name/email from Firebase auth data
    const storedUser = JSON.parse(localStorage.getItem('cs_user') || '{}')

    const initialData = {
      isNewUser: false,
      theme: 'dark',
      goal: goalVal,
      experience: formData.experience,
      targetDays: formData.targetDays,
      gender: formData.gender,
      age: formData.age,
      height: formData.height,
      targetweight: targetW,
      startDate: dateStr,
      weightHistory: [{ date: dateStr, weight: currentW }],
      profile: {
        name: storedUser.name || storedUser.displayName || 'Athlete',
        role: 'Athlete',
        email: storedUser.email || '',
        avatar: storedUser.avatar || storedUser.photoURL || '',
        age: formData.age,
        height: formData.height,
        gender: formData.gender,
        targetWeight: targetW,
        bodyFat: bfResult ? bfResult.bf.toFixed(1) : '15'
      },
      allExerciseReps: [],
      dailyLogs: {},
      skills: {},
      restTime: 30
    }

    setAppData(initialData)
    setIsGenerating(true)
  }

  useEffect(() => {
    if (isGenerating) {
      const msgs = [
        'Selecting exercises matched to your experience...',
        'Adjusting sets & reps for your weight and age...',
        'Designing your Push Day workout...',
        'Designing your Pull Day workout...',
        'Designing your Leg Day workout...',
        'Finalizing your personalized plan...'
      ]
      let msgIdx = 0
      const interval = setInterval(() => {
        if (msgIdx < msgs.length) {
          setGenMessage(msgs[msgIdx])
          msgIdx++
        }
      }, 800)

      setTimeout(() => {
        clearInterval(interval)
        navigate('/')
      }, 5500)
    }
  }, [isGenerating, navigate])

  return (
    <div className={styles.pageContainer}>
      <div className={styles.onboardingCard}>
        <div style={{ marginBottom: '2.5rem' }}>
          <img src={theme === 'dark' ? darkLogo : lightLogo} alt="CaliStrength Logo" className={styles.logoImg} />
          <p style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Welcome to CaliStrength
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>

          {step === 1 && (
            <div>
              <div className={styles.formGroup}>
                <label>Primary Goal</label>
                <select className={styles.formInput} value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})} required>
                  <option value="" disabled>Select your goal...</option>
                  <option value="gain">Gain Muscle / Weight</option>
                  <option value="lose">Lose Body Fat</option>
                  <option value="maintain">Stay Fit</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Experience Level</label>
                <select className={styles.formInput} value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})} required>
                  <option value="" disabled>What's your fitness background?</option>
                  <option value="beginner">Beginner (New to exercise)</option>
                  <option value="intermediate">Intermediate (Some gym knowledge)</option>
                  <option value="advanced">Advanced (Experienced athlete)</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Gender</label>
                  <select className={styles.formInput} value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})} required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Age</label>
                  <input type="number" className={styles.formInput} placeholder="e.g. 21"
                    value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required />
                </div>
              </div>
              <button type="button" className={styles.btnStart} onClick={handleNextToStep2}>Next</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className={styles.formGroup} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Current Weight (kg)</label>
                  <input type="number" step="0.1" className={styles.formInput} placeholder="e.g. 75"
                    value={formData.currentWeight} onChange={(e) => setFormData({...formData, currentWeight: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Target Weight (kg)</label>
                  <input type="number" step="0.1" className={styles.formInput} placeholder="e.g. 80"
                    value={formData.targetWeight} onChange={(e) => setFormData({...formData, targetWeight: e.target.value})} required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Height (cm)</label>
                <input type="number" step="0.1" className={styles.formInput} placeholder="e.g. 175"
                  value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} required />
              </div>

              {bfResult && (
                <div className={styles.bodyFatResult}>
                  Estimated BMI: <strong>{bfResult.bmi.toFixed(1)}</strong> <br/>
                  Estimated Body Fat: <strong>~{bfResult.bf.toFixed(1)}%</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
                <button type="button" className={styles.btnStart} onClick={handleNextToStep3} style={{ flex: 2 }}>Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className={styles.formGroup}>
                <label>Target Duration (Days)</label>
                <select className={styles.formInput} value={formData.targetDays}
                  onChange={(e) => setFormData({...formData, targetDays: e.target.value})}>
                  <option value="30">30 Days (Short Term Sync)</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days (Full Transformation)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className={styles.btnSecondary} onClick={() => setStep(2)} style={{ flex: 1 }}>Back</button>
                <button type="button" className={styles.btnStart} onClick={handleCompleteSetup} style={{ flex: 2 }}>Complete Setup</button>
              </div>
            </div>
          )}

        </form>
      </div>

      {isGenerating && (
        <div className={styles.aiGenOverlay}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
            <span className={`material-symbols-outlined ${styles.genIcon}`}>auto_awesome</span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'var(--font-main)', fontSize: '1.25rem', margin: 0 }}>
            Building Your Custom Plan
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontFamily: 'var(--font-main)', textAlign: 'center', maxWidth: '300px', margin: 0 }}>
            {genMessage}
          </p>
          <div className={styles.genDots}>
            <div className={styles.genDot}></div>
            <div className={styles.genDot}></div>
            <div className={styles.genDot}></div>
          </div>
        </div>
      )}
    </div>
  )
}
