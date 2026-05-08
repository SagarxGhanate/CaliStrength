import { useState, useRef } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import { changeUserPassword } from '../../lib/firebase'
import { sendEmail } from '../../lib/email'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { appData, setAppData } = useApp()
  const { profile = {} } = appData
  const [activeTab, setActiveTab] = useState('account')

  // Pull user info from Firebase auth storage as fallback
  const storedUser = JSON.parse(localStorage.getItem('cs_user') || '{}')

  const [localProfile, setLocalProfile] = useState({
    name:          (profile.name && profile.name !== 'Athlete' ? profile.name : '') || storedUser.name || storedUser.displayName || '',
    email:         profile.email || storedUser.email || '',
    avatar:        profile.avatar || storedUser.avatar || storedUser.photoURL || '',
    age:           profile.age || appData.age || '',
    height:        profile.height || appData.height || '',
    gender:        profile.gender || appData.gender || 'male',
    role:          profile.role || 'Athlete',
    bio:           profile.bio || '',
    phone:         profile.phone || '',
    dob:           profile.dob || '',
    targetWeight:  profile.targetWeight || appData.targetweight || '',
    bodyFat:       profile.bodyFat || '',
  })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  // Password change state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

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
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem', opacity: isChangingPassword ? 0.7 : 1 }}
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating...' : 'Change Password'}
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
