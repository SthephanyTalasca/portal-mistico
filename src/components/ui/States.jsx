import { friendlyError } from '../../lib/format'
import { MoonLogo } from './Icons'

export function Loading({ label = 'Consultando as estrelas…', full = false }) {
  return (
    <div className={`state state-loading${full ? ' state-full' : ''}`} role="status" aria-live="polite">
      <MoonLogo className="state-moon" />
      <p>{label}</p>
    </div>
  )
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="card-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-img" />
          <div className="skeleton skeleton-line w-40" />
          <div className="skeleton skeleton-line w-80" />
          <div className="skeleton skeleton-line w-60" />
        </div>
      ))}
    </div>
  )
}

export function Empty({ title = 'Nada por aqui ainda', text, action }) {
  return (
    <div className="state state-empty">
      <MoonLogo className="state-moon" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <h3>As cartas se embaralharam…</h3>
      <p>{friendlyError(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
