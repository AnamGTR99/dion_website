'use client'

/**
 * BootScene — 1:1 recreation of the PS2 no-disc boot (reference 0:00–0:07):
 *
 *   black → top-down block city fades in, slowly sinking + rotating,
 *   dark debris cubes tumbling above, glowing crater at the centre,
 *   "by Dion Camilleri" overlaid (the "Sony Computer Entertainment" moment)
 *   → violent plunge straight down through the city → black → drifting
 *   star particles → menu.
 *
 * Every tunable lives in ps2.config.ts (BOOT / PALETTES).
 */

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { BOOT, palette, createRng, smoothstep } from './ps2.config'
import { makeNoiseTexture, makeGlowTexture, makeMistTexture } from './textures'

const DEG = Math.PI / 180

// ── Block city — grid of flat-topped towers seen from above ──
function BlockCity() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const noiseTex = useMemo(() => makeNoiseTexture(), [])

  const { count, matrices, colors, topSpots } = useMemo(() => {
    const g = BOOT.grid
    const rng = createRng()
    const dummy = new THREE.Object3D()
    const mats: THREE.Matrix4[] = []
    const cols: THREE.Color[] = []
    const tops: { x: number; y: number; z: number }[] = []
    const tint = new THREE.Color(palette.block.tint)
    const glowTint = new THREE.Color(palette.glow.light)

    for (let c = 0; c < g.cols; c++) {
      for (let r = 0; r < g.rows; r++) {
        const x = (c - (g.cols - 1) / 2) * g.cell
        const z = (r - (g.rows - 1) / 2) * g.cell
        const distCells = Math.sqrt(
          ((c - (g.cols - 1) / 2) * (c - (g.cols - 1) / 2)) +
          ((r - (g.rows - 1) / 2) * (r - (g.rows - 1) / 2))
        )

        // Glowing crater carved out of the centre
        if (distCells < g.craterRadius && rng() < 0.8) continue
        // Random empty black shafts
        if (rng() < g.gapChance) continue

        // Heights cluster in steps like the reference; rim of the crater is lower
        let h = g.minHeight + rng() * (g.maxHeight - g.minHeight)
        h = Math.round(h * 2) / 2
        if (distCells < g.craterRadius + 1.6) h *= 0.45

        dummy.position.set(x, 0, z)
        dummy.scale.set(g.blockSize, h, g.blockSize)
        dummy.updateMatrix()
        mats.push(dummy.matrix.clone())

        // Per-block brightness variance (the reference city is patchy),
        // tinted toward the crater glow colour near the centre
        const v = 1 - rng() * palette.block.variance
        const col = tint.clone().multiplyScalar(v)
        const glowMix = Math.max(0, 1 - distCells / (g.craterRadius + 2.5)) * 0.3
        col.lerp(glowTint, glowMix)
        cols.push(col)

        if (h > 3 && rng() < 0.2) tops.push({ x, y: h, z })
      }
    }
    return { count: mats.length, matrices: mats, colors: cols, topSpots: tops }
  }, [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i])
      mesh.setColorAt(i, colors[i])
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [count, matrices, colors])

  // Box with its origin at the base so per-instance Y-scale = height.
  // Shading is baked into vertex colours (unlit, like the original intro):
  // bright top face, near-black sides — the camera only ever looks down.
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.translate(0, 0.5, 0)
    const colorAttr = new Float32Array(24 * 3)
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z (4 verts each)
    for (let v = 0; v < 24; v++) {
      const face = Math.floor(v / 4)
      const level = face === 2 ? 1.0 : face === 3 ? 0.0 : 0.05
      colorAttr[v * 3] = colorAttr[v * 3 + 1] = colorAttr[v * 3 + 2] = level
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3))
    return geo
  }, [])

  return (
    <>
      <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
        <meshBasicMaterial map={noiseTex} vertexColors />
      </instancedMesh>
      <RestingDebris spots={topSpots} />
      <TopGlints spots={topSpots} />
    </>
  )
}

