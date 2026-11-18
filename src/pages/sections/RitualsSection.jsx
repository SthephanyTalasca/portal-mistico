import { useSite } from '../../context/SiteContext'
import { useAsync } from '../../hooks/useAsync'
import { getServices } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { serviceMessage, whatsappLink } from '../../lib/whatsapp'
import Markdown from '../../components/ui/Markdown'
import MysticPlaceholder from '../../components/ui/MysticPlaceholder'
import Reveal from '../../components/ui/Reveal'
import SectionTitle from '../../components/ui/SectionTitle'
import { ErrorState, Loading } from '../../components/ui/States'
import { Sparkle, WhatsAppIcon } from '../../components/ui/Icons'

export default function RitualsSection({ headingLevel = 'h2' }) {
  const { home, settings } = useSite()
  const { data, loading, error, reload } = useAsync(getServices, [])

  return (
    <section className="section rituals" id="rituais">
      <div className="container">
        <SectionTitle title={home.rituals_title} as={headingLevel} />
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && data.length === 0 && (
          <Reveal className="soon-panel">
            <Sparkle size={22} className="soon-sparkle" />
            <p className="soon-title">{home.rituals_soon_title}</p>
            <p>{home.rituals_soon_text}</p>
          </Reveal>
        )}
        {data && data.length > 0 && (
          <div className="card-grid">
            {data.map((s, i) => (
              <Reveal key={s.id} as="article" className="service-card" delay={i * 80}>
                <div className="spread-card-media">
                  {s.image_url ? <img src={s.image_url} alt="" loading="lazy" /> : <MysticPlaceholder variant={i + 1} />}
                </div>
                <div className="spread-card-body">
                  <h3 className="spread-card-title">{s.name}</h3>
                  <Markdown text={s.description} />
                  {s.price_cents != null && <p className="price">{formatPrice(s.price_cents)}</p>}
                  {s.guidelines && (
                    <details className="service-guidelines">
                      <summary>Orientações</summary>
                      <Markdown text={s.guidelines} />
                    </details>
                  )}
                  <a
                    className="btn btn-primary btn-sm"
                    href={whatsappLink(settings.whatsapp_number, serviceMessage(s))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon size={16} /> Falar sobre este serviço
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
