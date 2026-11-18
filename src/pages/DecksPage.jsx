import { useSite } from '../context/SiteContext'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { getDecks } from '../lib/api'
import DeckCard from '../components/cards/DeckCard'
import Reveal from '../components/ui/Reveal'
import SectionTitle from '../components/ui/SectionTitle'
import { Empty, ErrorState, SkeletonGrid } from '../components/ui/States'

export default function DecksPage() {
  const { home } = useSite()
  useSeo({ title: 'Baralhos', description: home.decks_subtitle })
  const { data, loading, error, reload } = useAsync(getDecks, [])

  return (
    <section className="section page-top">
      <div className="container">
        <SectionTitle as="h1" title={home.decks_title} subtitle={home.decks_subtitle} />
        {loading && <SkeletonGrid count={3} />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data?.length === 0 && <Empty title="Oráculos em preparação" text="Novos baralhos serão revelados em breve." />}
        {data?.length > 0 && (
          <div className="deck-grid">
            {data.map((d, i) => (
              <Reveal key={d.id} delay={i * 80}>
                <DeckCard deck={d} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
