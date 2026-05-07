import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './AuthPages.module.css'
import darkLogo from '../../assets/Logo/Dark theme logo.png'
import lightLogo from '../../assets/Logo/Light theme logo.png'

export default function SignupPage() {
  const navigate = useNavigate()
  const { theme } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSignup(e) {
    e.preventDefault()
    // Save basic profile, redirect to onboarding
    const existing = JSON.parse(localStorage.getItem('caliStrengthData') || '{}')
    const data = {
      ...existing,
      profile: { name: name || 'User', email, phone: '', dob: '', role: 'Athlete', avatar: '', bio: '' }
    }
    localStorage.setItem('caliStrengthData', JSON.stringify(data))
    navigate('/onboarding')
  }

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <img src={theme === 'dark' ? darkLogo : lightLogo} alt="CaliStrength" />
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" className={styles.formInput} placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input type="email" className={styles.formInput} placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input type="password" className={styles.formInput} placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.btnBrand}>Create Account</button>
        </form>

        <p className={styles.toggleAuth}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
