import { Link, useParams } from 'react-router-dom'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { getDeckBySlug, getSpreads } from '../lib/api'
import SpreadCard from '../components/cards/SpreadCard'
import Reveal from '../components/ui/Reveal'
import SectionTitle from '../components/ui/SectionTitle'
import { Empty, ErrorState, Loading, SkeletonGrid } from '../components/ui/States'
import NotFound from './NotFound'

export default function DeckPage() {
  const { slug } = useParams()
  const deck = useAsync(() => getDeckBySlug(slug), [slug])
  const spreads = useAsync(() => (deck.data ? getSpreads({ deckId: deck.data.id }) : Promise.resolve([])), [deck.data?.id])
  useSeo({ title: deck.data?.name, description: deck.data?.description, image: deck.data?.cover_url })

  if (deck.loading) return <Loading full />
  if (deck.error) return <div className="container page-top"><ErrorState error={deck.error} onRetry={deck.reload} /></div>
  if (!deck.data) return <NotFound />

  return (
    <section className="section page-top">
      <div className="container">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link to="/baralhos">Baralhos</Link> <span aria-hidden="true">/</span> <span>{deck.data.name}</span>
        </nav>
        <SectionTitle as="h1" eyebrow="✦ Oráculo ✦" title={deck.data.name} subtitle={deck.data.description} />
        {spreads.loading && <SkeletonGrid count={3} />}
        {spreads.error && <ErrorState error={spreads.error} onRetry={spreads.reload} />}
        {spreads.data?.length === 0 && (
          <Empty title="Tiragens em preparação" text="Em breve novas consultas para este oráculo." />
        )}
        {spreads.data?.length > 0 && (
          <div className="card-grid">
            {spreads.data.map((s, i) => (
              <Reveal key={s.id} delay={i * 70}>
                <SpreadCard spread={s} index={i} />
              </Reveal>
            ))}
          </div>
        )}
        <div className="section-cta">
          <Link to={`/tiragens?baralho=${deck.data.slug}`} className="btn btn-ghost">Buscar e filtrar tiragens</Link>
        </div>
      </div>
    </section>
  )
}
