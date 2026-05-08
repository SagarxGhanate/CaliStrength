import { useState, useMemo, useCallback } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import { syncSkillStart, syncSkillMaster, syncSkillRemove } from '../../lib/sync'
import {
  SKILLS_DATA, CATEGORIES,
  SKILL_VIDEOS, SKILL_STEPS_MAP, DEFAULT_STEPS,
  getSkillById, getCategoryForSkill, getYouTubeEmbedId
} from '../../data/skillsData'
import styles from './SkillsPage.module.css'

/* ── Confirm Dialog ── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.alertOverlay} onClick={onCancel}>
      <div className={styles.alertBox} onClick={e => e.stopPropagation()}>
        <p className={styles.alertText}>{message}</p>
        <div className={styles.alertButtons}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

/* ── Give-Up Dialog ── */
const MOTIVATIONAL = [
  'Every master was once a beginner. Keep trying!',
  "It's okay to take a break, but don't quit forever!",
  'Rest if you must, but don\'t you quit.',
  "You're closer than you think. Stay strong!",
]
function GiveUpDialog({ skill, onConfirm, onCancel }) {
  const msg = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]
  return (
    <div className={styles.alertOverlay} onClick={onCancel}>
      <div className={`${styles.alertBox} ${styles.giveUpBox}`} onClick={e => e.stopPropagation()}>
        <div className={styles.giveUpIcon}>
          <span className="material-symbols-outlined">heart_broken</span>
        </div>
        <h2 className={styles.giveUpTitle}>Give Up?</h2>
        <p className={styles.giveUpMsg}>
          Do you really want to give up on <strong>{skill?.name}</strong>?<br /><br />
          💡 <em>{msg}</em>
        </p>
        <div className={styles.alertButtons}>
          <button className={styles.cancelBtn} onClick={onCancel}>No, Keep Going</button>
          <button className={`${styles.confirmBtn} ${styles.dangerBtn}`} onClick={onConfirm}>I Give Up</button>
        </div>
      </div>
    </div>
  )
}

