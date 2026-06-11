'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  progress: number
  onComplete: () => void
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (progress >= 100 && minTimeElapsed) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onComplete, 500)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [progress, minTimeElapsed, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ps2-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Progress bar container */}
          <div className="w-2/5 max-w-[400px] min-w-[200px]">
            <div className="h-[3px] bg-ps2-card rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--color-ps2-accent-deep), var(--color-ps2-accent-mid))',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Loading text */}
          <motion.p
            className="mt-4 text-sm text-ps2-text-dim font-[var(--font-ps2)] tracking-widest"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Loading...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
