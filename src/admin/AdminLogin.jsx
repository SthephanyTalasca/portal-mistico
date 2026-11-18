import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSeo } from '../hooks/useSeo'
import { friendlyError } from '../lib/format'
import { MoonLogo } from '../components/ui/Icons'
import '../styles/admin.css'

export default function AdminLogin() {
  useSeo({ title: 'Acesso restrito', noindex: true })
  const { session, isAdmin, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/admin'

  if (!loading && session && isAdmin) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error: err } = await signIn(email.trim(), password)
    setBusy(false)
    if (err) return setError(friendlyError(err))
    navigate(from, { replace: true })
  }

  return (
    <main className="admin-login">
      <form className="login-card" onSubmit={submit}>
        <MoonLogo className="login-logo" />
        <h1>Painel do Oráculo</h1>
        <p className="a-hint">Área restrita à administradora.</p>
        <label className="a-field">
          <span className="a-label">E-mail</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="a-field">
          <span className="a-label">Senha</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="a-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <Link to="/" className="a-hint back-link">← Voltar ao site</Link>
      </form>
    </main>
  )
}
