'use client'

import { create } from 'zustand'

export type Screen =
  | 'LOADING'
  | 'BOOT'
  | 'MENU'
  | 'PORTFOLIO'
  | 'GALLERY'
  | 'SHOWREEL'
  | 'INFO'

interface NavigationState {
  currentScreen: Screen
  activeMenuIndex: number
  activeCategory: string | null
  activeSubcategory: string | null
  bootPlayed: boolean
  setScreen: (screen: Screen) => void
  setActiveMenuIndex: (index: number) => void
  setActiveCategory: (category: string | null) => void
  setActiveSubcategory: (sub: string | null) => void
  markBootPlayed: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentScreen: 'LOADING',
  activeMenuIndex: 0,
  activeCategory: null,
  activeSubcategory: null,
  bootPlayed: false,
  setScreen: (screen) => set({ currentScreen: screen }),
  setActiveMenuIndex: (index) => set({ activeMenuIndex: index }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setActiveSubcategory: (sub) => set({ activeSubcategory: sub }),
  markBootPlayed: () => set({ bootPlayed: true }),
}))
