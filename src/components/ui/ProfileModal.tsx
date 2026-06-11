'use client'

/**
 * Edit Profile — the PSP-style curved settings panel from the reduciano
 * reference: gamertag card with rep/score/achievements, Customise profile
 * (avatar grid + editable name), Visual Filters (the site-wide hue
 * presets), recently-unlocked achievements and a message of the day.
 * Curved side wings flip between the two views.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigationStore } from '@/lib/store'
import { useProfileStore, AVATARS, VISUAL_FILTERS } from '@/lib/profile'
import ProfileAvatar from './ProfileAvatar'
import { DSCORE } from './ProfileWidget'

function HeaderClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])
  return <span>{time}</span>
}

function GamertagCard({
  name,
  avatarId,
  editable,
  onEdit,
}: {
  name: string
  avatarId: string
  editable?: boolean
  onEdit?: () => void
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#1c1c1c', boxShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}>
      {/* Banner — name left, big level numeral right */}
      <div className="ps2-card-accent !rounded-none flex items-center justify-between pl-3 pr-1">
        <span className="text-sm md:text-base font-bold text-white flex items-center gap-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
          {name}
          {editable && (
            <button onClick={onEdit} className="text-[10px] font-normal text-white/70 hover:text-white cursor-pointer underline-offset-2 hover:underline">
              edit
            </button>
          )}
        </span>
        <span className="text-3xl font-bold italic text-white/95 leading-none pr-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
          1
        </span>
      </div>
      <div className="flex gap-3 p-2.5">
        <div className="w-14 h-14 rounded-[3px] overflow-hidden shrink-0" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }}>
          <ProfileAvatar avatarId={avatarId} className="w-full h-full" />
        </div>
        <div className="flex-1 text-[11px] text-ps2-text-dim space-y-1 pt-0.5">
          <div className="flex items-center justify-between">
            <span>Rep</span>
            <span style={{ color: 'var(--color-ps2-accent)', letterSpacing: '0.1em' }}>★★★★★</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Dscore</span>
            <span className="flex items-center gap-1 text-white font-bold text-sm">
              {DSCORE}
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-white text-[10px] leading-none">D</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Achievements</span>
            <span className="text-white">1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileModal() {
  const { setScreen } = useNavigationStore()
  const {
    modalOpen, closeModal, name, setName, avatarId, setAvatar, filter, setFilter,
  } = useProfileStore()
  const [view, setView] = useState<'profile' | 'settings'>('profile')
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(name)

  // Own Escape while open (page.tsx skips its Back handling via body.modal-open)
  useEffect(() => {
    if (!modalOpen) return
    document.body.classList.add('modal-open')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view === 'settings') setView('profile')
        else closeModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen, view, closeModal])

  // Fresh state every open
  useEffect(() => {
    if (modalOpen) {
      setView('profile')
      setEditingName(false)
      setDraftName(useProfileStore.getState().name)
    }
  }, [modalOpen])

  const commitName = () => {
    setName(draftName)
    setEditingName(false)
  }

  const selectedAvatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Dimmed backdrop — click to close */}
          <div className="absolute inset-0 bg-black/65" onClick={closeModal} />

          {/* Top bar — title + clock, like the reference */}
          <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="w-full max-w-3xl flex items-center justify-between px-10 text-white text-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              <span>Edit Profile</span>
              <HeaderClock />
            </div>
          </div>

          {/* The curved panel */}
          <motion.div
            className="relative flex items-stretch max-w-3xl w-[92%]"
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
          >
            {/* Left wing — flips between the two views */}
            <button
              onClick={() => setView(view === 'profile' ? 'settings' : 'profile')}
              className="hidden md:flex items-center justify-center w-12 -mr-3 cursor-pointer"
              style={{
                background: 'linear-gradient(105deg, #d4d4d0 0%, #a8a8a4 55%, #8a8a86 100%)',
                borderRadius: '60% 12px 12px 60% / 50% 12px 12px 50%',
                boxShadow: '0 4px 10px rgba(0,0,0,0.45)',
              }}
              aria-label={view === 'profile' ? 'Profile settings' : 'Back to profile'}
            >
              <span className="text-[#3a3a36] text-xs font-bold tracking-wide" style={{ writingMode: 'vertical-rl' }}>
                {view === 'profile' ? 'Profile Settings' : 'Profile'}
              </span>
            </button>

            {/* Body */}
            <div
              className="relative flex-1 rounded-[28px] px-6 md:px-8 py-6 z-10"
              style={{
                background: 'linear-gradient(180deg, #4a4a48 0%, #3a3a38 12%, #303030 100%)',
                boxShadow: '0 10px 36px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.12) inset',
              }}
            >
              <p className="text-white text-base mb-4" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                {view === 'profile' ? 'Profile' : 'Profile Settings'}
              </p>

              {view === 'profile' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-3">
                    <GamertagCard name={name} avatarId={avatarId} />

                    <button
                      onClick={() => setView('settings')}
                      className="ps2-button-accent w-full py-2.5 text-lg font-bold cursor-pointer"
                    >
                      Customise profile
                    </button>

                    {/* Visual Filters */}
                    <div className="rounded-xl p-3" style={{ background: '#141414', boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }}>
                      <p className="text-center text-xs text-white mb-2.5 font-bold">Visual Filters</p>
                      <div className="flex justify-center gap-2.5">
                        {VISUAL_FILTERS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className="ps2-button w-12 h-8 text-sm font-bold"
                            style={
                              filter === f.id
                                ? { backgroundImage: 'linear-gradient(var(--color-ps2-accent-deep) 0%, #000000 50%, var(--color-ps2-accent-deep) 100%)' }
                                : undefined
                            }
                            aria-pressed={filter === f.id}
                          >
                            {f.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setFilter('og')}
                          className="ps2-button w-12 h-8 text-base"
                          aria-label="Reset visual filter"
                        >
                          ↺
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-3">
                    <div className="rounded-xl p-3" style={{ background: '#1c1c1c', boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }}>
                      <div className="flex justify-center gap-3 mb-2">
                        {/* One unlocked, two empty slots */}
                        <div className="w-14 h-14 rounded-lg ps2-button !cursor-default flex items-center justify-center" title="First Boot — watched the intro">
                          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="var(--color-ps2-accent-mid)">
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="12" cy="12" r="8" fill="none" stroke="var(--color-ps2-accent-mid)" strokeWidth="1.5" opacity="0.5" />
                          </svg>
                        </div>
                        <div className="w-14 h-14 rounded-lg" style={{ background: '#101010', boxShadow: '0 0 0 1px rgba(255,255,255,0.05)' }} />
                        <div className="w-14 h-14 rounded-lg" style={{ background: '#101010', boxShadow: '0 0 0 1px rgba(255,255,255,0.05)' }} />
                      </div>
                      <p className="text-center text-[11px] text-ps2-text-dim">Recently unlocked</p>
                    </div>

                    <div className="rounded-xl overflow-hidden" style={{ background: '#1c1c1c', boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }}>
                      <p className="text-xs text-white font-bold px-3 py-2" style={{ background: '#0e0e0e' }}>
                        Message of the day
                      </p>
                      <p className="text-[11px] text-ps2-text-dim px-3 py-2.5 leading-relaxed">
                        &lsquo;Thanks for stopping by — every corner of this site is hand-built. Go watch the showreel!&rsquo;
                      </p>
                    </div>

                    <button
                      onClick={() => { closeModal(); setScreen('INFO') }}
                      className="ps2-button w-full py-2 text-sm cursor-pointer"
                    >
                      Info &amp; Contact
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Avatar grid */}
                  <div className="grid grid-cols-3 gap-2.5 content-start">
                    {AVATARS.map((a) => {
                      const selected = a.id === avatarId
                      return (
                        <button
                          key={a.id}
                          onClick={() => setAvatar(a.id)}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                          style={{
                            boxShadow: selected
                              ? '0 0 0 2.5px var(--color-ps2-accent-mid), 0 0 14px rgba(var(--color-ps2-accent-glow),0.5)'
                              : '0 0 0 1px rgba(255,255,255,0.12)',
                          }}
                          aria-pressed={selected}
                          aria-label={a.title}
                        >
                          <ProfileAvatar avatarId={a.id} className="w-full h-full" />
                        </button>
                      )
                    })}
                  </div>

                  {/* Gamertag + selected avatar lore */}
                  <div className="space-y-3">
                    {editingName ? (
                      <div className="rounded-xl p-3 space-y-2" style={{ background: '#1c1c1c', boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }}>
                        <input
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitName() }}
                          maxLength={16}
                          autoFocus
                          className="w-full bg-black/60 text-white text-sm px-2.5 py-1.5 rounded-md outline-none"
                          style={{ boxShadow: '0 0 0 1px var(--color-ps2-accent-mid)' }}
                          aria-label="Gamertag"
                        />
                        <div className="flex gap-2">
                          <button onClick={commitName} className="ps2-button-accent flex-1 py-1.5 text-xs font-bold cursor-pointer">OK</button>
                          <button onClick={() => { setDraftName(name); setEditingName(false) }} className="ps2-button flex-1 py-1.5 text-xs cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <GamertagCard name={name} avatarId={avatarId} editable onEdit={() => setEditingName(true)} />
                    )}

                    <div className="rounded-xl p-3" style={{ background: '#1c1c1c', boxShadow: '0 0 0 1px rgba(255,255,255,0.07)' }}>
                      <p className="text-white text-sm font-bold tracking-wide">{selectedAvatar.title}</p>
                      <p className="text-[11px] italic mb-1.5" style={{ color: 'var(--color-ps2-accent)' }}>{selectedAvatar.epithet}</p>
                      <p className="text-[11px] text-ps2-text-dim leading-relaxed">{selectedAvatar.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right wing — decorative Achievements tab, like the reference */}
            <div
              className="hidden md:flex items-center justify-center w-12 -ml-3"
              style={{
                background: 'linear-gradient(255deg, #d4d4d0 0%, #a8a8a4 55%, #8a8a86 100%)',
                borderRadius: '12px 60% 60% 12px / 12px 50% 50% 12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.45)',
              }}
            >
              <span className="text-[#3a3a36] text-xs font-bold tracking-wide" style={{ writingMode: 'vertical-rl' }}>
                Achievements
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
