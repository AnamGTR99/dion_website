'use client'

/**
 * Gallery — continues the Memory Card browser look from the categories
 * screen: light metallic panel, gold headers, dark sub-tabs, video
 * thumbnails presented like save files.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigationStore } from '@/lib/store'
import { CATEGORIES, VIDEOGRAPHY_SUBS, getYouTubeThumbnail } from '@/lib/utils'
import VideoModal from './VideoModal'

const DEMO_VIDEOS = [
  { _id: '1', title: 'Sample Project 1', youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ', category: 'videography', subcategory: 'short-films', isFeatured: true, order: 0 },
  { _id: '2', title: 'Sample Project 2', youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ', category: 'videography', subcategory: 'ads', isFeatured: false, order: 1 },
  { _id: '3', title: 'Sample Project 3', youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ', category: 'videography', subcategory: 'social-media', isFeatured: false, order: 2 },
]

interface Video {
  _id: string
  title: string
  youtubeUrl: string
  category: string
  subcategory?: string
  isFeatured?: boolean
  order: number
}

export default function GalleryView() {
  const { activeCategory, activeSubcategory, setActiveSubcategory, setScreen } = useNavigationStore()
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  const category = CATEGORIES.find((c) => c.id === activeCategory)
  const isVideography = activeCategory === 'videography'

  const allVideos: Video[] = activeCategory === 'videography' ? DEMO_VIDEOS : []
  const filteredVideos = allVideos.filter((v) => {
    if (activeSubcategory && activeSubcategory !== 'all') return v.subcategory === activeSubcategory
    return true
  })
  const featured = filteredVideos.find((v) => v.isFeatured)
  const regularVideos = filteredVideos.filter((v) => !v.isFeatured)

  const handleBack = useCallback(() => {
    setScreen('PORTFOLIO')
    setActiveSubcategory(null)
  }, [setScreen, setActiveSubcategory])

  return (
    <motion.div
      className="fixed inset-0 z-30 overflow-y-auto ps2-browser-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="min-h-screen max-w-6xl mx-auto px-5 md:px-10 pt-8 pb-28">
        {/* Header — gold title left, like the Memory Card screen */}
        <div className="flex items-start justify-between mb-6 pr-12 md:pr-16">
          <div>
            <button
              onClick={handleBack}
              className="text-xs mb-1 cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: '#3e3e3a', textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}
            >
              &lt; Back
            </button>
            <h1 className="ps2-gold text-xl md:text-2xl font-bold tracking-wide">
              {category?.label || 'Gallery'}
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color: 'var(--color-ps2-accent-soft)', textShadow: '0 1px 1px rgba(255,255,255,0.25)' }}>
              {filteredVideos.length} {filteredVideos.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
        </div>

        {/* Sub-category tabs — dark text, gold when active */}
        {isVideography && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
            {VIDEOGRAPHY_SUBS.map((sub) => {
              const isActive = (activeSubcategory || 'all') === sub.id
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(sub.id === 'all' ? null : sub.id)}
                  className="text-xs md:text-sm tracking-wide cursor-pointer transition-all"
                  style={{
                    color: isActive ? '#9b6a10' : '#4a4a46',
                    fontWeight: isActive ? 700 : 400,
                    textShadow: '0 1px 1px rgba(255,255,255,0.3)',
                    borderBottom: isActive ? '2px solid #c8941c' : '2px solid transparent',
                    paddingBottom: 2,
                  }}
                >
                  {sub.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Featured video */}
        {featured && (
          <div className="mb-8">
            <p className="ps2-gold text-xs font-bold tracking-[0.3em] mb-3">HIGHLIGHTS</p>
            <button
              onClick={() => setSelectedVideo(featured)}
              className="group relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer"
              style={{ boxShadow: '0 6px 22px rgba(0,0,0,0.45), 0 1px 2px rgba(255,255,255,0.25) inset' }}
            >
              <img
                src={getYouTubeThumbnail(featured.youtubeUrl)}
                alt={featured.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = getYouTubeThumbnail(featured.youtubeUrl, 'hqdefault') }}
              />
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#5577dd]/70 transition-colors" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundImage: 'linear-gradient(var(--color-ps2-accent-deep) 0%, #000000 50%, var(--color-ps2-accent-deep) 100%)', boxShadow: 'rgba(0,0,0,0.75) 0px 0px 4px 2px' }}>
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white ml-1" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 to-transparent">
                <p className="text-sm text-white" style={{ textShadow: '2px 2px 5px black' }}>{featured.title}</p>
              </div>
            </button>
          </div>
        )}

        {/* Gallery grid */}
        {regularVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularVideos.map((video) => (
              <motion.button
                key={video._id}
                onClick={() => setSelectedVideo(video)}
                className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.4), 0 1px 2px rgba(255,255,255,0.25) inset' }}
                whileHover={{ scale: 1.03, y: -4 }}
              >
                <img
                  src={getYouTubeThumbnail(video.youtubeUrl)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = getYouTubeThumbnail(video.youtubeUrl, 'hqdefault') }}
                />
                <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-[#5577dd]/60 transition-colors" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundImage: 'linear-gradient(#828282 0%, #000 50%, #828282 100%)', boxShadow: 'rgba(0,0,0,0.75) 0px 0px 4px 2px' }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white ml-0.5" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 to-transparent">
                  <p className="text-xs text-white truncate" style={{ textShadow: '2px 2px 5px black' }}>{video.title}</p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : !featured ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm tracking-wide" style={{ color: '#4a4a46', textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
              No content yet — check back soon.
            </p>
          </div>
        ) : null}
      </div>

      {/* Bottom edge vignette so the white prompts stay readable */}
      <div
        className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(20,20,18,0.55), transparent)' }}
      />

      <AnimatePresence>
        {selectedVideo && <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}
