'use client'

/**
 * MenuScene — the PS2 browser-menu orb swarm, matched frame-by-frame
 * against the startup reference (youtube.com/watch?v=HUyRfqJew1A, 0:06–0:17;
 * see proof_of_change.md for the study):
 *
 * Coloured scatter dots converge into a small broken ring — a "C" of
 * white-blue points with a clear gap — that drifts lazily. On a timed
 * cycle the dots fuse into a solid crescent smear, collapse into a single
 * bright comet head that orbits the ring path fast with a tail tracing
 * the arc, then break back out into the dotted ring.
 *
 * Renders as a full-screen background behind the swipe-menu cards.
 * Every tunable lives in ps2.config.ts (MENU_SCENE / PALETTES).
 */

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { MENU_SCENE as CFG, palette, createRng, smoothstep } from './ps2.config'
import { makeGlowTexture, makeMistTexture } from './textures'

export type MenuSceneVariant = 'menu' | 'page'

interface OrbData {
  baseAngle: number
  phase: number
  scatter: THREE.Vector3
  scatterColor: THREE.Color
  history: THREE.Vector3[]
}

function ringPoint(angle: number, radius: number, out: THREE.Vector3) {
  out.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.88, 0)
  // Slight tilt — the reference ring is near face-on
  out.applyAxisAngle(AXIS_X, CFG.ringTilt)
  return out
}

const CORE_COLOR = new THREE.Color()
const HALO_COLOR = new THREE.Color()

const AXIS_X = new THREE.Vector3(1, 0, 0)
const tmpRing = new THREE.Vector3()
const tmpDrop = new THREE.Vector3()

// Timeline starts at the first rendered frame — shader compilation can delay
// it well past clock creation, which would skip the converge-in animation.
// Resets automatically when a fresh Canvas (new clock) mounts.
const sceneStart = { t: null as number | null }
function sceneTime(elapsed: number) {
  if (sceneStart.t === null || elapsed < sceneStart.t) sceneStart.t = elapsed
  return elapsed - sceneStart.t
}