/* ── Skill Detail Modal ── */
function SkillModal({ skill, catKey, skillsState, onClose, onTrain }) {
  if (!skill) return null
  const cat = CATEGORIES.find(c => c.key === catKey)
  const isOngoing = skillsState.ongoing.includes(skill.id)
  const isMastered = skillsState.mastered.includes(skill.id)

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className={styles.modalImgWrap}>
          <img src={skill.img} alt={skill.name} onError={e => { e.target.style.display = 'none' }} />
        </div>
        <div className={styles.modalBody}>
          <h2 className={styles.modalName}>{skill.name}</h2>
          <p className={styles.modalLevel} style={{ color: cat?.color }}>
            {cat?.label} • {skill.freq}
          </p>
          <div className={styles.modalReqs}>
            <p className={styles.modalReqsTitle}>
              <span className="material-symbols-outlined">checklist</span>
              Requirements
            </p>
            <ul className={styles.modalReqsList}>
              {skill.requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          {isMastered ? (
            <button className={styles.trainBtn} disabled>
              <span className="material-symbols-outlined">check_circle</span> Mastered!
            </button>
          ) : isOngoing ? (
            <button className={styles.trainBtn} disabled>
              <span className="material-symbols-outlined">rotate_right</span> Currently Training
            </button>
          ) : (
            <button className={styles.trainBtn} onClick={() => { onClose(); onTrain(skill, catKey) }}>
              <span className="material-symbols-outlined">play_arrow</span> Train This Skill
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Train Modal ── */
function TrainModal({ skill, onClose }) {
  if (!skill) return null
  const url = SKILL_VIDEOS[skill.name] || 'https://www.youtube.com/watch?v=IODxDxX7oi4'
  const videoId = getYouTubeEmbedId(url)
  const steps = SKILL_STEPS_MAP[skill.name] || DEFAULT_STEPS

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.trainModal}`} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className={styles.trainModalBody}>
          <h2 className={styles.trainModalTitle}>{skill.name}</h2>
          <div className={styles.videoContainer}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={skill.name}
            />
          </div>
          <div className={styles.trainSteps}>
            <p className={styles.trainStepsTitle}>
              <span className="material-symbols-outlined">format_list_numbered</span>
              Training Steps
            </p>
            <ol className={styles.trainStepsList}>
              {steps.map((step, i) => (
                <li key={i}>
                  {step.startsWith('Form correction:')
                    ? <><strong>Form correction:</strong> {step.replace('Form correction:', '').trim()}</>
                    : step}
                </li>
              ))}
            </ol>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fallbackBtn}>
            <span className="material-symbols-outlined">smart_display</span>
            Watch on YouTube (Fallback)
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Skill Card (from All Skills) ── */
function SkillCard({ skill, catKey, skillsState, onOpenModal, onTrain, onToggleNext }) {
  const cat = CATEGORIES.find(c => c.key === catKey)
  const isNext = skillsState.nextSkill === skill.id

  return (
    <div className={styles.skillCard} onClick={() => onOpenModal(skill, catKey)}>
      <div className={styles.skillImgWrap}>
        <img src={skill.img} alt={skill.name} loading="lazy" onError={e => { e.target.style.opacity = 0.3 }} />
        <div className={styles.skillImgOverlay} />
        {skill.badge && <span className={styles.skillBadge}>{skill.badge}</span>}
      </div>
      <div className={styles.skillCardBody}>
        <h4 className={styles.skillName}>{skill.name}</h4>
        <p className={styles.skillLevel}>
          <span className="material-symbols-outlined" style={{ color: cat?.color, fontSize: '1rem' }}>{cat?.icon}</span>
          {cat?.label}
        </p>
        <div className={styles.skillFooter}>
          <span className={styles.skillFreq}>{skill.freq}</span>
          <button className={styles.trainSmBtn} onClick={e => { e.stopPropagation(); onTrain(skill, catKey) }}>
            Train <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <button
          className={`${styles.markNextBtn} ${isNext ? styles.markNextActive : ''}`}
          onClick={e => { e.stopPropagation(); onToggleNext(skill.id) }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>
            {isNext ? 'star' : 'star_border'}
          </span>
          {isNext ? 'Next Skill ✓' : 'Mark as Next'}
        </button>
      </div>
    </div>
  )
}

/* ── Ongoing Card ── */
function OngoingCard({ skill, catKey, onOpenTrain, onMaster, onGiveUp }) {
  const cat = CATEGORIES.find(c => c.key === catKey)

  return (
    <div className={`${styles.skillCard} ${styles.ongoingCard}`}>
      <div className={styles.skillImgWrap}>
        <img src={skill.img} alt={skill.name} loading="lazy" onError={e => { e.target.style.opacity = 0.3 }} />
        <div className={styles.skillImgOverlay} />
        <span className={styles.ongoingBadge}>
          <span className="material-symbols-outlined">rotate_right</span> Training
        </span>
        <button className={styles.giveUpCardBtn} onClick={e => { e.stopPropagation(); onGiveUp(skill, catKey) }} title="Give Up">
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
        </button>
      </div>
      <div className={styles.skillCardBody}>
        <h4 className={styles.skillName}>{skill.name}</h4>
        <p className={styles.skillLevel}>
          <span className="material-symbols-outlined" style={{ color: cat?.color, fontSize: '1rem' }}>{cat?.icon}</span>
          {cat?.label}
        </p>
        <div className={styles.skillFooter}>
          <button className={styles.startTrainBtn} onClick={e => { e.stopPropagation(); onOpenTrain(skill) }}>
            <span className="material-symbols-outlined">play_arrow</span> Train
          </button>
          <button className={styles.unlockBtn} onClick={e => { e.stopPropagation(); onMaster(skill, catKey) }}>
            <span className="material-symbols-outlined">emoji_events</span> Unlocked!
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Mastered Card ── */
function MasteredCard({ skill }) {
  return (
    <div className={styles.masteredCard}>
      <div className={styles.masteredImgWrap}>
        <img src={skill.img} alt={skill.name} loading="lazy" onError={e => { e.target.style.opacity = 0.3 }} />
        <div className={styles.masteredOverlay} />
      </div>
      <div className={styles.masteredCheckIcon}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <p className={styles.masteredName}>{skill.name}</p>
      <p className={styles.masteredDate}>Mastered ✓</p>
    </div>
  )
}

/* ══════════════════════════════
   MAIN SKILLS PAGE
   ══════════════════════════════ */
export default function SkillsPage() {
  const { skillsData, setSkillsData } = useApp()
  const [searchQ, setSearchQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [modalSkill, setModalSkill] = useState(null)
  const [modalCatKey, setModalCatKey] = useState(null)
  const [trainSkill, setTrainSkill] = useState(null)
  const [dialog, setDialog] = useState(null) // { type, skill, catKey }
  const [giveUpDialog, setGiveUpDialog] = useState(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const handleSearchChange = (val) => {
    setSearchQ(val)
    if (!val.trim()) { setSuggestions([]); return }
    const q = val.toLowerCase()
    
    const all = []
    CATEGORIES.forEach(cat => {
      if(SKILLS_DATA[cat.key]) {
        SKILLS_DATA[cat.key].forEach(s => all.push({ skill: s, catKey: cat.key }))
      }
    })
    
    const matches = all.filter(item => item.skill.name.toLowerCase().includes(q))
    setSuggestions(matches.slice(0, 6))
  }

  // skillsData from context = { ongoing:[], mastered:[], nextSkill: id|null }
  const state = skillsData || { ongoing: [], mastered: [], nextSkill: null }

  const openModal = (skill, catKey) => { setModalSkill(skill); setModalCatKey(catKey) }
  const openTrain = (skill) => setTrainSkill(skill)

  const handleTrain = useCallback((skill, catKey) => {
    setDialog({ type: 'train', skill, catKey })
  }, [])

  const handleMaster = useCallback((skill, catKey) => {
    setDialog({ type: 'master', skill, catKey })
  }, [])

  const handleGiveUp = useCallback((skill, catKey) => {
    setGiveUpDialog({ skill, catKey })
  }, [])

  const handleToggleNext = useCallback((id) => {
    setSkillsData(prev => ({
      ...prev,
      nextSkill: prev.nextSkill === id ? null : id,
    }))
  }, [setSkillsData])

  const confirmDialog = useCallback(() => {
    if (!dialog) return
    const { type, skill, catKey } = dialog
    setDialog(null)

    if (type === 'train') {
      setSkillsData(prev => ({
        ...prev,
        ongoing: prev.ongoing.includes(skill.id) ? prev.ongoing : [...prev.ongoing, skill.id],
      }))
      syncSkillStart(skill.id)
    } else if (type === 'master') {
      setSkillsData(prev => ({
        ...prev,
        ongoing: prev.ongoing.filter(id => id !== skill.id),
        mastered: prev.mastered.includes(skill.id) ? prev.mastered : [...prev.mastered, skill.id],
        nextSkill: prev.nextSkill === skill.id ? null : prev.nextSkill,
      }))
      syncSkillMaster(skill.id)
    }
  }, [dialog, setSkillsData])

  const confirmGiveUp = useCallback(() => {
    if (!giveUpDialog) return
    const { skill } = giveUpDialog
    setGiveUpDialog(null)
    setSkillsData(prev => ({
      ...prev,
      ongoing: prev.ongoing.filter(id => id !== skill.id),
      nextSkill: prev.nextSkill === skill.id ? null : prev.nextSkill,
    }))
    syncSkillRemove(skill.id)
  }, [giveUpDialog, setSkillsData])

  // derived lists
  const ongoingSkills = useMemo(() =>
    state.ongoing.map(id => {
      const sk = getSkillById(id)
      return sk ? { skill: sk, catKey: getCategoryForSkill(id) } : null
    }).filter(Boolean),
    [state.ongoing]
  )

  const masteredSkills = useMemo(() =>
    state.mastered.map(id => getSkillById(id)).filter(Boolean),
    [state.mastered]
  )

  const filteredCategories = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      skills: SKILLS_DATA[cat.key].filter(
        s => !state.ongoing.includes(s.id) && !state.mastered.includes(s.id)
      ),
    })).filter(cat => cat.skills.length > 0),
    [state.ongoing, state.mastered]
  )

  const searchInputNode = (
    <div className={styles.searchBoxWrap}>
      <div className={styles.searchBox}>
        <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)', fontSize: '1.25rem' }}>search</span>
        <input
          type="text"
          placeholder="Search skills..."
          className={styles.searchInput}
          value={searchQ}
          onChange={e => handleSearchChange(e.target.value)}
          onFocus={e => handleSearchChange(e.target.value)}
          onBlur={() => setTimeout(() => setSuggestions([]), 200)}
        />
      </div>
      {suggestions.length > 0 && (
        <div className={styles.searchSuggestions}>
          {suggestions.map((item, i) => (
            <div key={i} className={styles.suggestionItem} onMouseDown={() => {
               setSearchQ('')
               setSuggestions([])
               openModal(item.skill, item.catKey)
            }}>
               <div className={styles.suggestionImgWrap}>
                 <img src={item.skill.img} alt="" className={styles.suggestionImg} />
               </div>
               <span className={styles.suggestionName}>{item.skill.name}</span>
               <span className="material-symbols-outlined" style={{marginLeft: 'auto', fontSize: '1rem', color: 'var(--text-tertiary)'}}>open_in_new</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Mobile search select handler
  const handleMobileSkillSelect = (item) => {
    setIsMobileSearchOpen(false)
    setSearchQ('')
    setSuggestions([])
    openModal(item.skill, item.catKey)
  }

  return (
    <>
      <AppHeader
        icon="self_improvement"
        title="Skills"
        showSearch
        onSearchClick={() => setIsMobileSearchOpen(true)}
        searchActive={isMobileSearchOpen}
        searchValue={searchQ}
        onSearchChange={(val) => handleSearchChange(val)}
        onSearchClose={() => { setIsMobileSearchOpen(false); setSearchQ(''); setSuggestions([]) }}
        searchPlaceholder="Search skills..."
        right={searchInputNode}
      />

      <div className={styles.contentInner}>
        {/* Hero */}
        <div className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Skill Progression</h1>
            <p className={styles.heroSubtitle}>
              Mastered <span className={styles.highlight}>{state.mastered.length}</span> skills •&nbsp;
              Training <span className={styles.highlight}>{state.ongoing.length}</span> skills
            </p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.levelLegend}>
              {[['#22c55e','Beginner'],['#ec5b13','Intermediate'],['#ef4444','Advanced'],['#818cf8','Elite']].map(([color, label]) => (
                <span key={label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: color }} />{label}
                </span>
              ))}
            </div>
          </div>
        </div>


        {/* Ongoing */}
        {ongoingSkills.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <span className="material-symbols-outlined">rotate_right</span>
              <h3>Ongoing Skills</h3>
            </div>
            <div className={styles.skillsGrid}>
              {ongoingSkills.map(({ skill, catKey }) => (
                <OngoingCard
                  key={skill.id}
                  skill={skill}
                  catKey={catKey}
                  onOpenTrain={openTrain}
                  onMaster={handleMaster}
                  onGiveUp={handleGiveUp}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Skills by Category */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className="material-symbols-outlined">fitness_center</span>
            <h3>All Skills</h3>
          </div>
          <div id="allSkillsContainer">
            {filteredCategories.map(cat => (
              <div key={cat.key} className={styles.categorySection}>
                <div className={styles.categoryTitle}>
                  <span className={styles.categoryDot} style={{ background: cat.color }} />
                  <h4 className={styles.categoryLabel} style={{ color: cat.color }}>{cat.label}</h4>
                  <span className={styles.categoryCount}>{cat.skills.length} skills</span>
                </div>
                <div className={styles.skillsGrid}>
                  {cat.skills.map(skill => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      catKey={cat.key}
                      skillsState={state}
                      onOpenModal={openModal}
                      onTrain={handleTrain}
                      onToggleNext={handleToggleNext}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mastered */}
        {masteredSkills.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <span className="material-symbols-outlined">verified</span>
              <h3>Mastered Skills</h3>
            </div>
            <div className={styles.masteredGrid}>
              {masteredSkills.map(skill => (
                <MasteredCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Detail Modal */}
      {modalSkill && (
        <SkillModal
          skill={modalSkill}
          catKey={modalCatKey}
          skillsState={state}
          onClose={() => setModalSkill(null)}
          onTrain={handleTrain}
        />
      )}

      {/* Train Modal */}
      {trainSkill && (
        <TrainModal skill={trainSkill} onClose={() => setTrainSkill(null)} />
      )}

      {/* Confirm Dialog */}
      {dialog && (
        <ConfirmDialog
          message={
            dialog.type === 'train'
              ? `Start training "${dialog.skill?.name}"?`
              : `Mark "${dialog.skill?.name}" as mastered?`
          }
          onConfirm={confirmDialog}
          onCancel={() => setDialog(null)}
        />
      )}

      {/* Give Up Dialog */}
      {giveUpDialog && (
        <GiveUpDialog
          skill={giveUpDialog.skill}
          onConfirm={confirmGiveUp}
          onCancel={() => setGiveUpDialog(null)}
        />
      )}

      {/* ── Mobile Inline Search Dropdown (below header) ── */}
      {isMobileSearchOpen && (
        <div className={styles.mobileSearchDropdown}>
          {suggestions.length > 0 ? (
            suggestions.map((item, i) => (
              <div key={i} className={styles.suggestionItem} onClick={() => handleMobileSkillSelect(item)}>
                <div className={styles.suggestionImgWrap}>
                  <img src={item.skill.img} alt="" className={styles.suggestionImg} />
                </div>
                <span className={styles.suggestionName}>{item.skill.name}</span>
                <span className="material-symbols-outlined" style={{marginLeft: 'auto', fontSize: '1rem', color: 'var(--text-tertiary)'}}>open_in_new</span>
              </div>
            ))
          ) : searchQ.trim() ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              No skills found matching "{searchQ}"
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
              Start typing to search skills...
            </div>
          )}
        </div>
      )}
    </>
  )
}
