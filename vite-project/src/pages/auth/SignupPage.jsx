import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { sendEmail } from '../../lib/email'
import { isAuthenticated, getStoredUser } from '../../lib/api'
import styles from './AuthPages.module.css'
import darkLogo from '../../assets/Logo/Dark theme logo.png'
import lightLogo from '../../assets/Logo/Light theme logo.png'

// Firebase — use centralized instance
import { auth } from '../../lib/firebase'
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SignupPage() {
  // If already logged in, skip signup and go straight to dashboard
  if (isAuthenticated()) {
    const user = getStoredUser()
    if (user && !user.is_onboarded) return <Navigate to="/onboarding" replace />
    return <Navigate to="/" replace />
  }

  const navigate = useNavigate()
  const { theme } = useApp()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  async function sendTokenToBackend(idToken) {
    const res = await fetch(`${API}/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Backend error')
    return data
  }

  function handleAuthSuccess(result) {
    localStorage.setItem('cs_token', result.access_token)
    localStorage.setItem('cs_user', JSON.stringify({
      id: result.user_id,
      name: result.name,
      email: result.email,
      avatar: result.avatar,
      is_onboarded: result.is_onboarded,
    }))
    // Store login timestamp for 30-day session expiry
    localStorage.setItem('cs_login_at', Date.now().toString())
    const existing = JSON.parse(localStorage.getItem('caliStrengthData') || '{}')
    existing.profile = {
      ...existing.profile,
      name: result.name,
      email: result.email,
      avatar: result.avatar || '',
    }
    localStorage.setItem('caliStrengthData', JSON.stringify(existing))

    // Returning user (already onboarded) → go straight to dashboard
    if (result.is_onboarded) {
      navigate('/')
    } else {
      navigate('/onboarding')
    }
  }

  // ── Email signup ─────────────────────────────────────────────────────────
  async function handleEmailSignup(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      // 1. Create user in Firebase
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await cred.user.getIdToken()

      // 2. Also register in your backend with the name
      // We call /auth/signup to store the name, then use the firebase token
      const signupRes = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const signupData = await signupRes.json()
      if (!signupRes.ok) throw new Error(signupData.detail || 'Signup failed')
      
      // Send welcome email with credentials
      await sendEmail({
        to_email: email,
        subject: '🔥 Welcome to CaliStrength — Your Account Details',
        message: `Welcome to CaliStrength, ${name}!\n\nYour account has been created successfully.\n\n📧 Email: ${email}\n🔑 Password: ${password}\n\nPlease save these credentials securely.\n\n🏋️ Start your calisthenics journey and track your progress!\n\nHappy training!\n— CaliStrength Team`
      })
      
      setSignupSuccess(true)
      setTimeout(() => {
        handleAuthSuccess(signupData)
      }, 1500)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Please log in.')
      } else if (msg.includes('weak-password')) {
        setError('Password is too weak. Use at least 6 characters.')
      } else {
        setError(msg || 'Sign up failed. Please try again.')
      }
      setLoading(false)
    }
  }

  // ── Google signup ─────────────────────────────────────────────────────────
  async function handleGoogleSignup() {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const backendResult = await sendTokenToBackend(idToken)
      
      setSignupSuccess(true)
      setTimeout(() => {
        handleAuthSuccess(backendResult)
      }, 1500)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-up failed.')
      }
      setLoading(false)
    }
  }

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard} style={{ position: 'relative' }}>
        
        {/* Loading / Success Overlay */}
        {(loading || signupSuccess) && (
          <div className={styles.authOverlay}>
            {signupSuccess ? (
              <div className={styles.successPopup}>
                <div className={styles.successIcon}>
                  <span className="material-symbols-outlined">check</span>
                </div>
                <h3>Signup Successful!</h3>
                <p>Welcome to CaliStrength</p>
              </div>
            ) : (
              <>
                <div className={styles.spinner}></div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Creating Account...</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.8 }}>Setting up your profile</p>
              </>
            )}
          </div>
        )}

        <div className={styles.authLogo}>
          <img src={theme === 'dark' ? darkLogo : lightLogo} alt="CaliStrength" />
          <p>Create your account</p>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleEmailSignup}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" className={styles.formInput} placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input type="email" className={styles.formInput} placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input type="password" className={styles.formInput} placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
          </div>
          <button type="submit" className={styles.btnBrand} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <button className={styles.btnGoogle} onClick={handleGoogleSignup} disabled={loading}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Please wait…' : 'Continue with Google'}
        </button>

        <p className={styles.toggleAuth}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
