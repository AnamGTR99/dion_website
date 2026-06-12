'use client'

/**
 * BootScene — 1:1 recreation of the PS2 startup
 * (reference: youtube.com/watch?v=YWWjTYlSp2M):
 *
 *   black → top-down block city fades in, slowly sinking + rotating,
 *   dark debris cubes tumbling above, glowing crater at the centre,
 *   coloured light balls (red/blue/green/purple…) zipping past with comet
 *   trails, "by Dion Camilleri" overlaid in the PS2 face (the "Sony
 *   Computer Entertainment" moment) → violent plunge straight down
 *   through the city → black → drifting star particles → menu.
 *
 * Every tunable lives in ps2.config.ts (BOOT / PALETTES).
 */

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
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
  // bright top face, sides lit from one corner — the reference camera is
  // oblique, so the side faces are clearly visible (study frames b010–b026).
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.translate(0, 0.5, 0)
    const colorAttr = new Float32Array(24 * 3)
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z (4 verts each)
    const FACE_LEVELS = [0.45, 0.1, 1.0, 0.0, 0.38, 0.12]
    for (let v = 0; v < 24; v++) {
      const level = FACE_LEVELS[Math.floor(v / 4)]
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
    return shuffled.slice(0, 11).map((s) => ({
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

// Irregular angular shard — the reference debris are crumpled lumps, not
// neat cubes. A low-poly icosahedron with jittered vertices reads right
// in silhouette against the bright pillar tops.
function makeShardGeometry(seed: number) {
  const geo = new THREE.IcosahedronGeometry(0.5, 0)
  const rng = createRng(seed)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) * (0.7 + rng() * 0.7),
      pos.getY(i) * (0.7 + rng() * 0.7),
      pos.getZ(i) * (0.7 + rng() * 0.7)
    )
  }
  return geo
}

// ── Dark shards resting on top of random towers ──────────────
function RestingDebris({ spots }: { spots: { x: number; y: number; z: number }[] }) {
  const picks = useMemo(() => {
    const rng = createRng(42)
    return [...spots].sort(() => rng() - 0.5).slice(0, BOOT.debris.resting)
  }, [spots])
  const geos = useMemo(() => picks.map((_, i) => makeShardGeometry(7000 + i)), [picks])

  return (
    <>
      {picks.map((s, i) => (
        <mesh key={i} position={[s.x, s.y + 0.45, s.z]} rotation={[i * 1.3, i * 0.7, 0]} geometry={geos[i]}>
          <meshBasicMaterial color={palette.debris} />
        </mesh>
      ))}
    </>
  )
}

// ── Dark shards tumbling slowly in the air above the city ────
function FloatingDebris() {
  const groupRef = useRef<THREE.Group>(null)

  const shards = useMemo(() => {
    const rng = createRng(1337)
    const d = BOOT.debris
    return Array.from({ length: d.floating }, (_, i) => ({
      pos: [(rng() - 0.5) * 14, 8.5 + rng() * 2.5, (rng() - 0.5) * 12] as const,
      size: d.minSize + rng() * (d.maxSize - d.minSize),
      spin: [(rng() - 0.5) * 0.5, (rng() - 0.5) * 0.5, (rng() - 0.5) * 0.5] as const,
      drift: (rng() - 0.5) * 0.15,
      geometry: makeShardGeometry(8000 + i),
    }))
  }, [])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    group.children.forEach((child, i) => {
      const c = shards[i]
      child.rotation.x += c.spin[0] * delta
      child.rotation.y += c.spin[1] * delta
      child.rotation.z += c.spin[2] * delta
      child.position.y += c.drift * delta
    })
  })

  return (
    <group ref={groupRef}>
      {shards.map((c, i) => (
        <mesh key={i} position={[...c.pos]} scale={c.size} geometry={c.geometry}>
          <meshBasicMaterial color={palette.debris} />
        </mesh>
      ))}
    </group>
  )
}

