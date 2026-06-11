'use client'

/**
 * Visitor profile — the customisable user-profile in the top right of the
 * portfolio screens (client feedback 2026-06, modelled on reduciano.com):
 * editable gamertag, selectable avatar, and the Visual Filters that
 * re-hue the whole site. Persisted to localStorage.
 *
 * Filters are CSS filter strings applied to the root <main>, so they hit
 * the 3D canvases and the DOM alike. 'og' is the authored OG Sony blue;
 * 'ember' rotates blue → the orange of the earlier brand pass.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FilterId = 'og' | 'ember' | 'verdant'

export const VISUAL_FILTERS: { id: FilterId; label: string; css: string }[] = [
  { id: 'og', label: '1', css: 'none' },
  { id: 'ember', label: '2', css: 'hue-rotate(165deg) saturate(1.1)' },
  { id: 'verdant', label: '3', css: 'hue-rotate(255deg)' },
]

export interface AvatarDef {
  id: string
  title: string
  epithet: string
  description: string
}

export const AVATARS: AvatarDef[] = [
  {
    id: 'orb',
    title: 'THE SWARM',
    epithet: '"Browser"',
    description: 'Twelve lights that never stop circling. They were here before the menu.',
  },
  {
    id: 'towers',
    title: 'THE CITY BELOW',
    epithet: '"Startup"',
    description: 'Every save you ever made, stacked into a skyline.',
  },
  {
    id: 'memcard',
    title: 'MAGIC GATE',
    epithet: '"8MB"',
    description: 'Holds everything that matters. Never enough room for one more save.',
  },
  {
    id: 'pad',
    title: 'DUAL SHOCKER',
    epithet: '"Player One"',
    description: 'Analog sticks worn smooth. It has seen things.',
  },
  {
    id: 'comet',
    title: 'STRAY LIGHT',
    epithet: '"Boot Sequence"',
    description: 'One of the coloured balls from the intro. It escaped.',
  },
  {
    id: 'crater',
    title: 'THE GLOW',
    epithet: '"Core"',
    description: 'The light at the centre of the city. Nobody knows what feeds it.',
  },
]

interface ProfileState {
  name: string
  avatarId: string
  filter: FilterId
  modalOpen: boolean
  setName: (name: string) => void
  setAvatar: (id: string) => void
  setFilter: (id: FilterId) => void
  openModal: () => void
  closeModal: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: 'PlayerOne',
      avatarId: 'orb',
      filter: 'og',
      modalOpen: false,
      setName: (name) => set({ name: name.trim().slice(0, 16) || 'PlayerOne' }),
      setAvatar: (avatarId) => set({ avatarId }),
      setFilter: (filter) => set({ filter }),
      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),
    }),
    {
      name: 'dion-profile',
      partialize: (s) => ({ name: s.name, avatarId: s.avatarId, filter: s.filter }),
    }
  )
)
