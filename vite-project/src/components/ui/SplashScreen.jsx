import { useEffect, useState } from 'react'
import styles from './SplashScreen.module.css'
import { useApp } from '../../context/AppContext'
import darkLogo from '../../assets/Logo/Dark theme logo.png'
import lightLogo from '../../assets/Logo/Light theme logo.png'

export default function SplashScreen({ onComplete }) {
  const { theme } = useApp()
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Start fading out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 2000)

    // Complete the splash screen after the fade out transition (0.6s)
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 2600)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className={`${styles.splashContainer} ${isFadingOut ? styles.fadeOut : ''}`}>
      <div className={styles.contentWrapper}>
        <div className={styles.logoWrapper}>
          <img 
            src={theme === 'dark' ? darkLogo : lightLogo} 
            alt="CaliStrength" 
            className={styles.logoImage} 
          />
        </div>
        
        <div className={styles.loadingBarContainer}>
          <div className={styles.loadingBar}></div>
        </div>
        
        <h2 className={styles.tagline}>Unlock Your True Strength</h2>
      </div>

      {/* Decorative background blur elements */}
      <div className={`${styles.blob} ${styles.blobTop}`}></div>
      <div className={`${styles.blob} ${styles.blobBottom}`}></div>
    </div>
  )
}
