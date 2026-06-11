export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getYouTubeThumbnail(url: string, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault'): string {
  const id = extractYouTubeId(url)
  if (!id) return '/images/placeholder-thumb.jpg'
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`
}

export function getYouTubeEmbedUrl(url: string): string {
  const id = extractYouTubeId(url)
  if (!id) return ''
  return `https://www.youtube-nocookie.com/embed/${id}`
}

export const CATEGORIES = [
  { id: 'videography', label: 'Videography', icon: 'camera' },
  { id: 'photography', label: 'Photography', icon: 'aperture' },
  { id: 'animation', label: 'Animation', icon: 'cube' },
  { id: 'clothing-design', label: 'Clothing Design', icon: 'shirt' },
  { id: 'design-creative-direction', label: 'Design / Creative Direction', icon: 'palette' },
] as const

export const VIDEOGRAPHY_SUBS = [
  { id: 'all', label: 'All' },
  { id: 'social-media', label: 'Social Media' },
  { id: 'short-films', label: 'Short Films' },
  { id: 'ads', label: 'Ads' },
  { id: 'documentaries', label: 'Documentaries' },
  { id: 'non-commercial', label: 'Non-commercial' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']
