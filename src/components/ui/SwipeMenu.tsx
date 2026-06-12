'use client'

/**
 * Main menu — 1:1 layout of the PS2 browser menu (reference 0:09–0:20):
 * orb cluster floating left of centre, menu items stacked on the right
 * ("Browser" / "System Configuration" style), ✕ Enter prompt below
 * (rendered by PS2Chrome). Up/Down arrows + Enter, tap, or click.
 */

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useNavigationStore } from '@/lib/store'

// The PS2 orb-swarm 3D scene (reference video 0:09–0:20)
const MenuScene = dynamic(() => import('@/components/three/MenuScene'), {
  ssr: false,
  loading: () => null,
})

// Client feedback 2026-06: selection screen keeps only Portfolio + Showreel
// (Info & Contact removed; InfoPage stays reachable from the profile panel)
const MENU_ITEMS = [
  { id: 'portfolio', label: 'My Portfolio', screen: 'PORTFOLIO' as const },
  { id: 'showreel', label: 'Showreel', screen: 'SHOWREEL' as const },
]

// The long converge-then-reveal choreography only plays on the first menu
// visit (straight after boot); Back-navigation returns snap in quickly.
function useMenuIntro() {
  const [intro] = useState(
    () => typeof window !== 'undefined' && !sessionStorage.getItem('menuIntroPlayed')
  )
  useEffect(() => {
    sessionStorage.setItem('menuIntroPlayed', '1')
  }, [])
  return intro
}

export default function SwipeMenu() {
  const { activeMenuIndex, setActiveMenuIndex, setScreen } = useNavigationStore()
  const intro = useMenuIntro()

  // Window-level keys so the clickable ✕ Enter prompt (which dispatches a
  // synthetic keydown) and real keyboards behave identically.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = useNavigationStore.getState().activeMenuIndex
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveMenuIndex(Math.min(idx + 1, MENU_ITEMS.length - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveMenuIndex(Math.max(idx - 1, 0))
      } else if (e.key === 'Enter') {
        setScreen(MENU_ITEMS[idx].screen)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveMenuIndex, setScreen])

  const handleSelect = (index: number) => {
    if (index === activeMenuIndex) setScreen(MENU_ITEMS[index].screen)
    else setActiveMenuIndex(index)
  }

  return (
    <motion.div
      className="fixed inset-0 z-30 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* PS2 orb-swarm 3D scene — swirling cluster left of the menu */}
      <MenuScene variant="menu" intro={intro} />

      {/* Menu items — right of the cluster, like Browser / System Configuration */}
      <div
        className="absolute inset-0 z-10 flex pointer-events-none"
        role="menu"
        aria-label="Main navigation"
      >
        {/* Left half belongs to the orb cluster */}
        <div className="hidden md:block md:w-1/2" />
        <div className="flex-1 flex flex-col items-center justify-end pb-36 md:items-start md:justify-center md:pb-0 md:pl-14">
          <motion.p
            className="text-[10px] tracking-[0.5em] uppercase mb-5 text-ps2-text-muted"
            style={{ textShadow: '1px 2px 4px black' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: intro ? 2.0 : 0.4, duration: 0.8 }}
          >
            Select a section
          </motion.p>

          <div className="flex flex-col items-center md:items-start gap-1.5">
            {MENU_ITEMS.map((item, index) => {
              const isActive = index === activeMenuIndex
              return (
                <motion.button
                  key={item.id}
                  role="menuitem"
                  onClick={() => handleSelect(index)}
                  className="pointer-events-auto cursor-pointer text-2xl md:text-3xl lg:text-[34px] leading-snug tracking-wide outline-none text-center md:text-left"
                  style={{
                    fontFamily: 'Play, Helvetica Neue, Arial, sans-serif',
                    color: isActive ? 'var(--color-ps2-accent)' : '#787878',
                    textShadow: isActive
                      ? '0 2px 6px rgba(0,0,0,0.9), 0 0 22px rgba(var(--color-ps2-accent-glow),0.5), 0 0 50px rgba(var(--color-ps2-accent-glow),0.25)'
                      : '0 2px 5px rgba(0,0,0,0.9)',
                  }}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  // Text flows in only once the ring has mostly formed,
                  // like the reference ("Browser" appears after the dots)
                  transition={{ delay: (intro ? 1.7 : 0.2) + index * 0.18, duration: 0.7 }}
                  whileHover={isActive ? { scale: 1.02 } : { scale: 1.01 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={{ scale: isActive ? 1 : 0.82, opacity: isActive ? 1 : 0.75 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
