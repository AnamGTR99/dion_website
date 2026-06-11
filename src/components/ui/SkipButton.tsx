'use client'

import { motion } from 'framer-motion'

interface SkipButtonProps {
  onClick: () => void
}

export default function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 text-sm text-ps2-text-muted hover:text-ps2-text transition-colors font-[var(--font-ps2)] tracking-wider"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      whileHover={{ x: 4 }}
    >
      Skip &gt;
    </motion.button>
  )
}
