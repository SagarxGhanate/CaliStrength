import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../components/layout/AppHeader'
import ConfirmPopup from '../../components/ui/ConfirmPopup'
import { useApp } from '../../context/AppContext'
import { signOut, changeUserPassword } from '../../lib/firebase'
import { sendEmail } from '../../lib/email'
import { formatDateStandard, toLocalDateStr } from '../../utils/dateUtils'
import styles from './SettingPage.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/** Persist settings to MySQL so they survive refreshes */
async function saveToBackend(payload) {
  const token = localStorage.getItem('cs_token')
  if (!token) return
  try {
    const res = await fetch(`${API}/auth/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.warn('[Settings] Backend save failed:', res.status)
  } catch (err) {
    console.warn('[Settings] Backend save error:', err.message)
  }
}

export default function SettingPage() {
  const { appData, setAppData, theme, setTheme } = useApp()
  const navigate = useNavigate()
  const { profile = {}, goal = 'gain', level = 'beginner', restTime = 90 } = appData
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showWeightConfirm, setShowWeightConfirm] = useState(false)
  const [pendingAccountSave, setPendingAccountSave] = useState(null)

  // Pull user info from Firebase auth storage as fallback
  const storedUser = JSON.parse(localStorage.getItem('cs_user') || '{}')

  // Local State for Tabs — merge profile + top-level appData + cs_user
  const [localProfile, setLocalProfile] = useState({
    name: (profile.name && profile.name !== 'Athlete' ? profile.name : '') || storedUser.name || storedUser.displayName || '',
    email: profile.email || storedUser.email || '',
    avatar: profile.avatar || storedUser.avatar || storedUser.photoURL || '',
    age: profile.age || appData.age || '',
    height: profile.height || appData.height || '',
    gender: profile.gender || appData.gender || 'male',
    role: profile.role || 'Athlete',
    bio: profile.bio || '',
    phone: profile.phone || '',
    targetWeight: profile.targetWeight || appData.targetweight || '',
    bodyFat: profile.bodyFat || '',
    currentWeight: appData.weightHistory?.length ? appData.weightHistory.at(-1).weight : (profile.targetWeight || ''),
  })
  const [localGoal, setLocalGoal] = useState(goal)
  const [localLevel, setLocalLevel] = useState(level)
  const [localRestTime, setLocalRestTime] = useState(restTime)
  const [localTheme, setLocalTheme] = useState(theme)
  const [localInjuriesCleared, setLocalInjuriesCleared] = useState(false)

  // Password change state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [injuryRefreshCount, setInjuryRefreshCount] = useState(0)
  useEffect(() => {
    const handleUpdate = () => setInjuryRefreshCount(c => c + 1)
    window.addEventListener('injuryUpdate', handleUpdate)
    return () => window.removeEventListener('injuryUpdate', handleUpdate)
  }, [])

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.')
      return
    }

    setIsChangingPassword(true)
    try {
      await changeUserPassword(oldPassword, newPassword)

      // Send password changed email
      if (localProfile.email) {
        await sendEmail({
          to_email: localProfile.email,
          subject: 'Password Changed - CaliStrength',
          message: `Your password was successfully changed.\n\nYour new password is: ${newPassword}\n\nIf you did not make this change, please contact CaliStrength Support immediately.`
        })
      }

      setPasswordSuccess('Password successfully updated!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Password change error:', err)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setPasswordError('Incorrect current password.')
      } else if (err.code === 'auth/too-many-requests') {
        setPasswordError('Too many failed attempts. Please try again later.')
      } else {
        setPasswordError(err.message || 'Failed to update password. Ensure you are signed in with email.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveGeneral = async () => {
    setAppData({ ...appData, goal: localGoal, level: localLevel, restTime: localRestTime })
    setTheme(localTheme)

    // Persist to MySQL backend (includes onboarding fields)
    await saveToBackend({
      goal: localGoal,
      experience: localLevel,
      rest_time: localRestTime,
      theme: localTheme,
    })

    if (localInjuriesCleared) {
      try {
        const s = JSON.parse(localStorage.getItem('cs_ai_chat')) || { messages: [], injuries: [] }
        if (s.injuries && s.injuries.length > 0) {
          s.injuries = []
          localStorage.setItem('cs_ai_chat', JSON.stringify(s))
          window.dispatchEvent(new Event('injuryUpdate'))
        }
      } catch { /* empty */ }
    }

    alert('General settings saved!')
  }

  const doSaveAccount = async () => {
    // Also update weight history if currentWeight changed
    const w = parseFloat(localProfile.currentWeight)
    let newHistory = [...(appData.weightHistory || [])]

    if (!isNaN(w) && w > 0) {
      const dateStr = toLocalDateStr(new Date())
      const alreadyLoggedToday = newHistory.some(h => toLocalDateStr(h.date) === dateStr)

      if (alreadyLoggedToday) {
        // Just update today's entry
        const todayIdx = newHistory.findIndex(h => toLocalDateStr(h.date) === dateStr)
        if (todayIdx >= 0) newHistory[todayIdx].weight = w.toFixed(1)
      } else {
        newHistory.push({ date: dateStr, weight: w.toFixed(1) })
      }
    }

    setAppData({ ...appData, profile: localProfile, weightHistory: newHistory })

    // Persist to MySQL backend (includes onboarding fields)
    await saveToBackend({
      name: localProfile.name || undefined,
      avatar: localProfile.avatar || undefined,
      bio: localProfile.bio || undefined,
      phone: localProfile.phone || undefined,
      role: localProfile.role || undefined,
      age: localProfile.age ? parseInt(localProfile.age, 10) : undefined,
      height_cm: localProfile.height ? parseFloat(localProfile.height) : undefined,
      gender: localProfile.gender || undefined,
      target_weight: localProfile.targetWeight ? parseFloat(localProfile.targetWeight) : undefined,
    })

    alert('Account settings saved!')
  }

  const handleSaveAccount = async () => {
    const w = parseFloat(localProfile.currentWeight)
    const dateStr = toLocalDateStr(new Date())
    const alreadyLoggedToday = (appData.weightHistory || []).some(h => toLocalDateStr(h.date) === dateStr)

    // If weight changed and not logged today, show confirmation popup
    if (!isNaN(w) && w > 0 && !alreadyLoggedToday) {
      setPendingAccountSave(true)
      setShowWeightConfirm(true)
      return
    }

    await doSaveAccount()
  }

  const handleResetApp = async () => {
    // Call backend to delete user data (keeps onboarding + user account)
    const token = localStorage.getItem('cs_token')
    const lastWeight = (appData.weightHistory || []).length > 0
      ? appData.weightHistory[appData.weightHistory.length - 1].weight
      : null

    try {
      if (token) {
        await fetch(`${API}/auth/reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ carry_over_weight: lastWeight ? parseFloat(lastWeight) : null }),
        })
      }
    } catch (err) {
      console.warn('[Settings] Backend reset error:', err.message)
    }

    // Clear localStorage app data but keep auth
    localStorage.removeItem('caliStrengthData')
    localStorage.removeItem('cs_session_progress')
    localStorage.removeItem('cs_ai_chat')
    localStorage.removeItem('cs_ana_history')
    localStorage.removeItem('caliSkills')
    localStorage.removeItem('caliReadNotifs')
    setShowResetConfirm(false)
    window.location.href = '/'
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (err) {
      console.warn('Firebase sign-out error:', err)
    }
    // Clear all auth & app data from localStorage
    localStorage.removeItem('cs_token')
    localStorage.removeItem('cs_user')
    localStorage.removeItem('caliStrengthData')
    localStorage.removeItem('cs_session_progress')
    localStorage.removeItem('cs_ai_chat')
    localStorage.removeItem('cs_ana_history')
    localStorage.removeItem('caliSkills')
    localStorage.removeItem('caliReadNotifs')
    setShowLogoutConfirm(false)
    navigate('/login')
  }

  return (
    <>
      <AppHeader icon="settings" title="Settings" />

      <div className={styles.contentInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Personalize your CaliStrength training experience</p>
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'general' ? styles.active : ''}`}
            onClick={() => setActiveTab('general')}
          >General</button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'account' ? styles.active : ''}`}
            onClick={() => setActiveTab('account')}
          >Account</button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'privacy' ? styles.active : ''}`}
            onClick={() => setActiveTab('privacy')}
          >Privacy</button>
        </div>

        {activeTab === 'general' && (
          <div>
            <section className={styles.settingsSection}>
              <div className={styles.sectionHeading}>
                <span className="material-symbols-outlined">track_changes</span>
                <h3>Training Strategy</h3>
              </div>
              <div className={styles.prefsGrid}>
                <div className={styles.prefCard}>
                  <p className={styles.prefName}>Main Fitness Goal</p>
                  <p className={styles.prefDesc}>Updates your workout split automatically</p>
                  <select
                    className={styles.fieldInput}
                    style={{ marginTop: '0.5rem' }}
                    value={localGoal}
                    onChange={e => setLocalGoal(e.target.value)}
                  >
                    <option value="gain">Gain Weight</option>
                    <option value="lose">Lose Weight</option>
                    <option value="fit">Stay Fit</option>
                  </select>
                </div>
                <div className={styles.prefCard}>
                  <p className={styles.prefName}>Experience Level</p>
                  <p className={styles.prefDesc}>Sets your baseline exercise intensity</p>
                  <select
                    className={styles.fieldInput}
                    style={{ marginTop: '0.5rem' }}
                    value={localLevel}
                    onChange={e => setLocalLevel(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={styles.settingsSection} style={{ marginTop: '2rem' }}>
              <div className={styles.sectionHeading}>
                <span className="material-symbols-outlined">settings_accessibility</span>
                <h3>Workout & Safety</h3>
              </div>
              <div className={styles.prefsGrid}>
                <div className={`${styles.prefCard} ${styles.fieldFull}`}>
                  <div className={styles.prefRow}>
                    <div>
                      <p className={styles.prefName}>Rest Timer</p>
                      <p className={styles.prefDesc}>Default rest duration between sets (seconds)</p>
                    </div>
                    <div className={styles.restInputWrap}>
                      <input
                        type="number"
                        className={styles.restInput}
                        value={localRestTime}
                        onChange={e => setLocalRestTime(Number(e.target.value))}
                        min="10"
                        max="300"
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>sec</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    className={styles.restSlider}
                    min="10"
                    max="300"
                    value={localRestTime}
                    onChange={e => setLocalRestTime(Number(e.target.value))}
                  />
                </div>

                <div className={`${styles.prefCard} ${styles.fieldFull}`} data-refresh={injuryRefreshCount}>
                  <div className={styles.prefRow}>
                    <div>
                      <p className={styles.prefName}>Active Injuries</p>
                      <p className={styles.prefDesc} style={(() => {
                        try {
                          const s = JSON.parse(localStorage.getItem('cs_ai_chat'))
                          return (s?.injuries?.length > 0) ? { color: '#ef4444', fontWeight: 700 } : {}
                        } catch { return {} }
                      })()}>
                        {(() => {
                          try {
                            const s = JSON.parse(localStorage.getItem('cs_ai_chat'))
                            if (s?.injuries?.length > 0) {
                              return `Current injuries: ${s.injuries.map(i => i.part).join(', ')}`
                            }
                          } catch { /* empty */ }
                          return 'No active injuries reported'
                        })()}
                      </p>
                    </div>
                    <button
                      className={styles.btnTheme}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                      onClick={() => {
                        setLocalInjuriesCleared(true)
                        alert('Injuries will be cleared when you click Save General Settings.')
                      }}
                      disabled={localInjuriesCleared}
                    >{localInjuriesCleared ? 'Will clear on save' : 'Clear All'}</button>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.settingsSection} style={{ marginTop: '2rem' }}>
              <div className={styles.sectionHeading}>
                <span className="material-symbols-outlined">palette</span>
                <h3>Appearance</h3>
              </div>
              <div className={styles.appearanceCard}>
                <div className={styles.appearanceRow}>
                  <div className={styles.appearanceLeft}>
                    <div className={styles.themeIconWrap}>
                      <span className="material-symbols-outlined">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                    </div>
                    <div>
                      <p className={styles.prefName}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                      <p className={styles.prefDesc}>Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <button 
                    className={styles.btnTheme} 
                    onClick={() => {
                      const newTheme = theme === 'dark' ? 'light' : 'dark';
                      setTheme(newTheme);
                      setLocalTheme(newTheme); // Keep local state in sync just in case
                    }}
                  >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                </div>
              </div>
            </section>

            <footer className={styles.settingsFooter}>
              <button className={styles.btnSave} onClick={handleSaveGeneral}>Save General Settings</button>
            </footer>

            <div className={styles.dangerZone}>
              <h3 className={styles.dangerTitle}>Start New Journey</h3>
              <p className={styles.dangerDesc}>This will delete all your workout history, weight logs, streaks, and skill progress. Your onboarding data and account will be preserved. Your last weight will carry over as Day 1 weight of the new journey.</p>
              <button className={styles.btnDanger} onClick={() => setShowResetConfirm(true)}>
                <span className="material-symbols-outlined">restart_alt</span>
                Reset & Start Fresh
              </button>
            </div>
            <div className={styles.logoutSection}>
              <div className={styles.logoutInner}>
                <div className={styles.logoutInfo}>
                  <div className={styles.logoutIconWrap}>
                    <span className="material-symbols-outlined">logout</span>
                  </div>
                  <div>
                    <h3 className={styles.logoutTitle}>Sign Out</h3>
                    <p className={styles.logoutDesc}>Sign out of your CaliStrength account on this device</p>
                  </div>
                </div>
                <button className={styles.btnLogout} onClick={() => setShowLogoutConfirm(true)} disabled={isLoggingOut}>
                  <span className="material-symbols-outlined">{isLoggingOut ? 'hourglass_empty' : 'logout'}</span>
                  {isLoggingOut ? 'Signing Out…' : 'Log Out'}
                </button>
              </div>
            </div>

            <div className={styles.appVersion}>
              <p>CaliStrength React App v3.0.0</p>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div>
            <section className={styles.settingsSection}>
              <div className={styles.profileRow}>
                <div className={styles.avatarUpload}>
                  <div className={styles.avatarPreview}>
                    {localProfile.avatar ? (
                      <img src={localProfile.avatar} alt="Profile" />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <span className="material-symbols-outlined">person</span>
                      </div>
                    )}
                  </div>
                  <button className={styles.avatarEditBtn}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>

                <div className={styles.profileFields}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Full Name</label>
                    <input
                      type="text"
                      className={styles.fieldInput}
                      value={localProfile.name || ''}
                      onChange={e => setLocalProfile({ ...localProfile, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Age</label>
                    <input
                      type="number"
                      className={styles.fieldInput}
                      value={localProfile.age || ''}
                      onChange={e => setLocalProfile({ ...localProfile, age: e.target.value })}
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Role</label>
                    <select
                      className={styles.fieldInput}
                      value={localProfile.role || 'Athlete'}
                      onChange={e => setLocalProfile({ ...localProfile, role: e.target.value })}
                    >
                      <option value="Coach">Coach</option>
                      <option value="Athlete">Athlete</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Gender</label>
                    <select
                      className={styles.fieldInput}
                      value={localProfile.gender || 'male'}
                      onChange={e => setLocalProfile({ ...localProfile, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Height (cm)</label>
                    <input
                      type="number"
                      className={styles.fieldInput}
                      value={localProfile.height || ''}
                      onChange={e => setLocalProfile({ ...localProfile, height: e.target.value })}
                      placeholder="e.g. 175"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Current Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className={styles.fieldInput}
                      value={localProfile.currentWeight || ''}
                      onChange={e => setLocalProfile({ ...localProfile, currentWeight: e.target.value })}
                      placeholder="e.g. 75"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Target Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className={styles.fieldInput}
                      value={localProfile.targetWeight || ''}
                      onChange={e => setLocalProfile({ ...localProfile, targetWeight: e.target.value })}
                      placeholder="e.g. 70"
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                    <label className={styles.fieldLabel}>Bio</label>
                    <textarea
                      className={styles.fieldInput}
                      style={{ resize: 'vertical', minHeight: '4rem' }}
                      value={localProfile.bio || ''}
                      onChange={e => setLocalProfile({ ...localProfile, bio: e.target.value })}
                      placeholder="Short bio..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <footer className={styles.settingsFooter}>
              <button className={styles.btnSave} onClick={handleSaveAccount}>Save Account Details</button>
            </footer>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <section className={styles.settingsSection}>
              <div className={styles.sectionHeading}>
                <span className="material-symbols-outlined">lock</span>
                <h3>Account Information</h3>
              </div>
              <div className={styles.profileFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email Address</label>
                  <input type="email" className={styles.fieldInput} value={localProfile.email || ''} readOnly />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Phone Number</label>
                  <input
                    type="tel"
                    className={styles.fieldInput}
                    value={localProfile.phone || ''}
                    onChange={e => setLocalProfile({ ...localProfile, phone: e.target.value })}
                    placeholder="+91 9987525089"
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-main)' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Change Password</h4>
                {passwordError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{passwordError}</p>}
                {passwordSuccess && <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem' }}>{passwordSuccess}</p>}
                <div className={styles.profileFields}>
                  <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                    <label className={styles.fieldLabel}>Current Password</label>
                    <input
                      type="password"
                      className={styles.fieldInput}
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>New Password</label>
                    <input
                      type="password"
                      className={styles.fieldInput}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Confirm New Password</label>
                    <input
                      type="password"
                      className={styles.fieldInput}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  className={styles.btnSave}
                  style={{ marginTop: '1.5rem', opacity: isChangingPassword ? 0.7 : 1 }}
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </section>

            <footer className={styles.settingsFooter}>
              <button className={styles.btnSave} onClick={handleSaveAccount}>Save Privacy Details</button>
            </footer>
          </div>
        )}

      </div>

      {/* LOGOUT CONFIRMATION */}
      {showLogoutConfirm && (
        <ConfirmPopup
          icon="logout"
          iconColor="#ef4444"
          title="Sign Out?"
          message="Are you sure you want to sign out of your CaliStrength account? You'll need to log back in to access your data."
          confirmText="Log Out"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {/* RESET APP CONFIRMATION */}
      {showResetConfirm && (
        <ConfirmPopup
          icon="restart_alt"
          iconColor="#ef4444"
          title="Start New Journey?"
          message="This will permanently delete all workout history, weight logs, streaks, and skill progress. Your account and onboarding data will be preserved. Your last recorded weight will carry over as Day 1."
          confirmText="Reset & Start Fresh"
          cancelText="Cancel"
          delaySec={3}
          variant="danger"
          onConfirm={handleResetApp}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* WEIGHT CONFIRM ON ACCOUNT SAVE */}
      {showWeightConfirm && (
        <ConfirmPopup
          icon="monitor_weight"
          iconColor="var(--primary)"
          title="Confirm Weight Entry"
          message={`You are about to log ${parseFloat(localProfile.currentWeight).toFixed(1)} kg. Weight can only be added once per day — make sure the value is correct.`}
          confirmText="Save & Log Weight"
          cancelText="Cancel"
          delaySec={3}
          onConfirm={async () => { setShowWeightConfirm(false); await doSaveAccount() }}
          onCancel={() => { setShowWeightConfirm(false); setPendingAccountSave(null) }}
        />
      )}
    </>
  )
}
