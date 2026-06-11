'use client'

import { useEffect, useState } from 'react'
import { useNavigationStore, type Screen } from '@/lib/store'

function ClockDisplay({ dark }: { dark: boolean }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className="text-sm"
      style={{
        color: dark ? '#3a3a36' : 'var(--color-ps2-text-dim)',
        textShadow: dark ? '0 1px 1px rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.8) 2px 2px 4px',
      }}
    >
      {time}
    </span>
  )
}

// PlayStation button prompts — clickable, like pressing the real button.
// Colors match the reference walkthrough: blue ✕, red ○, green △.
function PSButton({
  type,
  label,
  onClick,
}: {
  type: 'cross' | 'circle' | 'triangle' | 'square'
  label: string
  onClick: () => void
}) {
  const colors = {
    cross: '#4f7be8',
    circle: '#e8473b',
    triangle: '#3fbf57',
    square: '#d87cc4',
  }
  const symbols = {
    cross: '✕',
    circle: '○',
    triangle: '△',
    square: '□',
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 cursor-pointer group"
      aria-label={label}
    >
      <span
        className="text-sm font-bold transition-transform group-hover:scale-110"
        style={{ color: colors[type], textShadow: `0 1px 2px rgba(0,0,0,0.7), 0 0 8px ${colors[type]}55` }}
      >
        {symbols[type]}
      </span>
      {/* Always white with a black edge shadow — readable on dark and light screens,
          exactly like the reference prompts */}
      <span className="text-xs" style={{ color: '#f2f2f2', textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}>
        {label}
      </span>
    </button>
  )
}

function getPrompts(screen: Screen): { enter: boolean; back: boolean } {
  switch (screen) {
    case 'MENU':
      return { enter: true, back: false }
    case 'PORTFOLIO':
      return { enter: true, back: true }
    case 'GALLERY':
    case 'SHOWREEL':
    case 'INFO':
      return { enter: false, back: true }
    default:
      return { enter: false, back: false }
  }
}

/** Screens drawn on the light Memory Card browser panel need dark chrome text */
const LIGHT_SCREENS: Screen[] = ['PORTFOLIO', 'GALLERY']

// The prompts behave like the real buttons: they synthesize the same key
// events the keyboard handlers listen for.
function pressKey(key: 'Enter' | 'Escape') {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))
}

export default function PS2Chrome() {
  const currentScreen = useNavigationStore((s) => s.currentScreen)

  if (currentScreen === 'LOADING' || currentScreen === 'BOOT') {
    return null
  }

  const prompts = getPrompts(currentScreen)
  const dark = LIGHT_SCREENS.includes(currentScreen)

  return (
    <>
      {/* Brand mark + clock — top right */}
      <div className="fixed top-5 right-6 z-50 flex flex-col items-end gap-0.5">
        <div
          className="text-2xl font-bold leading-none"
          style={{
            color: '#cc4400',
            textShadow: dark
              ? '0 1px 1px rgba(255,255,255,0.4), 0 0 10px rgba(204,68,0,0.3)'
              : '0 0 10px rgba(204,68,0,0.4), 0 0 20px rgba(204,68,0,0.2)',
          }}
        >
          D
        </div>
        <ClockDisplay dark={dark} />
      </div>

      {/* PS2 button prompts — bottom centre, clickable */}
      {(prompts.enter || prompts.back) && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-10">
          {prompts.enter && <PSButton type="cross" label="Enter" onClick={() => pressKey('Enter')} />}
          {prompts.back && <PSButton type="circle" label="Back" onClick={() => pressKey('Escape')} />}
        </div>
      )}
    </>
  )
}
