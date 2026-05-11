import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { isAuthenticated, getStoredUser } from '../../lib/api'
import Footer from '../../components/layout/Footer'
import styles from './LandingPage.module.css'

import darkLogo from '../../assets/Logo/Dark theme logo.png'
import lightLogo from '../../assets/Logo/Light theme logo.png'

export default function LandingPage() {
  const { theme } = useApp()
  const navigate = useNavigate()
  
  // Refs for scroll animation
  const observerRef = useRef(null)

  useEffect(() => {
    // If already logged in, maybe we don't force redirect, but change 'Login' to 'Dashboard'
    // But we still let them view the landing page if they want.
    
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animateFadeUp')
          observerRef.current.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

    const elements = document.querySelectorAll('.scroll-animate')
    elements.forEach(el => observerRef.current.observe(el))

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  const loggedIn = isAuthenticated()
  const user = getStoredUser()

  return (
    <div className={styles.landingPage}>
      {/* HEADER */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logoWrap}>
            <img src={theme === 'dark' ? darkLogo : lightLogo} alt="CaliStrength" className={styles.logoImg} />
          </Link>
          
          <div className={styles.desktopNav}>
            <a href="#about">About</a>
            <a href="#disciplines">Disciplines</a>
            <a href="#community">Community</a>
          </div>

          <div className={styles.headerActions}>
            {loggedIn ? (
              <Link to={user?.is_onboarded ? "/dashboard" : "/onboarding"} className={styles.btnPrimary}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className={`${styles.btnSecondary} mobile-hidden`}>Sign In</Link>
                <Link to="/signup" className={styles.btnPrimary}>Join Now</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid}>
            <div className={`${styles.heroText} scroll-animate`}>
              <span className={styles.heroLabel}>Welcome to CaliStrength</span>
              <h1 className={styles.heroTitle}>
                Master <br /> Your Bodyweight <br /> <span>Excellence</span>
              </h1>
              <p className={styles.heroDesc}>
                Your premium calisthenics companion. Track your progress, unlock advanced skills, and join an elite community of strength athletes. No excuses, just progress.
              </p>
              <div className={styles.heroButtons}>
                {loggedIn ? (
                  <Link to={user?.is_onboarded ? "/dashboard" : "/onboarding"} className={styles.btnPrimary}>Open Dashboard</Link>
                ) : (
                  <>
                    <Link to="/signup" className={styles.btnPrimary} style={{ textAlign: 'center' }}>Start Your Journey</Link>
                    <Link to="/login" className={styles.btnSecondary} style={{ textAlign: 'center' }}>Sign In</Link>
                  </>
                )}
              </div>
            </div>
            
            <div className={`${styles.heroImgWrap} scroll-animate delay2`}>
              <img 
                src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop" 
                alt="Calisthenics Athlete" 
                className={styles.heroImg}
              />
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className={styles.aboutSection}>
          <div className={styles.aboutGrid}>
            <div className={`${styles.aboutText} scroll-animate`}>
              <h2 className={styles.aboutTitle}>Built by <span>Passion</span> <br /> for <span>Strength</span></h2>
              <div className={styles.aboutDesc}>
                <p>
                  CaliStrength is designed specifically for bodyweight athletes. We understand that tracking reps and sets isn't enough when you're working towards a Front Lever or Full Planche.
                </p>
                <p>
                  Our platform intelligently tracks your isometric holds, explosive reps, and overall volume, providing you with actionable analytics to guarantee progressive overload and continuous gains.
                </p>
              </div>
              
              <div className={styles.statsRow}>
                <div className={styles.statCol}>
                  <span className={styles.statVal}>12+</span>
                  <span className={styles.statLabel}>Advanced Skills</span>
                </div>
                <div className={styles.statCol}>
                  <span className={styles.statVal}>100%</span>
                  <span className={styles.statLabel}>Bodyweight</span>
                </div>
              </div>
            </div>
            
            <div className={`${styles.aboutImgWrap} scroll-animate delay2`}>
              <img 
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop" 
                alt="Calisthenics Rings" 
              />
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="disciplines" className={styles.disciplinesSection}>
          <div className={`${styles.disciplinesHeader} scroll-animate`}>
            <h2 className={styles.disciplinesTitle}>App Features</h2>
          </div>
          
          <div className={styles.disciplinesGrid}>
            
            <div className={`${styles.disciplineCard} scroll-animate`}>
              <img src="https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=400&auto=format&fit=crop" className={styles.disciplineImg} alt="AI Form Analyzer" />
              <div className={styles.disciplineContent}>
                <span className={styles.disciplineNum}>01</span>
                <h3 className={styles.disciplineName}>AI Coach</h3>
                <p className={styles.disciplineDesc}>Get intelligent feedback, personalized answers, and form analysis from our AI.</p>
              </div>
            </div>

            <div className={`${styles.disciplineCard} scroll-animate delay1`}>
              <img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=400&auto=format&fit=crop" className={styles.disciplineImg} alt="Skill Mastery" />
              <div className={styles.disciplineContent}>
                <span className={styles.disciplineNum}>02</span>
                <h3 className={styles.disciplineName}>Skill Mastery</h3>
                <p className={styles.disciplineDesc}>Track progressions from beginner holds to the Full Planche and Human Flag.</p>
              </div>
            </div>

            <div className={`${styles.disciplineCard} scroll-animate delay2`}>
              <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop" className={styles.disciplineImg} alt="Smart Routines" />
              <div className={styles.disciplineContent}>
                <span className={styles.disciplineNum}>03</span>
                <h3 className={styles.disciplineName}>Smart Splits</h3>
                <p className={styles.disciplineDesc}>Automatically generated Push/Pull/Legs/Core routines based on your level.</p>
              </div>
            </div>

            <div className={`${styles.disciplineCard} scroll-animate delay3`}>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" className={styles.disciplineImg} alt="Deep Analytics" />
              <div className={styles.disciplineContent}>
                <span className={styles.disciplineNum}>04</span>
                <h3 className={styles.disciplineName}>Deep Analytics</h3>
                <p className={styles.disciplineDesc}>Track your volume, isometric holds, PRs, and weight trends over time.</p>
              </div>
            </div>

          </div>
        </section>

        {/* CTA SECTION */}
        <section id="community" className={`${styles.ctaSection} scroll-animate`}>
          <h2 className={styles.ctaTitle}>Level Up <br /> Your Training</h2>
          <div className={styles.ctaAction}>
            <span className={styles.ctaLabel}>START YOUR JOURNEY TODAY</span>
            {loggedIn ? (
              <Link to={user?.is_onboarded ? "/dashboard" : "/onboarding"} className={styles.btnDark}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup" className={styles.btnDark}>
                Join The Community
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Render the standard app Footer */}
      <Footer />
    </div>
  )
}