function OrbSwarm() {
  const glowTex = useMemo(() => makeGlowTexture(), [])
  const coreRefs = useRef<(THREE.Sprite | null)[]>([])
  const haloRefs = useRef<(THREE.Sprite | null)[]>([])
  const trailRefs = useRef<(THREE.Sprite | null)[]>([])
  const frameCount = useRef(0)

  const orbs = useMemo<OrbData[]>(() => {
    const rng = createRng(5150)
    return Array.from({ length: CFG.orbCount }, (_, i) => ({
      // The snake: orb 0 is the head at angle 0, the rest trail behind it
      // (spin is negative/clockwise, so larger angles sit behind the head)
      // over ~half the circle — evenly spaced on a clean circumference,
      // like the reference
      baseAngle: (i / (CFG.orbCount - 1)) * Math.PI * 2 * CFG.arcSpan,
      phase: rng() * Math.PI * 2,
      // Where each orb flies in from on mount, tinted like the boot stars
      scatter: new THREE.Vector3((rng() - 0.5) * 9, (rng() - 0.5) * 7, (rng() - 0.5) * 4),
      scatterColor: new THREE.Color(palette.stars[i % palette.stars.length]),
      history: Array.from({ length: CFG.trail.perOrb * CFG.trail.frameGap + 1 }, () => new THREE.Vector3()),
    }))
  }, [])

  useFrame(({ clock }) => {
    const t = sceneTime(clock.elapsedTime)
    const u = t % CFG.cycle.length
    const cyc = CFG.cycle

    // Formation envelopes: bunch into the "C", then merge into a droplet
    const compress =
      smoothstep(cyc.compress.rampIn[0], cyc.compress.rampIn[1], u) *
      (1 - smoothstep(cyc.compress.rampOut[0], cyc.compress.rampOut[1], u))
    const collapse =
      smoothstep(cyc.collapse.rampIn[0], cyc.collapse.rampIn[1], u) *
      (1 - smoothstep(cyc.collapse.rampOut[0], cyc.collapse.rampOut[1], u))

    const converge = smoothstep(0, CFG.convergeDuration, t)
    const spin = CFG.rotateSpeed * t

    // The comet head rides the ring path at FULL radius (reference f025–f027)
    // and accelerates around it while collapsed. The extra angle lives on the
    // droplet target only, so the blend weight fading returns orbs smoothly
    // to their ring spots — no rewind.
    const cometExtra = cyc.comet.orbitSpeed * Math.max(0, u - cyc.collapse.rampIn[0])
    ringPoint(spin + cometExtra, CFG.ringRadius, tmpDrop)

    frameCount.current++

    orbs.forEach((orb, i) => {
      const core = coreRefs.current[i]
      const halo = haloRefs.current[i]
      if (!core || !halo) return

      // Compress bunches the tail up toward the head — the solid crescent
      // smear of reference f023/g032. All dots share one radius and one
      // breathing phase so the arc stays a clean circle.
      const angle = spin + orb.baseAngle * (1 - cyc.compress.amount * compress)
      const radius = CFG.ringRadius * (1 + Math.sin(t * 0.6) * 0.03)
      ringPoint(angle, radius, tmpRing)

      // ring → comet head → (converge-in on mount overrides both)
      tmpRing.lerp(tmpDrop, i === 0 ? collapse : collapse * 0.92)
      tmpRing.lerpVectors(orb.scatter, tmpRing, converge)

      core.position.copy(tmpRing)
      halo.position.copy(tmpRing)

      // Snake gradient: bright head, dots dimming + shrinking toward the
      // tail (every reference frame shows this falloff), then the comet
      // collapse flares the head while the tail melts into it
      const along = i / (CFG.orbCount - 1)
      const snakeFade = 1 - CFG.snake.tailDim * along
      const snakeSize = 1 - CFG.snake.tailShrink * along
      const pulse = 1 + Math.sin(t * CFG.pulse.speed + orb.phase) * CFG.pulse.amount
      const dim = i === 0 ? 1 + collapse * 1.2 : 1 - collapse * 0.95
      core.scale.setScalar(CFG.orbSize.core * pulse * dim * snakeSize)
      halo.scale.setScalar(CFG.orbSize.halo * pulse * dim * snakeSize)
      ;(core.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.95 * dim * snakeFade) * converge
      ;(halo.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.5 * pulse * dim * snakeFade) * converge

      // Scatter dots arrive coloured (like the boot stars) and turn
      // white-blue as the ring forms — reference f015 → f017
      CORE_COLOR.set(palette.orb.core)
      HALO_COLOR.set(palette.orb.halo)
      ;(core.material as THREE.SpriteMaterial).color.copy(orb.scatterColor).lerp(CORE_COLOR, converge)
      ;(halo.material as THREE.SpriteMaterial).color.copy(orb.scatterColor).lerp(HALO_COLOR, converge)

      // Record position history for motion-smear trails
      if (frameCount.current % 1 === 0) {
        const h = orb.history
        for (let k = h.length - 1; k > 0; k--) h[k].copy(h[k - 1])
        h[0].copy(tmpRing)
      }

      // Trail sprites: opacity scales with how fast the orb is moving,
      // so the ring shows clean dots but the sweep smears like the reference
      const speed = orb.history[0].distanceTo(orb.history[1]) * 60
      for (let j = 0; j < CFG.trail.perOrb; j++) {
        const sprite = trailRefs.current[i * CFG.trail.perOrb + j]
        if (!sprite) continue
        const histIdx = (j + 1) * CFG.trail.frameGap
        sprite.position.copy(orb.history[histIdx])
        const falloff = 1 - (j + 1) / (CFG.trail.perOrb + 1)
        const op = Math.min(0.85, CFG.trail.baseOpacity + speed * CFG.trail.speedOpacity) * falloff * converge * dim * snakeFade
        ;(sprite.material as THREE.SpriteMaterial).opacity = op
        sprite.scale.setScalar(CFG.orbSize.halo * 0.8 * falloff)
      }
    })
  })

  return (
    <>
      {orbs.map((_, i) => (
        <sprite key={`core-${i}`} ref={(el) => { coreRefs.current[i] = el }}>
          <spriteMaterial
            map={glowTex}
            color={palette.orb.core}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0}
          />
        </sprite>
      ))}
      {orbs.map((_, i) => (
        <sprite key={`halo-${i}`} ref={(el) => { haloRefs.current[i] = el }}>
          <spriteMaterial
            map={glowTex}
            color={palette.orb.halo}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={0}
          />
        </sprite>
      ))}
      {orbs.map((_, i) =>
        Array.from({ length: CFG.trail.perOrb }, (_, j) => (
          <sprite key={`trail-${i}-${j}`} ref={(el) => { trailRefs.current[i * CFG.trail.perOrb + j] = el }}>
            <spriteMaterial
              map={glowTex}
              color={palette.orb.halo}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              opacity={0}
            />
          </sprite>
        ))
      )}
    </>
  )
}

