import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h2>CaliStrength</h2>
          <p>
            Your personal calisthenics companion. Track weight, workouts,
            skills, and progress with a clean and powerful dashboard.
          </p>
        </div>
        <div className={styles.footerSection}>
          <h3>About Project</h3>
          <p>
            Helping users gain or lose weight using calisthenics-based workout
            logs, real-time weight tracking, and strength progression insights.
          </p>
        </div>
        <div className={styles.footerSection}>
          <h3>How it Works</h3>
          <ul>
            <li>Set your goal (Gain / Lose Weight)</li>
            <li>Log daily workouts &amp; weight</li>
            <li>Track progress through charts</li>
            <li>Receive insights &amp; motivation</li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        &copy; 2026 CaliStrength &mdash; Designed &amp; Built by Sagar Ghanate 🏋️‍♂️
      </div>
    </footer>
  )
}
