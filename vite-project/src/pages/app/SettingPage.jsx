import { useState, useEffect } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import { formatDateStandard } from '../../utils/dateUtils'
import styles from './SettingPage.module.css'

export default function SettingPage() {
  const { appData, setAppData, theme, toggleTheme } = useApp()
  const { profile = {}, goal = 'gain', level = 'beginner', restTime = 90 } = appData
  const [activeTab, setActiveTab] = useState('general')

  // Local State for Tabs
  const [localProfile, setLocalProfile] = useState({
    ...profile,
    currentWeight: appData.weightHistory?.length ? appData.weightHistory.at(-1).weight : (profile.targetWeight || '')
  })
  const [localGoal, setLocalGoal] = useState(goal)
  const [localLevel, setLocalLevel] = useState(level)
  const [localRestTime, setLocalRestTime] = useState(restTime)
  
  const [injuryRefreshCount, setInjuryRefreshCount] = useState(0)
  useEffect(() => {
    const handleUpdate = () => setInjuryRefreshCount(c => c + 1)
    window.addEventListener('injuryUpdate', handleUpdate)
    return () => window.removeEventListener('injuryUpdate', handleUpdate)
  }, [])

  const handleSaveGeneral = () => {
    setAppData({ ...appData, goal: localGoal, level: localLevel, restTime: localRestTime })
    alert('General settings saved!')
  }

  const handleSaveAccount = () => {
    // Also update weight history if currentWeight changed
    const w = parseFloat(localProfile.currentWeight)
    let newHistory = [...(appData.weightHistory || [])]
    
    if (!isNaN(w) && w > 0) {
      const dateStr = formatDateStandard(new Date())
      const todayIdx = newHistory.findIndex(h => h.date === dateStr)
      if (todayIdx >= 0) newHistory[todayIdx].weight = w.toFixed(1)
      else newHistory.push({ date: dateStr, weight: w.toFixed(1) })
    }

    setAppData({ ...appData, profile: localProfile, weightHistory: newHistory })
    alert('Account settings saved!')
  }

  const handleResetApp = () => {
    if (window.confirm("Are you sure? This will delete all your workout history and progress. This cannot be undone.")) {
      localStorage.removeItem('caliStrengthData')
      window.location.href = '/login'
    }
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
                        try {
                          const s = JSON.parse(localStorage.getItem('cs_ai_chat')) || { messages: [], injuries: [] }
                          if (s.injuries && s.injuries.length > 0) {
                            s.injuries = []
                            localStorage.setItem('cs_ai_chat', JSON.stringify(s))
                            window.dispatchEvent(new Event('injuryUpdate'))
                            alert('All injuries cleared! Full workout split restored.')
                          }
                        } catch { /* empty */ }
                      }}
                    >Clear All</button>
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
                  <button className={styles.btnTheme} onClick={toggleTheme}>
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                </div>
              </div>
            </section>

            <footer className={styles.settingsFooter}>
              <button className={styles.btnSave} onClick={handleSaveGeneral}>Save General Settings</button>
            </footer>

            <div className={styles.dangerZone}>
              <h3 className={styles.dangerTitle}>Reset App</h3>
              <p className={styles.dangerDesc}>This will delete all your workout history, weight logs, streaks, and skill progress. This cannot be undone.</p>
              <button className={styles.btnDanger} onClick={handleResetApp}>
                <span className="material-symbols-outlined">restart_alt</span>
                Reset & Start Fresh
              </button>
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
                      onChange={e => setLocalProfile({...localProfile, name: e.target.value})} 
                      placeholder="Your name" 
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Age</label>
                    <input 
                      type="number" 
                      className={styles.fieldInput} 
                      value={localProfile.age || ''} 
                      onChange={e => setLocalProfile({...localProfile, age: e.target.value})} 
                      placeholder="e.g. 25" 
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Role</label>
                    <select 
                      className={styles.fieldInput} 
                      value={localProfile.role || 'Athlete'} 
                      onChange={e => setLocalProfile({...localProfile, role: e.target.value})}
                    >
                      <option value="Coach">Coach</option>
                      <option value="Athlete">Athlete</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Height (cm)</label>
                    <input 
                      type="number" 
                      className={styles.fieldInput} 
                      value={localProfile.height || ''} 
                      onChange={e => setLocalProfile({...localProfile, height: e.target.value})} 
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
                      onChange={e => setLocalProfile({...localProfile, currentWeight: e.target.value})} 
                      placeholder="e.g. 75" 
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                    <label className={styles.fieldLabel}>Bio</label>
                    <textarea 
                      className={styles.fieldInput} 
                      style={{ resize: 'vertical', minHeight: '4rem' }} 
                      value={localProfile.bio || ''} 
                      onChange={e => setLocalProfile({...localProfile, bio: e.target.value})} 
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
                    onChange={e => setLocalProfile({...localProfile, phone: e.target.value})} 
                    placeholder="+1 234 567 890" 
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-main)' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Change Password</h4>
                <div className={styles.profileFields}>
                  <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                    <label className={styles.fieldLabel}>Current Password</label>
                    <input type="password" className={styles.fieldInput} placeholder="••••••••" />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>New Password</label>
                    <input type="password" className={styles.fieldInput} placeholder="••••••••" />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Confirm New Password</label>
                    <input type="password" className={styles.fieldInput} placeholder="••••••••" />
                  </div>
                </div>
                <button className={styles.btnSave} style={{ marginTop: '1.5rem' }}>Change Password</button>
              </div>
            </section>
            
            <footer className={styles.settingsFooter}>
              <button className={styles.btnSave} onClick={handleSaveAccount}>Save Privacy Details</button>
            </footer>
          </div>
        )}

      </div>
    </>
  )
}
