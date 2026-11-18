import { Link } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { supabase, must } from '../../lib/supabase'
import { formatDate, formatPrice, STATUS_LABELS } from '../../lib/format'
import { ErrorState, Loading } from '../../components/ui/States'
import { PageHeader, StatusPill } from '../components/AdminUI'

async function loadOverview() {
  const [spreads, decks, categories, services, faqs] = await Promise.all([
    supabase.from('spreads').select('id, name, slug, status, price_cents, updated_at').order('updated_at', { ascending: false }),
    supabase.from('decks').select('id, is_published'),
    supabase.from('categories').select('id'),
    supabase.from('services').select('id, status'),
    supabase.from('faqs').select('id'),
  ])
  return {
    spreads: must(spreads),
    decks: must(decks),
    categories: must(categories),
    services: must(services),
    faqs: must(faqs),
  }
}

export default function Overview() {
  const { data, loading, error, reload } = useAsync(loadOverview, [])
  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const by = (status) => data.spreads.filter((s) => s.status === status).length
  const stats = [
    { label: 'Tiragens publicadas', value: by('published'), to: '/admin/tiragens' },
    { label: 'Rascunhos', value: by('draft'), to: '/admin/tiragens' },
    { label: 'Indisponíveis', value: by('unavailable'), to: '/admin/tiragens' },
    { label: 'Baralhos', value: data.decks.length, to: '/admin/baralhos' },
    { label: 'Categorias', value: data.categories.length, to: '/admin/categorias' },
    { label: 'Serviços publicados', value: data.services.filter((s) => s.status === 'published').length, to: '/admin/servicos' },
  ]

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="Bem-vinda ao seu templo digital."
        actions={<Link to="/admin/tiragens/nova" className="btn btn-primary">+ Adicionar nova tiragem</Link>}
      />
      <div className="stat-grid">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="stat-card">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>

      <section className="a-panel">
        <h2>Atualizadas recentemente</h2>
        {data.spreads.length === 0 ? (
          <p className="a-hint">Nenhuma tiragem cadastrada ainda.</p>
        ) : (
          <ul className="recent-list">
            {data.spreads.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link to={`/admin/tiragens/${s.id}`}>{s.name}</Link>
                <span>{formatPrice(s.price_cents)}</span>
                <StatusPill status={s.status}>{STATUS_LABELS[s.status]}</StatusPill>
                <small>{formatDate(s.updated_at)}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="a-panel">
        <h2>Atalhos</h2>
        <div className="quick-links">
          <Link to="/admin/identidade" className="btn btn-ghost btn-sm">Editar textos da homepage</Link>
          <Link to="/admin/configuracoes" className="btn btn-ghost btn-sm">WhatsApp e redes sociais</Link>
          <Link to="/admin/faq" className="btn btn-ghost btn-sm">Responder perguntas frequentes</Link>
        </div>
      </section>
    </>
  )
}
