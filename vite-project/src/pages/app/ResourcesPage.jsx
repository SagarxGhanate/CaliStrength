import React, { useState } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import styles from './ResourcesPage.module.css'

// The complete text content for the guides
const GUIDES = {
  'ppl': {
    title: 'The Push/Pull/Legs Blueprint',
    content: (
      <>
        <p>The Push/Pull/Legs (PPL) split is one of the most effective ways to build strength and muscle using calisthenics. By grouping muscles by their functional movement patterns, you maximize recovery and volume.</p>
        
        <h3>The Philosophy</h3>
        <p>In calisthenics, movements rarely isolate a single muscle. A pull-up uses your lats, biceps, core, and forearms. PPL organizes these compound movements.</p>
        
        <h4>1. Push Day</h4>
        <p>Focuses on pushing your body away from resistance. Primary muscles: Chest, Shoulders, Triceps.</p>
        <ul>
          <li><strong>Vertical Push:</strong> Handstand push-ups, Pike push-ups, Dips.</li>
          <li><strong>Horizontal Push:</strong> Push-up variations, Planche progressions.</li>
        </ul>

        <h4>2. Pull Day</h4>
        <p>Focuses on pulling your body toward resistance. Primary muscles: Back, Biceps, Forearms.</p>
        <ul>
          <li><strong>Vertical Pull:</strong> Pull-ups, Chin-ups, Muscle-ups.</li>
          <li><strong>Horizontal Pull:</strong> Front lever progressions, Bodyweight rows.</li>
        </ul>

        <h4>3. Legs & Core Day</h4>
        <p>The foundation of your body. Primary muscles: Quads, Hamstrings, Glutes, Calves, Abs.</p>
        <ul>
          <li><strong>Squat pattern:</strong> Pistol squats, Shrimp squats, Sissy squats.</li>
          <li><strong>Hinge pattern:</strong> Nordic hamstring curls, Glute bridges.</li>
        </ul>
      </>
    )
  },
  'muscle-up': {
    title: 'Zero to Muscle-Up',
    content: (
      <>
        <p>The muscle-up is the holy grail of intermediate calisthenics. It combines a high explosive pull-up with a straight bar dip, bridged by a complex transition phase.</p>
        
        <h3>Prerequisites</h3>
        <p>Do not attempt the muscle-up until you can comfortably perform:</p>
        <ul>
          <li>10-15 clean, dead-hang pull-ups</li>
          <li>15 straight bar dips</li>
          <li>High pull-ups (pulling the bar to your lower chest)</li>
        </ul>

        <h3>Step 1: The High Pull</h3>
        <p>The most common mistake is trying to pull *around* the bar. You need to pull *away* and *up*. Practice explosive pull-ups where you aim to get your chest, and eventually your stomach, to the bar.</p>

        <h3>Step 2: The False Grip (Optional but helpful)</h3>
        <p>For strict muscle-ups on rings or a bar, wrapping your wrist over the bar (false grip) eliminates the need to rotate your hands during the transition.</p>

        <h3>Step 3: The Transition</h3>
        <p>Use a resistance band or a low bar (feet on the ground) to practice the transition. As your chest clears the bar, aggressively drive your head and shoulders forward while rotating your elbows over the bar.</p>

        <h3>Step 4: The Dip</h3>
        <p>Once you are over the bar, it becomes a simple straight bar dip. Press out to lock your elbows.</p>
      </>
    )
  },
  'pre-workout': {
    title: 'Pre-Workout Fueling',
    content: (
      <>
        <p>Calisthenics requires a unique balance of high energy and feeling light on your feet. Eating a heavy meal before training will weigh you down, but training fasted might cost you explosive power.</p>
        
        <h3>Timing is Everything</h3>
        <p>Aim to consume your pre-workout meal <strong>60 to 90 minutes</strong> before your session. This gives your body enough time to digest without crashing your blood sugar.</p>

        <h3>What to Eat</h3>
        <ul>
          <li><strong>Complex Carbohydrates:</strong> Oats, sweet potatoes, or whole-grain bread. These provide a slow, sustained release of energy.</li>
          <li><strong>Simple Carbohydrates:</strong> A banana, dates, or a small handful of berries 30 minutes before if you need an immediate spike in energy.</li>
          <li><strong>Moderate Protein:</strong> 15-20g of easily digestible protein (like whey or a light yogurt) prevents muscle breakdown during intense holds like levers or planches.</li>
          <li><strong>Low Fat & Fiber:</strong> Fats and fiber slow down digestion. Avoid heavy peanut butter or massive salads right before training to prevent stomach cramps.</li>
        </ul>

        <h3>Hydration</h3>
        <p>Drink 500ml of water 2 hours before, and sip 250ml right before you start. Even a 2% drop in hydration can significantly reduce your grip strength and endurance.</p>
      </>
    )
  },
  'protein': {
    title: 'Protein for Recovery',
    content: (
      <>
        <p>Bodyweight training causes micro-tears in your muscle fibers just like weightlifting. To repair those fibers and grow stronger, you need adequate protein.</p>
        
        <h3>How Much Do You Need?</h3>
        <p>For an athlete practicing calisthenics 3-5 times a week, the optimal protein intake is between <strong>1.6g to 2.2g per kilogram of body weight</strong> (0.7g to 1g per pound).</p>
        <p><em>Example:</em> If you weigh 75kg (165lbs), you should aim for 120g to 165g of protein daily.</p>

        <h3>Protein Sources</h3>
        <ul>
          <li><strong>Lean Meats:</strong> Chicken breast, turkey, lean beef.</li>
          <li><strong>Fish:</strong> Salmon, tuna (great for omega-3s which reduce joint inflammation).</li>
          <li><strong>Plant-Based:</strong> Tofu, tempeh, lentils, edamame, and quinoa.</li>
          <li><strong>Dairy/Eggs:</strong> Greek yogurt, cottage cheese, eggs.</li>
        </ul>

        <h3>The "Anabolic Window" Myth</h3>
        <p>You do not need to chug a protein shake within 30 seconds of your last pull-up. Total daily protein intake is vastly more important than timing. However, having a meal with 20-40g of protein within 2 hours of finishing your workout is optimal for kickstarting muscle protein synthesis.</p>
      </>
    )
  }
}

