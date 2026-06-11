/**
 * Procedural canvas textures for the PS2 scenes — no external assets.
 * Client-side only (both scenes are dynamically imported with ssr: false).
 */
import * as THREE from 'three'
import { createRng } from './ps2.config'

/** TV-static noise, used on the boot block city (the original blocks have a
 *  noisy broadcast-static surface on their top faces). */
export function makeNoiseTexture(size = 256, contrast = 0.32): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const rng = createRng(777)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 255 - rng() * 255 * contrast
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/** Radial glow with a hot core — orbs, crater glow, sparks. */
export function makeGlowTexture(size = 128, coreStop = 0.18): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(coreStop, 'rgba(255,255,255,0.9)')
  grad.addColorStop(0.34, 'rgba(255,255,255,0.12)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Very soft wide blob for nebula mist. */
export function makeMistTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, 'rgba(255,255,255,0.55)')
  grad.addColorStop(0.4, 'rgba(255,255,255,0.18)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
