import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ---------- Toasts (mensagens de sucesso/erro) ----------
const ToastCtx = createContext(null)
const ConfirmCtx = createContext(null)

export function AdminUIProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'error' ? 6500 : 3800)
  }, [])

  const confirm = useCallback(
    (opts) => new Promise((resolve) => setConfirmState({ ...opts, resolve })),
    []
  )

  const close = (value) => {
    confirmState?.resolve(value)
    setConfirmState(null)
  }

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div className="toasts" aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
              {t.message}
              <button type="button" aria-label="Fechar" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}>×</button>
            </div>
          ))}
        </div>
        {confirmState && (
          <Modal title={confirmState.title || 'Confirmar'} onClose={() => close(false)} size="sm">
            <p>{confirmState.message}</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => close(false)}>Cancelar</button>
              <button
                type="button"
                className={`btn ${confirmState.danger ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => close(true)}
                autoFocus
              >
                {confirmState.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </Modal>
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
export const useConfirm = () => useContext(ConfirmCtx)

// ---------- Modal ----------
export function Modal({ title, onClose, children, size = 'md' }) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    const first = ref.current?.querySelector('input, select, textarea, button[autofocus]')
    first?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
      prev?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={onClose}>×</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// ---------- Campos ----------
export function Field({ label, hint, error, children, full }) {
  return (
    <label className={`a-field${full ? ' full' : ''}${error ? ' has-error' : ''}`}>
      <span className="a-label">{label}</span>
      {children}
      {hint && !error && <small className="a-hint">{hint}</small>}
      {error && <small className="a-error">{error}</small>}
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="a-toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-toggle-track" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}

export function SortButtons({ onUp, onDown, disableUp, disableDown, disabled, title }) {
  return (
    <span className="sort-btns" title={title}>
      <button type="button" className="icon-btn" onClick={onUp} disabled={disabled || disableUp} aria-label="Mover para cima">▲</button>
      <button type="button" className="icon-btn" onClick={onDown} disabled={disabled || disableDown} aria-label="Mover para baixo">▼</button>
    </span>
  )
}

export function StatusPill({ status, children }) {
  return <span className={`pill pill-${status}`}>{children}</span>
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="a-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="a-page-actions">{actions}</div>}
    </header>
  )
}
