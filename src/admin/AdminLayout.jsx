import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSite } from '../context/SiteContext'
import { useSeo } from '../hooks/useSeo'
import { MoonLogo } from '../components/ui/Icons'
import { AdminUIProvider } from './components/AdminUI'
import '../styles/admin.css'

const LINKS = [
  { to: '/admin', label: 'Visão geral', end: true, icon: '◈' },
  { to: '/admin/baralhos', label: 'Gerenciar baralhos', icon: '❖' },
  { to: '/admin/tiragens', label: 'Gerenciar tiragens', icon: '✦' },
  { to: '/admin/categorias', label: 'Gerenciar categorias', icon: '☰' },
  { to: '/admin/servicos', label: 'Gerenciar serviços', icon: '☾' },
  { to: '/admin/faq', label: 'Perguntas frequentes', icon: '?' },
  { to: '/admin/identidade', label: 'Imagens e identidade', icon: '◐' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: '⚙' },
]

export default function AdminLayout() {
  useSeo({ title: 'Painel', noindex: true })
  const { user, signOut } = useAuth()
  const { settings } = useSite()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => setOpen(false), [pathname])

  const logout = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <AdminUIProvider>
      <div className={`admin${open ? ' sidebar-open' : ''}`}>
        <header className="admin-topbar">
          <button type="button" className="icon-btn" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>☰</button>
          <span className="admin-topbar-title">{settings.oracle_name}</span>
        </header>

        <aside className="admin-sidebar" aria-label="Menu do painel">
          <div className="admin-brand">
            <MoonLogo className="admin-brand-logo" />
            <div>
              <strong>{settings.oracle_name}</strong>
              <small>Painel administrativo</small>
            </div>
          </div>
          <nav>
            <ul>
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.end}>
                    <span className="nav-icon" aria-hidden="true">{l.icon}</span> {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="admin-sidebar-footer">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-block">Ver site ↗</a>
            <small className="admin-user">{user?.email}</small>
            <button type="button" className="btn btn-text btn-sm btn-block" onClick={logout}>Sair</button>
          </div>
        </aside>
        <button type="button" className="admin-backdrop" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} />

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </AdminUIProvider>
  )
}
