'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { useNavigationStore } from '@/lib/store'
import { useProfileStore, VISUAL_FILTERS } from '@/lib/profile'
import LoadingScreen from '@/components/ui/LoadingScreen'
import PS2Chrome from '@/components/ui/PS2Chrome'
import ProfileModal from '@/components/ui/ProfileModal'
import SkipButton from '@/components/ui/SkipButton'
import SwipeMenu from '@/components/ui/SwipeMenu'
import PortfolioCategories from '@/components/ui/PortfolioCategories'
import GalleryView from '@/components/ui/GalleryView'
import ShowreelPage from '@/components/ui/ShowreelPage'
import InfoPage from '@/components/ui/InfoPage'

const BootScene = dynamic(() => import('@/components/three/BootScene'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  const { currentScreen, setScreen, bootPlayed, markBootPlayed } = useNavigationStore()
  const [loadProgress, setLoadProgress] = useState(0)
  const activeFilter = useProfileStore((s) => s.filter)
  const filterCss = VISUAL_FILTERS.find((f) => f.id === activeFilter)?.css ?? 'none'

  // Simulate loading progress (in production, useProgress from drei feeds this)
  useEffect(() => {
    if (currentScreen !== 'LOADING') return

    // Check if boot was already played this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('bootPlayed')) {
      setScreen('MENU')
      return
    }

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }
      setLoadProgress(progress)
    }, 200)

    return () => clearInterval(interval)
  }, [currentScreen, setScreen])

  const handleLoadingComplete = useCallback(() => {
    if (bootPlayed || (typeof window !== 'undefined' && sessionStorage.getItem('bootPlayed'))) {
      setScreen('MENU')
    } else {
      setScreen('BOOT')
    }
  }, [setScreen, bootPlayed])

  const handleBootComplete = useCallback(() => {
    markBootPlayed()
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bootPlayed', 'true')
    }
    setScreen('MENU')
  }, [setScreen, markBootPlayed])

  const handleSkip = useCallback(() => {
    markBootPlayed()
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bootPlayed', 'true')
    }
    setScreen('MENU')
  }, [setScreen, markBootPlayed])

  // Keyboard navigation for Back (also triggered by the clickable ○ Back prompt)
  const setActiveSubcategory = useNavigationStore((s) => s.setActiveSubcategory)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        // A modal owns Escape while open
        if (document.body.classList.contains('modal-open')) return
        switch (currentScreen) {
          case 'PORTFOLIO':
            setScreen('MENU')
            break
          case 'GALLERY':
            setActiveSubcategory(null)
            setScreen('PORTFOLIO')
            break
          case 'SHOWREEL':
          case 'INFO':
            setScreen('MENU')
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentScreen, setScreen, setActiveSubcategory])

  return (
    // The Visual Filter hue-rotates everything — DOM and 3D canvases alike
    <main
      className="relative w-full h-screen overflow-hidden bg-ps2-black"
      style={{ filter: filterCss, transition: 'filter 0.4s ease' }}
    >
      <PS2Chrome />
      <ProfileModal />

      <AnimatePresence mode="wait">
        {/* Loading screen */}
        {currentScreen === 'LOADING' && (
          <LoadingScreen
            key="loading"
            progress={loadProgress}
            onComplete={handleLoadingComplete}
          />
        )}

        {/* Boot animation */}
        {currentScreen === 'BOOT' && (
          <div key="boot">
            <BootScene onAnimationComplete={handleBootComplete} />
            <SkipButton onClick={handleSkip} />
          </div>
        )}

        {/* Main menu */}
        {currentScreen === 'MENU' && (
          <SwipeMenu key="menu" />
        )}

        {/* Portfolio categories */}
        {currentScreen === 'PORTFOLIO' && (
          <PortfolioCategories key="portfolio" />
        )}

        {/* Gallery view */}
        {currentScreen === 'GALLERY' && (
          <GalleryView key="gallery" />
        )}

        {/* Showreel */}
        {currentScreen === 'SHOWREEL' && (
          <ShowreelPage key="showreel" />
        )}

        {/* Info & Contact */}
        {currentScreen === 'INFO' && (
          <InfoPage key="info" />
        )}
      </AnimatePresence>
    </main>
  )
}
