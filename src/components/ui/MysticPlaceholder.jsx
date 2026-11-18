import { useId } from 'react'
import { SPARKLE_PATH } from './Icons'

/** Arte decorativa usada quando não há imagem cadastrada */
export default function MysticPlaceholder({ variant = 0, className = '' }) {
  const v = Math.abs(variant) % 3
  const maskId = 'mp' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div className={`mystic-placeholder mp-${v} ${className}`} aria-hidden="true">
      <svg viewBox="-60 -40 120 80" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeWidth=".5" opacity=".55">
          <circle r="26" />
          <circle r="20" strokeDasharray="1 2.4" />
          <circle r="34" opacity=".4" />
        </g>
        {v === 0 && (
          <g>
            <mask id={maskId}>
              <rect x="-20" y="-20" width="40" height="40" fill="#fff" />
              <circle cx="6" cy="-4" r="11" fill="#000" />
            </mask>
            <circle r="13" fill="currentColor" mask={`url(#${maskId})`} />
          </g>
        )}
        {v === 1 && <path d={SPARKLE_PATH} transform="scale(15)" fill="currentColor" />}
        {v === 2 && (
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <circle r="8" fill="currentColor" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="0" y1="-11.5" x2="0" y2={i % 2 ? '-14' : '-17'} transform={`rotate(${i * 30})`} />
            ))}
          </g>
        )}
        <path d={SPARKLE_PATH} transform="translate(-40 -22) scale(3)" fill="currentColor" opacity=".7" />
        <path d={SPARKLE_PATH} transform="translate(42 18) scale(2.4)" fill="currentColor" opacity=".6" />
        <path d={SPARKLE_PATH} transform="translate(36 -26) scale(1.6)" fill="currentColor" opacity=".5" />
      </svg>
    </div>
  )
}
