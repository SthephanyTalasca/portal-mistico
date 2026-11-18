import { Ornament } from './Icons'

export default function SectionTitle({ eyebrow, title, subtitle, as: H = 'h2', align = 'center' }) {
  return (
    <header className={`section-title align-${align}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <H className="display">{title}</H>
      <Ornament />
      {subtitle && <p className="lead">{subtitle}</p>}
    </header>
  )
}