export default function ResourcesPage() {
  const [activeGuide, setActiveGuide] = useState(null)

  const openGuide = (key) => {
    setActiveGuide(GUIDES[key])
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  const closeGuide = () => {
    setActiveGuide(null)
    document.body.style.overflow = ''
  }

  return (
    <div className="page-container">
      <AppHeader title="Resources" icon="auto_stories" />
      
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Knowledge Base</h1>
          <p className={styles.subtitle}>
            Master your body with our curated calisthenics resources. Explore guides, perfect your form, and optimize your nutrition.
          </p>
        </div>

        <div className={styles.sections}>
          {/* Training Guides */}
          <section id="training-guides" className={styles.resourceSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrap} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div>
                <h2>Training Guides</h2>
                <p>Comprehensive blueprints for mastering calisthenics skills.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardImage} style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                  <span className="material-symbols-outlined">fitness_center</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>The Push/Pull/Legs Blueprint</h3>
                  <p>Learn how to structure your weekly split for optimal recovery and maximum muscle growth using only your body weight.</p>
                  <button className={styles.readBtn} onClick={() => openGuide('ppl')}>Read Guide</button>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardImage} style={{ background: 'linear-gradient(135deg, #4c1d95, #8b5cf6)' }}>
                  <span className="material-symbols-outlined">accessibility_new</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>Zero to Muscle-Up</h3>
                  <p>A step-by-step progression plan to unlock your first muscle-up, focusing on explosive pull power and transition mechanics.</p>
                  <button className={styles.readBtn} onClick={() => openGuide('muscle-up')}>Read Guide</button>
                </div>
              </div>
            </div>
          </section>

          {/* Form Videos */}
          <section id="form-videos" className={styles.resourceSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrap} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <span className="material-symbols-outlined">play_circle</span>
              </div>
              <div>
                <h2>Form Videos</h2>
                <p>Visual breakdowns of complex movements to prevent injury.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <div className={styles.videoCard}>
                <div className={styles.videoWrapper}>
                  <iframe 
                    src="https://www.youtube.com/embed/eGo4IYlbE5g" 
                    title="Perfect Pull-Up Form"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
                <div className={styles.cardBody}>
                  <h3>Perfect Pull-Up Form</h3>
                  <p>Master scapular retraction and avoid common elbow injuries with FitnessFAQs.</p>
                </div>
              </div>
              <div className={styles.videoCard}>
                <div className={styles.videoWrapper}>
                  <iframe 
                    src="https://www.youtube.com/embed/KRwKF3QVX8I" 
                    title="Pistol Squat Progression"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
                <div className={styles.cardBody}>
                  <h3>Pistol Squat Progression</h3>
                  <p>Build the balance and unilateral leg strength required for pistol squats.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Nutrition Tips */}
          <section id="nutrition-tips" className={styles.resourceSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrap} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div>
                <h2>Nutrition Tips</h2>
                <p>Fuel your body for recovery and lean muscle gain.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardImage} style={{ background: 'linear-gradient(135deg, #14532d, #22c55e)' }}>
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>Pre-Workout Fueling</h3>
                  <p>What to eat 60 minutes before training to maximize your energy output during intense sessions.</p>
                  <button className={styles.readBtn} onClick={() => openGuide('pre-workout')}>Read Guide</button>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardImage} style={{ background: 'linear-gradient(135deg, #78350f, #f59e0b)' }}>
                  <span className="material-symbols-outlined">egg_alt</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>Protein for Recovery</h3>
                  <p>Calculating your daily protein needs based on your body weight and how to source it effectively.</p>
                  <button className={styles.readBtn} onClick={() => openGuide('protein')}>Read Guide</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Guide Reading Modal */}
      {activeGuide && (
        <div className={styles.modalOverlay} onClick={closeGuide}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{activeGuide.title}</h2>
              <button className={styles.closeBtn} onClick={closeGuide}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              {activeGuide.content}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
