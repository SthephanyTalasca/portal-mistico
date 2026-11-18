import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { ArrowRight } from '../ui/Icons'
import MysticPlaceholder from '../ui/MysticPlaceholder'

export default function DeckCard({ deck, index = 0 }) {
  const n = deck.spread_count ?? 0
  const soon = deck.badge === 'em_breve'
  return (
    <article className="deck-card">
      <div className="deck-card-media">
        {deck.cover_url ? (
          <img src={deck.cover_url} alt="" loading="lazy" decoding="async" />
        ) : (
          <MysticPlaceholder variant={index} />
        )}
        <div className="deck-card-badges"><Badge type={deck.badge} /></div>
      </div>
      <div className="deck-card-body">
        <h3 className="deck-card-title">{deck.name}</h3>
        {deck.description && <p>{deck.description}</p>}
        <p className="deck-card-count">
          {n === 0 ? 'Tiragens em preparação' : `${n} ${n === 1 ? 'tiragem disponível' : 'tiragens disponíveis'}`}
        </p>
        {soon ? (
          <span className="btn btn-ghost btn-sm is-disabled" aria-disabled="true">Em breve</span>
        ) : (
          <Link to={`/baralhos/${deck.slug}`} className="btn btn-primary btn-sm">
            Explorar Tiragens <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  )
}
