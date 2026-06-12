'use client'

/**
 * The visitor profile chip — top right of the portfolio screens, exactly
 * like the reduciano reference: gamertag and Ⓓ-score left of a square
 * avatar tile. Clicking it opens the Edit Profile panel.
 */

import { motion } from 'framer-motion'
import { useProfileStore } from '@/lib/profile'
import ProfileAvatar from './ProfileAvatar'

export const DSCORE = 300

export default function ProfileWidget({ dark, delay = 0.2 }: { dark: boolean; delay?: number }) {
  const { name, avatarId, openModal } = useProfileStore()

  return (
    <motion.button
      onClick={openModal}
      className="flex items-start gap-2.5 cursor-pointer group"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      aria-label="Edit profile"
    >
      <div className="flex flex-col items-end gap-0.5">
        <span
          className="text-base md:text-lg font-bold leading-none transition-transform group-hover:scale-[1.03]"
          style={{
            color: dark ? '#1d1d1a' : '#f2f2f2',
            textShadow: dark ? '0 1px 1px rgba(255,255,255,0.35)' : '0 1px 3px rgba(0,0,0,0.85)',
          }}
        >
          {name}
        </span>
        <span
          className="text-xs flex items-center gap-1"
          style={{
            color: dark ? '#3a3a36' : '#d0d0d0',
            textShadow: dark ? '0 1px 1px rgba(255,255,255,0.3)' : '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {DSCORE}
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border text-[9px] font-bold leading-none"
            style={{ borderColor: 'currentcolor' }}
          >
            D
          </span>
        </span>
      </div>
      <div
        className="w-10 h-10 md:w-11 md:h-11 rounded-[3px] overflow-hidden shrink-0 transition-transform group-hover:scale-105"
        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.18)' }}
      >
        <ProfileAvatar avatarId={avatarId} className="w-full h-full" />
      </div>
    </motion.button>
  )
}
