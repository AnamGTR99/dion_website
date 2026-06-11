'use client'

/**
 * Inline SVG avatar art for the visitor profile — six PS2-lore picks
 * (defined in lib/profile.ts). Drawn in the OG blue so the Visual
 * Filters re-hue them along with the rest of the site.
 */

const ART: Record<string, React.ReactNode> = {
  orb: (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const r = i % 3 === 0 ? 2.6 : 1.8
        return (
          <circle
            key={i}
            cx={32 + Math.cos(a) * 17}
            cy={32 + Math.sin(a) * 12}
            r={r}
            fill="#bcd2ff"
            opacity={0.55 + (i % 4) * 0.15}
          />
        )
      })}
      <circle cx="32" cy="32" r="26" fill="none" stroke="#33457a" strokeWidth="1" opacity="0.5" />
    </>
  ),
  towers: (
    <>
      {[
        [10, 18, 10], [24, 10, 13], [38, 22, 9], [50, 14, 11],
        [14, 38, 12], [30, 34, 10], [44, 40, 12],
      ].map(([x, y, s], i) => (
        <rect key={i} x={x} y={y} width={s} height={s} fill={i % 2 ? '#8a94b0' : '#5e6888'} />
      ))}
      <circle cx="32" cy="32" r="6" fill="#88aaff" opacity="0.8" />
    </>
  ),
  memcard: (
    <>
      <rect x="14" y="12" width="36" height="40" rx="4" fill="#2a3354" />
      <rect x="14" y="12" width="36" height="12" rx="4" fill="#3d4a78" />
      <rect x="20" y="30" width="24" height="3" fill="#8fa6e0" opacity="0.7" />
      <rect x="20" y="37" width="18" height="3" fill="#8fa6e0" opacity="0.45" />
      <rect x="22" y="48" width="20" height="4" fill="#11152a" />
    </>
  ),
  pad: (
    <>
      <path
        d="M14 26 C8 26 6 34 8 42 C9 46 13 47 16 44 L22 38 H42 L48 44 C51 47 55 46 56 42 C58 34 56 26 50 26 Z"
        fill="#39426a"
      />
      <circle cx="20" cy="32" r="4" fill="#1a2140" />
      <circle cx="44" cy="30" r="1.8" fill="#88aaff" />
      <circle cx="48" cy="34" r="1.8" fill="#ff7788" />
      <circle cx="40" cy="34" r="1.8" fill="#ffbbdd" />
      <circle cx="44" cy="38" r="1.8" fill="#99ddff" />
      <circle cx="27" cy="40" r="3" fill="#1a2140" />
      <circle cx="37" cy="40" r="3" fill="#1a2140" />
    </>
  ),
  comet: (
    <>
      <circle cx="42" cy="22" r="6" fill="#bcd2ff" />
      <circle cx="42" cy="22" r="10" fill="#6688ee" opacity="0.35" />
      <circle cx="33" cy="31" r="4" fill="#6688ee" opacity="0.55" />
      <circle cx="26" cy="38" r="3" fill="#5577dd" opacity="0.4" />
      <circle cx="20" cy="44" r="2" fill="#4466cc" opacity="0.3" />
    </>
  ),
  crater: (
    <>
      <circle cx="32" cy="32" r="20" fill="#16204a" />
      <circle cx="32" cy="32" r="13" fill="#2a3f8a" />
      <circle cx="32" cy="32" r="7" fill="#88aaff" />
      <circle cx="32" cy="32" r="3" fill="#e6efff" />
    </>
  ),
}

export default function ProfileAvatar({
  avatarId,
  className,
}: {
  avatarId: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Profile avatar">
      <rect width="64" height="64" fill="#0c1020" />
      {ART[avatarId] ?? ART.orb}
    </svg>
  )
}
