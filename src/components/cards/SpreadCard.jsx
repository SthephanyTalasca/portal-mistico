import { Link } from 'react-router-dom'
import { useSite } from '../../context/SiteContext'
import { formatPrice } from '../../lib/format'
import { spreadMessage, whatsappLink } from '../../lib/whatsapp'
import { Badge, Tag } from '../ui/Badge'
import { WhatsAppIcon } from '../ui/Icons'
import MysticPlaceholder from '../ui/MysticPlaceholder'

/** Card de tiragem. Com `preview`, os botões ficam inativos (uso no painel). */
export default function SpreadCard({ spread, index = 0, preview = false }) {
  const { settings } = useSite()
  const unavailable = spread.status === 'unavailable'
  const detailHref = `/tiragens/${spread.slug}`
  const wa = whatsappLink(settings.whatsapp_number, spreadMessage(spread))

  return (
    <article className={`spread-card${unavailable ? ' is-unavailable' : ''}`}>
      <div className="spread-card-media">
        {spread.cover_url ? (
          <img src={spread.cover_url} alt="" loading="lazy" decoding="async" />
        ) : (
          <MysticPlaceholder variant={index} />
        )}
        <div className="spread-card-badges">
          <Badge type={spread.badge} />
          {unavailable && <Badge tone="muted">Indisponível</Badge>}
        </div>
      </div>
      <div className="spread-card-body">
        <Tag>{spread.category?.name}</Tag>
        <h3 className="spread-card-title">
          {preview ? spread.name || 'Nome da tiragem' : <Link to={detailHref}>{spread.name}</Link>}
        </h3>
        {spread.short_description && <p className="spread-card-desc">{spread.short_description}</p>}
        <p className="price">{formatPrice(spread.price_cents)}</p>
        <div className="spread-card-actions">
          {preview ? (
            <>
              <span className="btn btn-ghost btn-sm">Ver Detalhes</span>
              <span className="btn btn-primary btn-sm"><WhatsAppIcon size={16} /> Agendar pelo WhatsApp</span>
            </>
          ) : (
            <>
              <Link to={detailHref} className="btn btn-ghost btn-sm">Ver Detalhes</Link>
              {unavailable ? (
                <span className="btn btn-primary btn-sm is-disabled" aria-disabled="true">Indisponível</span>
              ) : (
                <a href={wa} className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon size={16} /> Agendar pelo WhatsApp
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )
}
