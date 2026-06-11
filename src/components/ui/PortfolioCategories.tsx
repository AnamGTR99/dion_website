'use client'

/**
 * Portfolio categories — a clone of the PS2 Memory Card browser screen:
 * light metallic panel lit from the upper-left, gold headers (title left,
 * current selection right), a row of icons with a pool of white light
 * behind the selected one, and ✕ Enter / ○ Back prompts (via PS2Chrome).
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigationStore } from '@/lib/store'
import { CATEGORIES } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  camera: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="10" width="40" height="28" rx="3" />
      <circle cx="24" cy="24" r="8" />
      <circle cx="24" cy="24" r="3" />
      <path d="M16 10V7h16v3" />
      <circle cx="37" cy="15" r="2" fill="currentColor" />
    </svg>
  ),
  aperture: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="8" />
      <line x1="24" y1="6" x2="24" y2="16" />
      <line x1="24" y1="32" x2="24" y2="42" />
      <line x1="6" y1="24" x2="16" y2="24" />
      <line x1="32" y1="24" x2="42" y2="24" />
    </svg>
  ),
  cube: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" />
      <path d="M24 4L24 44" />
      <path d="M6 14L24 24L42 14" />
    </svg>
  ),
  shirt: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 6L6 12V20L12 18V42H36V18L42 20V12L32 6" />
      <path d="M16 6C16 6 18 12 24 12C30 12 32 6 32 6" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 48 48" className="w-12 h-12 md:w-14 md:h-14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M24 4C12 4 4 14 4 24C4 34 12 42 24 42C27 42 28 40 28 38C28 37 27.5 36 27 35.5C26.5 35 26 34 26 33C26 30 28 28 31 28H34C40 28 44 24 44 18C44 10 35 4 24 4Z" />
      <circle cx="14" cy="18" r="3" fill="currentColor" />
      <circle cx="22" cy="12" r="3" fill="currentColor" />
      <circle cx="32" cy="14" r="3" fill="currentColor" />
      <circle cx="36" cy="22" r="3" fill="currentColor" />
    </svg>
  ),
}

export default function PortfolioCategories() {
  const { setScreen, setActiveCategory } = useNavigationStore()
  const [selected, setSelected] = useState(0)

  const handleOpen = (index: number) => {
    setActiveCategory(CATEGORIES[index].id)
    setScreen('GALLERY')
  }

  // Arrow keys move the lit selection, Enter opens it (Escape handled globally)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, CATEGORIES.length - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        handleOpen(selected)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  return (
    <motion.div
      className="fixed inset-0 z-30 ps2-browser-panel flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header — gold, like "Memory Card (PS2)/1" + current save title */}
      <div className="flex items-start justify-between px-7 md:px-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="ps2-gold text-xl md:text-2xl font-bold tracking-wide">My Portfolio</h1>
          <p className="text-xs md:text-sm mt-0.5" style={{ color: '#8f8657', textShadow: '0 1px 1px rgba(255,255,255,0.25)' }}>
            {CATEGORIES.length} categories
          </p>
        </motion.div>

        <motion.div
          key={selected}
          className="ps2-gold text-lg md:text-xl font-bold text-right max-w-60 md:max-w-sm leading-tight pt-0.5 pr-0 md:pr-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {CATEGORIES[selected].label}
        </motion.div>
      </div>

      {/* Icon grid — the save icons, selected one lit from behind */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-x-6 md:gap-x-12 gap-y-10 place-items-center">
          {CATEGORIES.map((cat, index) => {
            const isSelected = index === selected
            return (
              <motion.button
                key={cat.id}
                onClick={() => (isSelected ? handleOpen(index) : setSelected(index))}
                onMouseEnter={() => setSelected(index)}
                className="relative flex flex-col items-center gap-3 cursor-pointer outline-none w-28 md:w-32"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.06 }}
                aria-label={cat.label}
                aria-current={isSelected}
              >
                {/* Pool of white light behind the selected icon */}
                <motion.div
                  className="absolute -top-8 -bottom-2 -left-4 -right-4 ps2-icon-glow pointer-events-none"
                  animate={{ opacity: isSelected ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className="relative"
                  style={{
                    color: isSelected ? '#1d1d1a' : '#3e3e3a',
                    filter: isSelected
                      ? 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))'
                      : 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))',
                  }}
                  animate={{ scale: isSelected ? 1.12 : 1, y: isSelected ? -3 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  {CATEGORY_ICONS[cat.icon]}
                </motion.div>

                <span
                  className="relative text-[11px] md:text-xs text-center leading-tight tracking-wide"
                  style={{
                    color: isSelected ? '#1d1d1a' : '#4a4a46',
                    textShadow: '0 1px 1px rgba(255,255,255,0.3)',
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  {cat.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Bottom edge vignette so the white prompts stay readable */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(20,20,18,0.55), transparent)' }}
      />
    </motion.div>
  )
}