// ── Specular glints sparkling on random block tops ───────────
function TopGlints({ spots }: { spots: { x: number; y: number; z: number }[] }) {
  const glowTex = useMemo(() => makeGlowTexture(64, 0.2), [])
  const refs = useRef<(THREE.Sprite | null)[]>([])

  const glints = useMemo(() => {
    const rng = createRng(31337)
    const shuffled = [...spots].sort(() => rng() - 0.5)
    return shuffled.slice(0, 6).map((s) => ({
      pos: [s.x + (rng() - 0.5) * 0.4, s.y + 0.06, s.z + (rng() - 0.5) * 0.4] as const,
      period: 2.2 + rng() * 2.6,
      offset: rng() * 6,
    }))
  }, [spots])

  useFrame(({ clock }) => {
    glints.forEach((g, i) => {
      const sprite = refs.current[i]
      if (!sprite) return
      const t = (clock.elapsedTime + g.offset) % g.period
      // Brief sparkle: sharp in, sharp out
      const k = t / g.period
      const sparkle = Math.max(0, Math.sin(k * Math.PI) ** 6)
      ;(sprite.material as THREE.SpriteMaterial).opacity = sparkle * 0.85
      sprite.scale.setScalar(0.25 + sparkle * 0.35)
    })
  })

  return (
    <>
      {glints.map((g, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el }} position={[...g.pos]}>
          <spriteMaterial
            map={glowTex}
            color="#ffffff"
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0}
          />
        </sprite>
      ))}
    </>
  )
}

// ── Dark cubes resting on top of random towers ───────────────
function RestingDebris({ spots }: { spots: { x: number; y: number; z: number }[] }) {
  const picks = useMemo(() => {
    const rng = createRng(42)
    return [...spots].sort(() => rng() - 0.5).slice(0, BOOT.debris.resting)
  }, [spots])

  return (
    <>
      {picks.map((s, i) => (
        <mesh key={i} position={[s.x, s.y + 0.45, s.z]} rotation={[0, i * 0.7, 0]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshBasicMaterial color={palette.debris} />
        </mesh>
      ))}
    </>
  )
}

// ── Dark cubes tumbling slowly in the air above the city ─────
function FloatingDebris() {
  const groupRef = useRef<THREE.Group>(null)

  const cubes = useMemo(() => {
    const rng = createRng(1337)
    const d = BOOT.debris
    return Array.from({ length: d.floating }, () => ({
      pos: [(rng() - 0.5) * 14, 8.5 + rng() * 2.5, (rng() - 0.5) * 12] as const,
      size: d.minSize + rng() * (d.maxSize - d.minSize),
      spin: [(rng() - 0.5) * 0.5, (rng() - 0.5) * 0.5, (rng() - 0.5) * 0.5] as const,
      drift: (rng() - 0.5) * 0.15,
    }))
  }, [])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    group.children.forEach((child, i) => {
      const c = cubes[i]
      child.rotation.x += c.spin[0] * delta
      child.rotation.y += c.spin[1] * delta
      child.rotation.z += c.spin[2] * delta
      child.position.y += c.drift * delta
    })
  })

  return (
    <group ref={groupRef}>
      {cubes.map((c, i) => (
        <mesh key={i} position={[...c.pos]}>
          <boxGeometry args={[c.size, c.size, c.size]} />
          <meshBasicMaterial color={palette.debris} />
        </mesh>
      ))}
    </group>
  )
}

// ── Glowing crater at the centre of the city ─────────────────
function CraterGlow() {
  const mistTex = useMemo(() => makeMistTexture(), [])
  const spriteRef = useRef<THREE.Sprite>(null)

  useFrame(({ clock }) => {
    const flicker = 1 + Math.sin(clock.elapsedTime * 3.1) * 0.08 + Math.sin(clock.elapsedTime * 7.7) * 0.05
    if (spriteRef.current) (spriteRef.current.material as THREE.SpriteMaterial).opacity = 0.5 * flicker
  })

  return (
    // Soft light spilling up from the crater depths — blocks occlude its edges
    <sprite ref={spriteRef} position={[0, 0.6, 0]} scale={[3.2, 3.2, 1]}>
      <spriteMaterial
        map={mistTex}
        color={palette.glow.core}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
      />
    </sprite>
  )
}

