import { useState, useRef } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { appData, setAppData } = useApp()
  const { profile = {} } = appData
  const [activeTab, setActiveTab] = useState('account')
  const [localProfile, setLocalProfile] = useState(profile)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  const handleSave = () => {
    setAppData(prev => ({ ...prev, profile: localProfile }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLocalProfile(p => ({ ...p, avatar: ev.target.result }))
    reader.readAsDataURL(file)
  }

  return (
    <>
      <AppHeader icon="account_circle" title="Profile" />

      <div className={styles.contentInner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Profile Settings</h1>
          <p className={styles.pageSubtitle}>Manage your personal information and privacy settings</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'account' ? styles.active : ''}`}
            onClick={() => setActiveTab('account')}
          >Account</button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'privacy' ? styles.active : ''}`}
            onClick={() => setActiveTab('privacy')}
          >Privacy</button>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <section className={styles.settingsSection}>
            <div className={styles.profileRow}>
              {/* Avatar */}
              <div className={styles.avatarUpload}>
                <div className={styles.avatarPreview}>
                  {localProfile.avatar
                    ? <img src={localProfile.avatar} alt="Profile" />
                    : <div className={styles.avatarPlaceholder}><span className="material-symbols-outlined">person</span></div>
                  }
                </div>
                <button className={styles.avatarEditBtn} onClick={() => fileRef.current?.click()} title="Change photo">
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>

              {/* Fields */}
              <div className={styles.profileFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Full Name</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={localProfile.name || ''}
                    onChange={e => setLocalProfile(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Age</label>
                  <input
                    type="number"
                    className={styles.fieldInput}
                    value={localProfile.age || ''}
                    onChange={e => setLocalProfile(p => ({ ...p, age: e.target.value }))}
                    placeholder="e.g. 25"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Date of Birth</label>
                  <input
                    type="date"
                    className={styles.fieldInput}
                    value={localProfile.dob || ''}
                    onChange={e => setLocalProfile(p => ({ ...p, dob: e.target.value }))}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Role</label>
                  <select
                    className={styles.fieldInput}
                    value={localProfile.role || 'Athlete'}
                    onChange={e => setLocalProfile(p => ({ ...p, role: e.target.value }))}
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
                    onChange={e => setLocalProfile(p => ({ ...p, height: e.target.value }))}
                    placeholder="e.g. 175"
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}>Bio</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={localProfile.bio || ''}
                    onChange={e => setLocalProfile(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Short bio..."
                  />
                </div>
              </div>
            </div>

            <footer className={styles.settingsFooter}>
              <button className={`${styles.btnSave} ${saved ? styles.btnSaved : ''}`} onClick={handleSave}>
                {saved
                  ? <><span className="material-symbols-outlined">check_circle</span> Saved!</>
                  : 'Save Account Details'
                }
              </button>
            </footer>
          </section>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <section className={styles.settingsSection}>
            <div className={styles.sectionHeading}>
              <span className="material-symbols-outlined">lock</span>
              <h3>Account Information</h3>
            </div>
            <div className={styles.profileFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email Address</label>
                <input
                  type="email"
                  className={styles.fieldInput}
                  value={localProfile.email || ''}
                  readOnly
                  placeholder="you@domain.com"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.fieldInput}
                  value={localProfile.phone || ''}
                  onChange={e => setLocalProfile(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className={styles.passwordBox}>
              <h4 className={styles.passwordTitle}>Change Password</h4>
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
              <button className={styles.btnSave} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                Change Password
              </button>
            </div>

            <footer className={styles.settingsFooter}>
              <button className={`${styles.btnSave} ${saved ? styles.btnSaved : ''}`} onClick={handleSave}>
                {saved
                  ? <><span className="material-symbols-outlined">check_circle</span> Saved!</>
                  : 'Save Privacy Details'
                }
              </button>
            </footer>
          </section>
        )}
      </div>
    </>
  )
}
