import { BADGES } from '../../lib/format'

export function Badge({ type, children, tone }) {
  const label = children || BADGES[type]
  if (!label) return null
  return <span className={`badge badge-${tone || type || 'default'}`}>{label}</span>
}

export function Tag({ children }) {
  if (!children) return null
  return <span className="tag">{children}</span>
}