// ── Tiny fast light streaks shooting above the city ──────────
function Sparks() {
  const glowTex = useMemo(() => makeGlowTexture(64, 0.1), [])
  const refs = useRef<(THREE.Sprite | null)[]>([])

  const sparks = useMemo(() => {
    const rng = createRng(99)
    return Array.from({ length: BOOT.sparkCount }, (_, i) => ({
      color: palette.sparks[i % palette.sparks.length],
      origin: new THREE.Vector3((rng() - 0.5) * 12, 7 + rng() * 2.5, (rng() - 0.5) * 10),
      dir: new THREE.Vector3(rng() - 0.5, (rng() - 0.5) * 0.2, rng() - 0.5).normalize(),
      speed: 7 + rng() * 7,
      delay: rng() * 3,
      life: 1.2 + rng() * 0.8,
    }))
  }, [])

  useFrame(({ clock }) => {
    sparks.forEach((s, i) => {
      const sprite = refs.current[i]
      if (!sprite) return
      const t = (clock.elapsedTime + s.delay) % (s.life + 2.5)
      if (t > s.life) {
        ;(sprite.material as THREE.SpriteMaterial).opacity = 0
        return
      }
      sprite.position.copy(s.origin).addScaledVector(s.dir, t * s.speed)
      const fade = Math.sin((t / s.life) * Math.PI)
      ;(sprite.material as THREE.SpriteMaterial).opacity = fade * 0.9
    })
  })

  return (
    <>
      {sparks.map((s, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el }} scale={[0.5, 0.08, 1]}>
          <spriteMaterial
            map={glowTex}
            color={s.color}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0}
          />
        </sprite>
      ))}
    </>
  )
}

// The shared boot timeline starts at the FIRST RENDERED FRAME, not at clock
// creation — shader compilation can delay the first frame by seconds, and
// clock.elapsedTime would then skip most of the sequence.
const bootStart = { t: null as number | null }
function bootTime(elapsed: number) {
  if (bootStart.t === null || elapsed < bootStart.t) bootStart.t = elapsed
  return elapsed - bootStart.t
}

// ── Camera — top-down cruise, then the plunge ────────────────
function CameraRig({ onPlungeDone }: { onPlungeDone: () => void }) {
  const done = useRef(false)

  useFrame(({ camera, clock }) => {
    const cam = BOOT.camera
    const t = bootTime(clock.elapsedTime)
    const cruiseT = Math.min(t, BOOT.cruiseDuration)

    let y = cam.startY - cam.cruise.descentPerSec * cruiseT
    let roll = cam.cruise.rollDegPerSec * DEG * cruiseT

    if (t > BOOT.cruiseDuration) {
      const pt = t - BOOT.cruiseDuration
      y -= cam.plunge.descent * pt * pt
      roll += cam.plunge.rollDeg * DEG * pt * pt
      if (!done.current && pt > 1.1) {
        done.current = true
        onPlungeDone()
      }
    }

    camera.rotation.order = 'YXZ'
    camera.rotation.x = -Math.PI / 2
    camera.rotation.y = roll
    camera.rotation.z = 0
    camera.position.set(Math.sin(t * 0.25) * cam.cruise.driftX, y, 0)
  })

  return null
}

// Drives the DOM overlays (black cover + brand text) straight from the
// Canvas clock, so they can never drift from the 3D timeline.
function OverlayDriver({
  coverRef,
  textRef,
}: {
  coverRef: React.RefObject<HTMLDivElement | null>
  textRef: React.RefObject<HTMLDivElement | null>
}) {
  useFrame(({ clock }) => {
    const t = bootTime(clock.elapsedTime)
    const cover =
      t < BOOT.blackout.start
        ? 1 - smoothstep(BOOT.cityReveal.start, BOOT.cityReveal.end, t)
        : smoothstep(BOOT.blackout.start, BOOT.blackout.end, t)
    if (coverRef.current) coverRef.current.style.opacity = String(cover)

    const text =
      smoothstep(BOOT.text.fadeInStart, BOOT.text.fadeInEnd, t) *
      (1 - smoothstep(BOOT.text.fadeOutStart, BOOT.text.fadeOutEnd, t))
    if (textRef.current) textRef.current.style.opacity = String(text)
  })
  return null
}

