import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import { MoonLogo } from '../components/ui/Icons'

export default function NotFound() {
  useSeo({ title: 'Página não encontrada', noindex: true })
  return (
    <section className="section page-top">
      <div className="container narrow state state-empty">
        <MoonLogo className="state-moon" />
        <h1 className="display">Caminho não encontrado</h1>
        <p>As cartas não revelaram esta página. Que tal recomeçar?</p>
        <Link to="/" className="btn btn-primary">Voltar ao início</Link>
      </div>
    </section>
  )
}
