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

/** 'classic' = original PS2 blue (client feedback 2026-06: "OG Sony look").
 *  'brand' = the earlier orange/red rebrand — now exposed as Visual Filter 2
 *  via a CSS hue-rotate instead of a palette swap (see lib/profile.ts). */
export const ACTIVE_PALETTE: PaletteName = 'classic'

export const PALETTES = {
  brand: {
    background: '#000000',
    /** Block city — kept metallic grey like the original, warmed slightly */
    block: { tint: '#b0a89e', variance: 0.3 },
    /** The glowing crater at the centre of the city */
    glow: { core: '#ff8844', light: '#cc4400', ambient: '#1a0d04' },
    /** Layered crater gas wisps */
    smoke: ['#dd8855', '#aa5533'],
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
    /** Cool grey, tops near-white. High variance = the patchy mix of bright
     *  and mid-grey tops in the reference */
    block: { tint: '#bcc4d2', variance: 0.45 },
    glow: { core: '#88aaff', light: '#3355cc', ambient: '#0a0e1f' },
    /** Layered crater gas wisps — reference smoke is blue with purple fringes */
    smoke: ['#6688dd', '#7755cc'],
    debris: '#101218',
    /** Reference boot ball colours: red, blue, green, purple, pink, amber */
    sparks: ['#ff5544', '#5588ff', '#77ee77', '#bb77ff', '#ff77bb', '#ffaa44'],
    orb: { core: '#eef6ff', halo: '#8fc2ee', mist: '#143a5a' },
    stars: ['#aaffcc', '#88aaff', '#ccaaff', '#ffffff', '#aabbcc'],
  },
} as const

export const palette = PALETTES[ACTIVE_PALETTE]

/** Deterministic seed so the city layout is identical on every boot. Change for a new layout. */
export const SEED = 20260611

// ──────────────────────────────────────────────────────────────
// BOOT SEQUENCE — timed 1:1 against the startup reference
// (youtube.com/watch?v=YWWjTYlSp2M): black → city fades in drifting →
// SCE text up early and HELD while coloured light balls fly past →
// text out → plunge → blackout → star drift → menu
// ──────────────────────────────────────────────────────────────
export const BOOT = {
  /** Black cover eases off the moving city (client: console-exact felt
   *  rushed — pacing relaxed ~1.4× while keeping the reference beats) */
  cityReveal: { start: 0.9, end: 1.9 },
  /** "by Dion Camilleri" overlay (the "Sony Computer Entertainment" moment) */
  text: { fadeInStart: 2.8, fadeInEnd: 3.4, fadeOutStart: 6.2, fadeOutEnd: 6.7 },
  /** Slow descent phase length — the plunge starts when this ends */
  cruiseDuration: 6.8,
  /** Fade to black during the plunge [start, end] (absolute time) — late
   *  enough that the pillars visibly rush past the camera first (b030) */
  blackout: { start: 7.35, end: 7.95 },
  /** Black beat after the plunge before the menu mounts (seconds). The
   *  drifting-dots phase now lives in the MENU's converge-in, so the balls
   *  flow straight from scatter into the ring — no dead screen. */
  blackBeat: 0.35,

  camera: {
    /** Narrow FOV from high above = the telephoto compression of the original */
    fov: 28,
    /** Height above the city at t=0 — whole slab in frame with a black border */
    startY: 54,
    /** Near top-down — just a whisper of tilt so edges read as 3D */
    pitch: 0.08,
    /** Cruise: gentle sink + slow roll + tiny lateral drift */
    cruise: { descentPerSec: 1.5, rollDegPerSec: 2.5, driftX: 0.12 },
    /** Plunge: quadratic acceleration down INTO the pillars with extra roll */
    plunge: { descent: 55, rollDeg: 50 },
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

  /** Dark tumbling shards floating above the city — the reference chunks
   *  are big irregular angular lumps, not neat cubes */
  debris: { floating: 6, resting: 4, minSize: 0.9, maxSize: 2.2 },
  /** Layered swirling gas over the crater: counter-rotating translucent
   *  wisps in blue + purple that slowly grow through the boot */
  smoke: { layers: 7, baseScale: 2.6, growthPerSec: 0.14, riseSpeed: 0.07 },
  /** The coloured light balls flying above the city (the reference comets).
   *  trail = smear sprites behind each head, trailGap = seconds between them. */
  orbs: { count: 7, trail: 4, trailGap: 0.05, minSize: 0.3, maxSize: 0.55, minSpeed: 5, maxSpeed: 10 },

  /** Bloom tuned so the brightest tops shimmer — the polished sheen */
  bloom: { intensity: 1.05, threshold: 0.42, radius: 0.7 },
} as const

// ──────────────────────────────────────────────────────────────
// MENU ORB SWARM (0:09–0:20 of the reference)
// The cluster cycles: dotted ring → comet sweep → droplet → ring
// ──────────────────────────────────────────────────────────────
export const MENU_SCENE = {
  orbCount: 11,
  ringRadius: 0.9,
  /** Fraction of the circle the dots occupy — the reference formation is a
   *  SNAKE spanning ~half the ring (fine-frame study g020–g038): bright head,
   *  dots dimming and shrinking toward the tail */
  arcSpan: 0.5,
  /** Head → tail falloff along the snake */
  snake: { tailDim: 0.55, tailShrink: 0.35 },
  /** Ring plane tilt (radians) — the reference ring is near face-on */
  ringTilt: 0.16,
  /** Whole-cluster rotation, rad/s. NEGATIVE = clockwise on screen — the
   *  reference head travels bottom → left → top (g026 → g032 → g038). */
  rotateSpeed: -0.16,
  /** Per-orb brightness/scale pulse */
  pulse: { speed: 1.6, amount: 0.18 },
  orbSize: { core: 0.07, halo: 0.17 },

  /** Formation cycle (seconds). Inside one cycle:
   *  compress = dots fuse into the solid crescent smear (reference f023),
   *  collapse = merge into a single comet head that orbits the ring path
   *  fast with a tail tracing the arc (reference f025–f027) */
  cycle: {
    length: 11.5,
    compress: { rampIn: [6.0, 7.0], rampOut: [9.5, 10.8], amount: 0.8 },
    collapse: { rampIn: [7.8, 8.6], rampOut: [9.2, 10.2] },
    /** Extra orbital speed (rad/s) the comet head gains at full collapse —
     *  negative to keep the clockwise direction of the dotted phase */
    comet: { orbitSpeed: -2.6 },
  },

  /** Motion-smear trail sprites per orb */
  trail: { perOrb: 6, frameGap: 3, baseOpacity: 0.0, speedOpacity: 3.2 },

  /** Orbs fly in from scattered space when the menu mounts — this IS the
   *  drifting-dots beat after the plunge (coloured, fading to white-blue
   *  as the ring forms), so it runs long enough to read as its own moment */
  convergeDuration: 2.4,

  /** Cluster placement per screen, like the reference: left of the menu text.
   *  xFrac/yFrac are fractions of the visible viewport width/height.
   *  Reference cluster is small — ~15% of screen width. */
  cluster: {
    menu: { xFrac: -0.1, yFrac: 0.02, z: 0, scale: 0.62 },
    page: { xFrac: -0.27, yFrac: 0.16, z: 0, scale: 0.5 },
  },
  /** Big soft nebula sprites behind the cluster — the faint haze disc */
  mist: { count: 3, opacity: 0.045, scale: 3.4 },

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
