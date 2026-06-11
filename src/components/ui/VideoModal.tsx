'use client'

import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getYouTubeEmbedUrl } from '@/lib/utils'

interface VideoModalProps {
  video: {
    title: string
    youtubeUrl: string
  }
  onClose: () => void
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Swallow the event so the global Back handler doesn't also navigate
        e.stopPropagation()
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />

      {/* Modal content */}
      <motion.div
        className="relative w-full max-w-[900px] z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Title */}
        <p className="text-sm font-[var(--font-ps2)] text-ps2-text mb-3 tracking-wider">
          {video.title}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-1 right-0 w-8 h-8 flex items-center justify-center text-ps2-text-muted hover:text-ps2-text transition-colors z-20"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Video embed */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-ps2-border bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-ps2-text-muted text-sm">
              Video unavailable
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
