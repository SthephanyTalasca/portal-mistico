import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSite } from '../../context/SiteContext'
import { GENERIC_MESSAGE, whatsappLink } from '../../lib/whatsapp'
import { MoonLogo } from '../ui/Icons'

export const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/baralhos', label: 'Baralhos' },
  { to: '/tiragens', label: 'Tiragens' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/sobre', label: 'Sobre mim' },
  { to: '/contato', label: 'Contato' },
]

export function Brand({ className = '' }) {
  const { settings } = useSite()
  return (
    <Link to="/" className={`brand ${className}`} aria-label={`${settings.oracle_name} — página inicial`}>
      {settings.logo_url ? (
        <img src={settings.logo_url} alt="" className="brand-logo" width="40" height="40" />
      ) : (
        <MoonLogo className="brand-logo" />
      )}
      <span className="brand-name">{settings.oracle_name}</span>
    </Link>
  )
}

export default function Header() {
  const { settings } = useSite()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const menuRef = useRef(null)

  useEffect(() => setOpen(false), [pathname])

  // inert: impede foco por teclado no menu fechado
  useEffect(() => {
    if (menuRef.current) menuRef.current.inert = !open
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const cta = whatsappLink(settings.whatsapp_number, GENERIC_MESSAGE)

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Navegação principal">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn-primary btn-sm header-cta" href={cta} target="_blank" rel="noopener noreferrer">
          Agendar Consulta
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" aria-hidden={!open}>
        <nav aria-label="Menu">
          <ul>
            {NAV.map((n, i) => (
              <li key={n.to} style={{ '--i': i }}>
                <NavLink to={n.to} end={n.end}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <a className="btn btn-primary btn-block" href={cta} target="_blank" rel="noopener noreferrer" style={{ '--i': NAV.length }}>
            Agendar Consulta
          </a>
        </nav>
      </div>
      <button type="button" className="menu-backdrop" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} />
    </header>
  )
}
