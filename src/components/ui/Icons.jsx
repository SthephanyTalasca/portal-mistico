// Ícones originais em SVG (herdam a cor via currentColor)
import { useId } from 'react'

const useSvgId = (prefix) => prefix + useId().replace(/[^a-zA-Z0-9]/g, '')

export const SPARKLE_PATH = 'M0,-1 C0.11,-0.22 0.22,-0.11 1,0 C0.22,0.11 0.11,0.22 0,1 C-0.11,0.22 -0.22,0.11 -1,0 C-0.22,-0.11 -0.11,-0.22 0,-1Z'

export function MoonLogo({ className = '', title }) {
  const g = useSvgId('mlg')
  const m = useSvgId('mlm')
  return (
    <svg className={className} viewBox="0 0 48 48" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5EDFF" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <mask id={m}>
          <rect width="48" height="48" fill="#fff" />
          <circle cx="29" cy="20" r="13" fill="#000" />
        </mask>
      </defs>
      <circle cx="24" cy="24" r="22" fill="none" stroke="#4C286A" strokeWidth="1.2" />
      <circle cx="22" cy="25" r="14" fill={`url(#${g})`} mask={`url(#${m})`} />
      <path d={SPARKLE_PATH} transform="translate(35 13) scale(4)" fill="#D8B4FE" />
      <path d={SPARKLE_PATH} transform="translate(38 31) scale(2)" fill="#D8B4FE" opacity=".8" />
    </svg>
  )
}

export function Sparkle({ size = 12, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="-1 -1 2 2" aria-hidden="true">
      <path d={SPARKLE_PATH} fill="currentColor" />
    </svg>
  )
}

export function WhatsAppIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3A8.5 8.5 0 1 1 20.5 11.6z" />
      <path d="M9 8.2c.2-.4.6-.4.9-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .7-.4.9-.6.4-1.4.6-2.2.4-2.6-.7-4.7-2.8-5.4-5.4-.2-.8 0-1.6.4-2.2z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ArrowRight({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </svg>
  )
}

export function ChevronDown({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function Ornament({ className = '' }) {
  const m = useSvgId('orn')
  return (
    <svg className={`ornament ${className}`} viewBox="0 0 220 24" aria-hidden="true">
      <path d="M0 12h86M134 12h86" stroke="currentColor" strokeWidth="1" opacity=".5" />
      <circle cx="92" cy="12" r="2" fill="currentColor" opacity=".6" />
      <circle cx="128" cy="12" r="2" fill="currentColor" opacity=".6" />
      <mask id={m}>
        <rect x="96" y="0" width="28" height="24" fill="#fff" />
        <circle cx="114" cy="9" r="7" fill="#000" />
      </mask>
      <circle cx="110" cy="12" r="8" fill="currentColor" mask={`url(#${m})`} />
      <path d={SPARKLE_PATH} transform="translate(118 5) scale(3)" fill="currentColor" />
    </svg>
  )
}
