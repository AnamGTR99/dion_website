/**
 * ps2.config.ts — single source of truth for every tunable in the 3D scenes.
 *
 * Reference: PS2 no-disc boot sequence (youtube.com/watch?v=HUyRfqJew1A)
 *   0:00–0:07  block-city flythrough  → BootScene.tsx  (BOOT below)
 *   0:09–0:20  swirling orb menu      → MenuScene.tsx  (MENU_SCENE below)
 *
 * To swap the whole site back to the original PS2 grey/blue look,
 * change ACTIVE_PALETTE to 'classic'. All timings are in seconds,
 * all distances in world units, all angles in degrees unless noted.
 */

export type PaletteName = 'brand' | 'classic'

/** 'brand' = Dion's orange/red rebrand (client request). 'classic' = original PS2 blue. */
export const ACTIVE_PALETTE: PaletteName = 'brand'

export const PALETTES = {
  brand: {
    background: '#000000',
    /** Block city — kept metallic grey like the original, warmed slightly */
    block: { tint: '#b0a89e', variance: 0.3 },
    /** The glowing crater at the centre of the city */
    glow: { core: '#ff8844', light: '#cc4400', ambient: '#1a0d04' },
    debris: '#16120e',
    /** Tiny fast light streaks above the city */
    sparks: ['#aaff66', '#ff5533', '#ffaa33'],
    /** Menu orb swarm */
    orb: { core: '#fff3e4', halo: '#ffaa66', mist: '#7a2c0c' },
    /** Drifting star dots between boot and menu */
    stars: ['#ffd9aa', '#ff8855', '#aaccff', '#ffffff', '#cc8866'],
  },
  classic: {
    background: '#000000',
    block: { tint: '#a8aeba', variance: 0.3 },
    glow: { core: '#88aaff', light: '#3355cc', ambient: '#0a0e1f' },
    debris: '#101218',
    sparks: ['#aaff66', '#ff5533', '#ffffff'],
    orb: { core: '#eef6ff', halo: '#8fc2ee', mist: '#143a5a' },
    stars: ['#aaffcc', '#88aaff', '#ccaaff', '#ffffff', '#aabbcc'],
  },
} as const

export const palette = PALETTES[ACTIVE_PALETTE]

/** Deterministic seed so the city layout is identical on every boot. Change for a new layout. */
export const SEED = 20260611

// ──────────────────────────────────────────────────────────────
// BOOT SEQUENCE (0:00–0:07 of the reference)
// Timeline: black → city fades in → text → cruise → plunge → stars → menu
// ──────────────────────────────────────────────────────────────
export const BOOT = {
  /** Black cover fades off the moving city over [start, end] */
  cityReveal: { start: 0.4, end: 1.8 },
  /** "by Dion Camilleri" overlay (the "Sony Computer Entertainment" moment) */
  text: { fadeInStart: 2.0, fadeInEnd: 2.8, fadeOutStart: 4.6, fadeOutEnd: 5.1 },
  /** Slow descent phase length — the plunge starts when this ends */
  cruiseDuration: 5.0,
  /** Fade to black during the plunge [start, end] (absolute time) */
  blackout: { start: 5.35, end: 5.9 },
  /** Star drift phase [start, end] (absolute). onComplete fires at end. */
  stars: { start: 6.0, end: 8.3, count: 14 },

  camera: {
    /** Narrow FOV from high above = the telephoto compression of the original */
    fov: 28,
    /** Height above the city at t=0 */
    startY: 30,
    /** Cruise: slow sink + slow roll + tiny lateral drift */
    cruise: { descentPerSec: 0.55, rollDegPerSec: 2.5, driftX: 0.12 },
    /** Plunge: quadratic acceleration straight down with extra roll */
    plunge: { descent: 26, rollDeg: 50 },
  },

  /** The block city. Footprint of each block is `blockSize`, grid pitch is `cell`. */
  grid: {
    cols: 22,
    rows: 17,
    cell: 1.18,
    blockSize: 1.0,
    /** Chance a grid cell is an empty black shaft */
    gapChance: 0.16,
    minHeight: 0.6,
    maxHeight: 7.5,
    /** Radius (in cells) of the glowing crater carved out of the centre */
    craterRadius: 2.1,
  },

  /** Dark tumbling cubes floating above the city */
  debris: { floating: 6, resting: 4, minSize: 0.7, maxSize: 1.5 },
  /** Fast little light streaks */
  sparkCount: 3,

  bloom: { intensity: 0.9, threshold: 0.5, radius: 0.7 },
} as const

// ──────────────────────────────────────────────────────────────
// MENU ORB SWARM (0:09–0:20 of the reference)
// The cluster cycles: dotted ring → comet sweep → droplet → ring
// ──────────────────────────────────────────────────────────────
export const MENU_SCENE = {
  orbCount: 10,
  ringRadius: 1.15,
  /** Ring plane tilt (radians) so it reads as 3D, like the reference */
  ringTilt: 0.38,
  /** Whole-cluster rotation, rad/s (reference turns slowly counter-clockwise) */
  rotateSpeed: 0.22,
  /** Per-orb brightness/scale pulse */
  pulse: { speed: 1.6, amount: 0.18 },
  orbSize: { core: 0.07, halo: 0.26 },

  /** Formation cycle (seconds). Inside one cycle:
   *  compress = orbs bunch into the comet "C", collapse = merge into a droplet */
  cycle: {
    length: 11.5,
    compress: { rampIn: [6.0, 7.0], rampOut: [9.5, 10.8], amount: 0.65 },
    collapse: { rampIn: [7.8, 8.6], rampOut: [9.2, 10.2] },
  },

  /** Motion-smear trail sprites per orb */
  trail: { perOrb: 4, frameGap: 2, baseOpacity: 0.0, speedOpacity: 2.4 },

  /** Orbs fly in from scattered space when the menu mounts (continues the boot stars) */
  convergeDuration: 1.6,

  /** Cluster placement per screen, like the reference: left of the menu text.
   *  xFrac/yFrac are fractions of the visible viewport width/height. */
  cluster: {
    menu: { xFrac: -0.18, yFrac: 0.04, z: 0, scale: 1.0 },
    page: { xFrac: -0.27, yFrac: 0.16, z: 0, scale: 0.8 },
  },
  /** Big soft nebula sprites behind the cluster */
  mist: { count: 3, opacity: 0.022, scale: 4 },

  camera: { fov: 45, z: 5.2, parallax: 0.14 },
  bloom: { intensity: 0.85, threshold: 0.3, radius: 0.7 },
} as const

// ──────────────────────────────────────────────────────────────
// Small deterministic RNG (mulberry32) — keeps layouts stable per SEED
// ──────────────────────────────────────────────────────────────
export function createRng(seed: number = SEED) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