function CityScene({
  onPlungeDone,
  coverRef,
  textRef,
}: {
  onPlungeDone: () => void
  coverRef: React.RefObject<HTMLDivElement | null>
  textRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <>
      <color attach="background" args={[palette.background]} />
      <fogExp2 attach="fog" args={[palette.background, 0.016]} />

      <BlockCity />
      <FloatingDebris />
      <CraterGlow />
      <Sparks />
      <CameraRig onPlungeDone={onPlungeDone} />
      <OverlayDriver coverRef={coverRef} textRef={textRef} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={BOOT.bloom.threshold}
          intensity={BOOT.bloom.intensity}
          radius={BOOT.bloom.radius}
        />
      </EffectComposer>
    </>
  )
}

// ── Drifting star dots on black (the beat before the menu) ───
function StarDrift() {
  const stars = useMemo(() => {
    const rng = createRng(2024)
    return Array.from({ length: BOOT.stars.count }, () => ({
      left: 15 + rng() * 70,
      top: 12 + rng() * 70,
      color: palette.stars[Math.floor(rng() * palette.stars.length)],
      size: 1.5 + rng() * 2.5,
      dx: (rng() - 0.5) * 30,
      dy: (rng() - 0.5) * 24,
      delay: rng() * 0.8,
      dur: 2.6 + rng() * 1.4,
    }))
  }, [])

  return (
    <motion.div
      className="absolute inset-0 bg-black overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0.4, 0.9], x: s.dx, y: s.dy }}
          transition={{ duration: s.dur, delay: s.delay, ease: 'linear' }}
        />
      ))}
    </motion.div>
  )
}

// ── Main component — owns the boot timeline ──────────────────
interface BootSceneProps {
  onAnimationComplete: () => void
}

export default function BootScene({ onAnimationComplete }: BootSceneProps) {
  const [phase, setPhase] = useState<'city' | 'stars'>('city')
  const coverRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  // Stars phase ends the boot
  useEffect(() => {
    if (phase !== 'stars') return
    const timer = setTimeout(
      () => onAnimationComplete(),
      (BOOT.stars.end - BOOT.stars.start) * 1000
    )
    return () => clearTimeout(timer)
  }, [phase, onAnimationComplete])

  return (
    <div className="fixed inset-0 z-40 bg-black">
      {phase === 'city' && (
        <>
          <Canvas
            camera={{ fov: BOOT.camera.fov, near: 0.1, far: 80, position: [0, BOOT.camera.startY, 0] }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false }}
          >
            <CityScene
              onPlungeDone={() => setPhase('stars')}
              coverRef={coverRef}
              textRef={textRef}
            />
          </Canvas>

          {/* CRT corner vignette over the city, like the reference footage */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 105% 100% at 50% 48%, transparent 58%, rgba(0,0,0,0.55) 88%, rgba(0,0,0,0.8) 100%)',
            }}
          />

          {/* Black cover: reveals the already-moving city, then swallows the
              plunge. Opacity is driven per-frame by OverlayDriver. */}
          <div
            ref={coverRef}
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: 1 }}
          />

          {/* The "Sony Computer Entertainment" moment, rebranded.
              Opacity driven per-frame by OverlayDriver. */}
          <div
            ref={textRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0 }}
          >
            <p
              className="text-white text-lg md:text-2xl -translate-x-4"
              style={{
                fontFamily: 'Play, Helvetica Neue, Arial, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.02em',
                textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 14px rgba(255,255,255,0.25)',
              }}
            >
              by Dion Camilleri
            </p>
          </div>
        </>
      )}

      <AnimatePresence>{phase === 'stars' && <StarDrift key="stars" />}</AnimatePresence>
    </div>
  )
}
