'use client'

/**
 * Info & Contact — a clone of the PS2 "Version Information" screen:
 * black space with the orb cluster floating left, gold page title,
 * a stacked list of sections (active = lit, like "Console SCPH-39003"),
 * and label/value rows beneath. ○ Back prompt handled by PS2Chrome.
 */

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const MenuScene = dynamic(() => import('@/components/three/MenuScene'), {
  ssr: false,
  loading: () => null,
})

type InfoTab = 'bio' | 'clients' | 'contact' | 'misc'

const TABS: { id: InfoTab; label: string }[] = [
  { id: 'bio', label: 'Biography' },
  { id: 'clients', label: 'Client List' },
  { id: 'contact', label: 'Contact Me' },
  { id: 'misc', label: 'Miscellaneous' },
]

const DEMO_INFO = {
  bio: "Dion Camilleri is a multidisciplinary creative based in Malta, specializing in videography, photography, animation, clothing design, and creative direction. With a passion for visual storytelling and a keen eye for detail, Dion brings a unique perspective to every project.",
  roles: ['Videographer', 'Photographer', 'Animator', 'Clothing Designer', 'Creative Director'],
  clientList: ['Client list coming soon...'],
  contactEmail: 'hello@bydioncamilleri.com',
  socialLinks: [
    { platform: 'Behance', url: 'https://www.behance.net/dioncamilleri' },
  ],
  miscContent: 'More content coming soon.',
}

/** A "Console — SCPH-39003" style row: grey label right-aligned, white value */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <span
        className="w-28 md:w-36 shrink-0 text-right text-sm md:text-base"
        style={{ color: '#8a8a8a', textShadow: '0 2px 4px black' }}
      >
        {label}
      </span>
      <span className="text-sm md:text-base text-white" style={{ textShadow: '0 2px 4px black' }}>
        {value}
      </span>
    </div>
  )
}

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState<InfoTab>('bio')

  // Up/Down switches section, like flipping through config pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      setActiveTab((current) => {
        const idx = TABS.findIndex((t) => t.id === current)
        const next = e.key === 'ArrowDown' ? Math.min(idx + 1, TABS.length - 1) : Math.max(idx - 1, 0)
        return TABS[next].id
      })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-30 bg-black overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Orb cluster drifting on the left, like the Version Information screen */}
      <div className="fixed inset-0 pointer-events-none">
        <MenuScene variant="page" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left side belongs to the orb cluster */}
        <div className="hidden md:block md:w-2/5 shrink-0" />
        <div className="flex-1 flex flex-col justify-center px-7 pb-24 pt-16 md:pt-0 md:pl-6 md:pr-12">
        {/* Gold page title */}
        <motion.h1
          className="ps2-gold text-2xl md:text-3xl font-bold tracking-wide mb-7"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Info &amp; Contact
        </motion.h1>

        {/* Section list — active item lit, like Browser / System Configuration */}
        <motion.div
          className="flex flex-wrap md:flex-col gap-x-6 gap-y-1.5 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="text-left text-base md:text-lg tracking-wide cursor-pointer transition-all"
                style={{
                  color: isActive ? '#ffc08a' : '#787878',
                  textShadow: isActive
                    ? '0 2px 5px rgba(0,0,0,0.9), 0 0 18px rgba(255,150,70,0.45)'
                    : '0 2px 5px rgba(0,0,0,0.9)',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </motion.div>

        {/* Section content */}
        <div className="max-w-xl min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'bio' && (
                <div className="space-y-5">
                  <p className="text-sm md:text-base leading-relaxed" style={{ color: '#cfcfcf', textShadow: '0 2px 4px black' }}>
                    {DEMO_INFO.bio}
                  </p>
                  <div className="space-y-1.5">
                    <InfoRow label="Based in" value="Malta" />
                    <InfoRow label="Disciplines" value={DEMO_INFO.roles.join('  ·  ')} />
                  </div>
                </div>
              )}

              {activeTab === 'clients' && (
                <div className="space-y-1.5">
                  {DEMO_INFO.clientList.map((client, i) => (
                    <p key={i} className="text-sm md:text-base text-white" style={{ textShadow: '0 2px 4px black' }}>
                      {client}
                    </p>
                  ))}
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-1.5">
                  <InfoRow
                    label="Email"
                    value={
                      <a
                        href={`mailto:${DEMO_INFO.contactEmail}`}
                        className="hover:underline"
                        style={{ color: '#ffc08a' }}
                      >
                        {DEMO_INFO.contactEmail}
                      </a>
                    }
                  />
                  {DEMO_INFO.socialLinks.map((link) => (
                    <InfoRow
                      key={link.platform}
                      label={link.platform}
                      value={
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{ color: '#ffc08a' }}
                        >
                          {link.url.replace('https://www.', '')}
                        </a>
                      }
                    />
                  ))}
                </div>
              )}

              {activeTab === 'misc' && (
                <p className="text-sm md:text-base leading-relaxed" style={{ color: '#cfcfcf', textShadow: '0 2px 4px black' }}>
                  {DEMO_INFO.miscContent}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        </div>
      </div>
    </motion.div>
  )
}
