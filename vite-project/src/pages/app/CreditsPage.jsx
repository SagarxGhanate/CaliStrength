import React from 'react'
import AppHeader from '../../components/layout/AppHeader'
import styles from './CreditsPage.module.css'

export default function CreditsPage() {
  return (
    <div className="page-container">
      <AppHeader title="Credits" icon="workspace_premium" />
      <div className={styles.container}>
        <div className={styles.heroSection}>
          <div className={styles.glowingBadge}>PROJECT CALISTRENGTH</div>
          <h1 className={styles.title}>The Team Behind the Journey</h1>
          <p className={styles.subtitle}>
            A vision shared by a group of three students, brought to life through dedicated engineering.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {/* Main Developer Card */}
          <div className={`${styles.creditCard} ${styles.leadCard}`}>
            <div className={styles.cardGlow}></div>
            <div className={styles.roleTag}>Lead Developer & Engineer</div>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>SG</div>
            </div>
            <h2>Sagar Ghanate</h2>
            <p className={styles.bio}>
              Sole developer and architect of CaliStrength. Designed, engineered, and built the entire full-stack application from the ground up, merging a passion for fitness with advanced software development.
            </p>
            <div className={styles.techStack}>
              <span>React</span>
              <span>FastAPI</span>
              <span>MySQL</span>
              <span>Firebase</span>
            </div>
          </div>

          {/* Visionary Group Card */}
          <div className={styles.creditCard}>
            <div className={styles.roleTag} style={{ color: 'var(--text-secondary)' }}>The Visionary Trio</div>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-main)' }}>
                <span className="material-symbols-outlined">group</span>
              </div>
            </div>
            <h2>Group of 3 Students</h2>
            <p className={styles.bio}>
              The foundational ideas, brainstorming, and project conception were a collaborative effort by our passionate group of three students. 
            </p>
            <div className={styles.techStack} style={{ justifyContent: 'center' }}>
              <span>Ideation</span>
              <span>Project Planning</span>
            </div>
          </div>
        </div>

        <div className={styles.footerNote}>
          <p>Built for the love of open source, calisthenics, and clean code.</p>
        </div>
      </div>
    </div>
  )
}