// ── Glowing crater + layered gas over it ─────────────────────
// The reference centre is not a flat glow: translucent blue wisps with
// purple fringes counter-rotate and slowly grow through the boot, with
// the bright core flickering underneath (study frames b010–b026).
function CraterGlow() {
  const mistTex = useMemo(() => makeMistTexture(), [])
  const coreRef = useRef<THREE.Sprite>(null)
  const wispRefs = useRef<(THREE.Sprite | null)[]>([])

  const wisps = useMemo(() => {
    const rng = createRng(606)
    const s = BOOT.smoke
    return Array.from({ length: s.layers }, (_, i) => ({
      color: palette.smoke[i % palette.smoke.length],
      scale: s.baseScale * (0.8 + rng() * 0.7),
      rot: rng() * Math.PI * 2,
      // Alternate spin direction per layer — the counter-rotation is what
      // makes the gas look like it swirls
      rotSpeed: (0.12 + rng() * 0.1) * (i % 2 === 0 ? 1 : -1),
      offset: [(rng() - 0.5) * 1.2, 0.7 + i * 0.35, (rng() - 0.5) * 1.2] as const,
      opacity: 0.32 + rng() * 0.15,
      phase: rng() * Math.PI * 2,
    }))
  }, [])

  useFrame(({ clock }) => {
    const t = bootTime(clock.elapsedTime)
    const flicker = 1 + Math.sin(clock.elapsedTime * 3.1) * 0.08 + Math.sin(clock.elapsedTime * 7.7) * 0.05
    if (coreRef.current) (coreRef.current.material as THREE.SpriteMaterial).opacity = 0.5 * flicker

    wisps.forEach((w, i) => {
      const sprite = wispRefs.current[i]
      if (!sprite) return
      const mat = sprite.material as THREE.SpriteMaterial
      mat.rotation = w.rot + clock.elapsedTime * w.rotSpeed
      mat.opacity = w.opacity * (1 + Math.sin(clock.elapsedTime * 0.7 + w.phase) * 0.3)
      // The gas grows and rises slowly through the boot
      const grow = w.scale * (1 + t * BOOT.smoke.growthPerSec)
      sprite.scale.set(grow, grow, 1)
      sprite.position.set(w.offset[0], w.offset[1] + t * BOOT.smoke.riseSpeed, w.offset[2])
    })
  })

  return (
    <>
      {/* Soft light spilling up from the crater depths */}
      <sprite ref={coreRef} position={[0, 0.6, 0]} scale={[3.2, 3.2, 1]}>
        <spriteMaterial
          map={mistTex}
          color={palette.glow.core}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </sprite>
      {wisps.map((w, i) => (
        <sprite key={i} ref={(el) => { wispRefs.current[i] = el }} position={[...w.offset]}>
          <spriteMaterial
            map={mistTex}
            color={w.color}
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

// ── The coloured light balls flying above the city ───────────
// Round glowing heads (red, blue, green, purple…) with a short comet
// smear behind each, zipping past on gently bobbing paths — the most
// recognisable element of the reference boot.
function FlyingOrbs() {
  const glowTex = useMemo(() => makeGlowTexture(64, 0.3), [])
  const refs = useRef<(THREE.Group | null)[]>([])

  const orbs = useMemo(() => {
    const rng = createRng(99)
    const o = BOOT.orbs
    return Array.from({ length: o.count }, (_, i) => ({
      color: palette.sparks[i % palette.sparks.length],
      origin: new THREE.Vector3((rng() - 0.5) * 16, 6.5 + rng() * 3.5, (rng() - 0.5) * 12),
      dir: new THREE.Vector3(rng() - 0.5, (rng() - 0.5) * 0.25, rng() - 0.5).normalize(),
      speed: o.minSpeed + rng() * (o.maxSpeed - o.minSpeed),
      size: o.minSize + rng() * (o.maxSize - o.minSize),
      delay: rng() * 4,
      life: 1.6 + rng() * 1.2,
      gap: 1.5 + rng() * 2.0,
      bobPhase: rng() * 6,
    }))
  }, [])

  useFrame(({ clock }) => {
    orbs.forEach((o, i) => {
      const group = refs.current[i]
      if (!group) return
      const sprites = group.children as THREE.Sprite[]
      const t = (clock.elapsedTime + o.delay) % (o.life + o.gap)
      if (t > o.life) {
        sprites.forEach((s) => ((s.material as THREE.SpriteMaterial).opacity = 0))
        return
      }
      const fade = Math.min(1, Math.min(t, o.life - t) * 3)
      sprites.forEach((s, k) => {
        // k = 0 is the head; the rest trail it along the same path
        const tk = Math.max(0, t - k * BOOT.orbs.trailGap)
        s.position.copy(o.origin).addScaledVector(o.dir, tk * o.speed)
        s.position.y += Math.sin((tk + o.bobPhase) * 2.1) * 0.35
        const head = k === 0
        ;(s.material as THREE.SpriteMaterial).opacity =
          fade * (head ? 0.95 : 0.45 * (1 - k / sprites.length))
        s.scale.setScalar(o.size * (head ? 1 : 1 - 0.16 * k))
      })
    })
  })

  return (
    <>
      {orbs.map((o, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el }}>
          {Array.from({ length: BOOT.orbs.trail + 1 }, (_, k) => (
            <sprite key={k}>
              <spriteMaterial
                map={glowTex}
                color={o.color}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                transparent
                opacity={0}
              />
            </sprite>
          ))}
        </group>
      ))}
    </>
  )
}

// The shared boot timeline starts at the FIRST RENDERED FRAME, not at clock
// creation — shader compilation can delay the first frame by seconds, and
// clock.elapsedTime would then skip most of the sequence.
// QA hook: ?bootT=<seconds> freezes the timeline at that moment so specific
// beats can be screenshotted deterministically.
const FROZEN_T =
  typeof window !== 'undefined'
    ? Number(new URLSearchParams(window.location.search).get('bootT')) || null
    : null
const bootStart = { t: null as number | null }
function bootTime(elapsed: number) {
  if (FROZEN_T !== null) return FROZEN_T
  if (bootStart.t === null || elapsed < bootStart.t) bootStart.t = elapsed
  return elapsed - bootStart.t
}

// ── Camera — oblique birds-eye orbit cruise, then the plunge ─
// The reference is NOT straight-down: the camera is pitched off vertical
// so pillar side faces show, and it orbits/rolls slowly while sinking.
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

    // Pitched off vertical by cam.pitch; the position orbits the city centre
    // as the roll advances, so the look stays centred on the crater.
    const horiz = Math.max(0, y) * Math.tan(cam.pitch)
    camera.rotation.order = 'YXZ'
    camera.rotation.x = cam.pitch - Math.PI / 2
    camera.rotation.y = roll
    camera.rotation.z = 0
    camera.position.set(
      Math.sin(roll) * horiz + Math.sin(t * 0.25) * cam.cruise.driftX,
      y,
      Math.cos(roll) * horiz
    )
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
      <fogExp2 attach="fog" args={[palette.background, 0.011]} />

      <BlockCity />
      <FloatingDebris />
      <CraterGlow />
      <FlyingOrbs />
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

// ── Main component — owns the boot timeline ──────────────────
// After the plunge there is only a short black beat, then the menu mounts
// and its own converge-in carries the drifting balls into the ring — the
// hand-off is continuous, like the reference.
interface BootSceneProps {
  onAnimationComplete: () => void
}

export default function BootScene({ onAnimationComplete }: BootSceneProps) {
  const [plunged, setPlunged] = useState(false)
  const coverRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plunged) return
    const timer = setTimeout(() => onAnimationComplete(), BOOT.blackBeat * 1000)
    return () => clearTimeout(timer)
  }, [plunged, onAnimationComplete])

  return (
    <div className="fixed inset-0 z-40 bg-black">
      {!plunged && (
        <>
          <Canvas
            camera={{ fov: BOOT.camera.fov, near: 0.1, far: 80, position: [0, BOOT.camera.startY, 0] }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false }}
          >
            <CityScene
              onPlungeDone={() => setPlunged(true)}
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
                fontFamily: 'PS2, Play, Helvetica Neue, Arial, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.04em',
                textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 14px rgba(255,255,255,0.25)',
              }}
            >
              by Dion Camilleri
            </p>
          </div>
        </>
      )}
    </div>
  )
}
