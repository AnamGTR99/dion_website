'use client'

/**
 * Showreel — PS2 config-screen styling: black space, orb cluster left,
 * gold title, the reel itself presented like a disc screen.
 * ○ Back prompt handled by PS2Chrome.
 */

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { getYouTubeEmbedUrl } from '@/lib/utils'

const MenuScene = dynamic(() => import('@/components/three/MenuScene'), {
  ssr: false,
  loading: () => null,
})

const DEMO_SHOWREEL_URL = ''

export default function ShowreelPage() {
  const embedUrl = getYouTubeEmbedUrl(DEMO_SHOWREEL_URL)

  return (
    <motion.div
      className="fixed inset-0 z-30 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {embedUrl ? (
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-10 pb-20 pt-14">
          <motion.h1
            className="ps2-gold text-2xl md:text-3xl font-bold tracking-wide mb-5 self-start max-w-[1100px] mx-auto w-full"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Showreel
          </motion.h1>
          <div
            className="relative w-full max-w-[1100px] aspect-video rounded-lg overflow-hidden"
            style={{ boxShadow: '0 0 40px rgba(255,120,40,0.12), 0 8px 30px rgba(0,0,0,0.8)' }}
          >
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Showreel"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Orb cluster left, text right — like a PS2 config screen */}
          <div className="fixed inset-0 pointer-events-none">
            <MenuScene variant="page" />
          </div>
          <div className="relative z-10 h-full flex">
            <div className="hidden md:block md:w-2/5 shrink-0" />
            <div className="flex-1 flex flex-col justify-center px-7 pb-24 pt-16 md:pt-0 md:pl-6 md:pr-12">
            <motion.h1
              className="ps2-gold text-2xl md:text-3xl font-bold tracking-wide mb-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Showreel
            </motion.h1>
            <motion.p
              className="text-sm md:text-base"
              style={{ color: '#8a8a8a', textShadow: '0 2px 4px black' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Now loading... the reel arrives soon.
            </motion.p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
