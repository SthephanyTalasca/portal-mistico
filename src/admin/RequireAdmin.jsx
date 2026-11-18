import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loading } from '../components/ui/States'
import '../styles/admin.css'

export default function RequireAdmin({ children }) {
  const { session, isAdmin, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <Loading full label="Verificando acesso…" />
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) {
    return (
      <main className="admin-login">
        <div className="login-card">
          <h1>Acesso não autorizado</h1>
          <p>Esta conta não tem permissão de administradora. Peça para incluí-la na tabela <code>admins</code>.</p>
          <button type="button" className="btn btn-ghost" onClick={signOut}>Sair</button>
        </div>
      </main>
    )
  }
  return children
}