// Positions the whole cluster relative to the visible viewport so it sits
// left of the menu text on any screen size, like the reference.
function ClusterRig({ variant, children }: { variant: MenuSceneVariant; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ viewport }) => {
    const c = CFG.cluster[variant]
    if (!groupRef.current) return
    // Portrait screens stack vertically: cluster top-centre, content below
    if (viewport.aspect < 0.9 && variant === 'menu') {
      groupRef.current.position.set(viewport.width * -0.02, viewport.height * 0.22, c.z)
      groupRef.current.scale.setScalar(c.scale * 0.8)
    } else {
      groupRef.current.position.set(viewport.width * c.xFrac, viewport.height * c.yFrac, c.z)
      groupRef.current.scale.setScalar(c.scale)
    }
  })

  return <group ref={groupRef}>{children}</group>
}

// ── Soft nebula mist drifting behind the cluster ─────────────
function Mist() {
  const mistTex = useMemo(() => makeMistTexture(), [])
  const refs = useRef<(THREE.Sprite | null)[]>([])

  const blobs = useMemo(() => {
    const rng = createRng(404)
    // Hug the ring — the reference shows a faint dark-blue haze disc sitting
    // right behind the formation (visible in fine frames g026–g038)
    return Array.from({ length: CFG.mist.count }, () => ({
      pos: [(rng() - 0.5) * 1.2, (rng() - 0.5) * 0.8, -1.5 - rng()] as const,
      rotSpeed: (rng() - 0.5) * 0.05,
      phase: rng() * Math.PI * 2,
    }))
  }, [])

  useFrame(({ clock }) => {
    blobs.forEach((b, i) => {
      const sprite = refs.current[i]
      if (!sprite) return
      const mat = sprite.material as THREE.SpriteMaterial
      mat.rotation += b.rotSpeed * 0.016
      mat.opacity = CFG.mist.opacity * (1 + Math.sin(clock.elapsedTime * 0.3 + b.phase) * 0.35)
    })
  })

  return (
    <group>
      {blobs.map((b, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el }} position={[...b.pos]} scale={[CFG.mist.scale, CFG.mist.scale, 1]}>
          <spriteMaterial
            map={mistTex}
            color={palette.orb.mist}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            transparent
            opacity={CFG.mist.opacity}
          />
        </sprite>
      ))}
    </group>
  )
}

// ── Gentle mouse parallax ────────────────────────────────────
function ParallaxCamera() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * CFG.camera.parallax - camera.position.x) * 0.04
    camera.position.y += (pointer.y * CFG.camera.parallax * 0.6 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function MenuScene({ variant = 'menu' }: { variant?: MenuSceneVariant }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ fov: CFG.camera.fov, near: 0.1, far: 50, position: [0, 0, CFG.camera.z] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[palette.background]} />
        <ClusterRig variant={variant}>
          <OrbSwarm />
          <Mist />
        </ClusterRig>
        <ParallaxCamera />
        <EffectComposer>
          <Bloom
            luminanceThreshold={CFG.bloom.threshold}
            intensity={CFG.bloom.intensity}
            radius={CFG.bloom.radius}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
