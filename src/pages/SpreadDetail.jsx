import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { getSpreadBySlug } from '../lib/api'
import { formatPrice } from '../lib/format'
import { spreadMessage, whatsappLink } from '../lib/whatsapp'
import { stripMarkdown } from '../lib/markdown'
import { Badge, Tag } from '../components/ui/Badge'
import Markdown from '../components/ui/Markdown'
import MysticPlaceholder from '../components/ui/MysticPlaceholder'
import { ErrorState, Loading } from '../components/ui/States'
import { Ornament, Sparkle, WhatsAppIcon } from '../components/ui/Icons'
import NotFound from './NotFound'

export default function SpreadDetail() {
  const { slug } = useParams()
  const { settings } = useSite()
  const { data: s, loading, error, reload } = useAsync(() => getSpreadBySlug(slug), [slug])
  const images = s ? [s.cover_url, ...(s.gallery || [])].filter(Boolean) : []
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [slug])

  useSeo({
    title: s?.name,
    description: s ? stripMarkdown(s.short_description || s.full_description).slice(0, 160) : undefined,
    image: s?.cover_url,
    noindex: s?.status === 'draft',
  })

  if (loading) return <Loading full />
  if (error) return <div className="container page-top"><ErrorState error={error} onRetry={reload} /></div>
  if (!s) return <NotFound />

  const unavailable = s.status === 'unavailable'
  const wa = whatsappLink(settings.whatsapp_number, spreadMessage(s))

  return (
    <article className="section page-top spread-detail">
      <div className="container">
        {s.status === 'draft' && (
          <div className="preview-banner" role="note">
            Pré-visualização de rascunho — visível apenas para você. Publique pelo painel para exibir no site.
          </div>
        )}
        <nav className="breadcrumb" aria-label="Você está em">
          <Link to="/tiragens">Tiragens</Link> <span aria-hidden="true">/</span>
          {s.deck && <><Link to={`/baralhos/${s.deck.slug}`}>{s.deck.name}</Link> <span aria-hidden="true">/</span></>}
          <span>{s.name}</span>
        </nav>

        <div className="detail-grid">
          <div className="detail-media">
            <div className="detail-main-img">
              {images.length ? <img src={images[active]} alt={s.name} /> : <MysticPlaceholder variant={1} />}
            </div>
            {images.length > 1 && (
              <div className="detail-thumbs" role="list">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="listitem"
                    className={`thumb${i === active ? ' is-active' : ''}`}
                    onClick={() => setActive(i)}
                    aria-label={`Ver imagem ${i + 1}`}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-info">
            <div className="detail-tags">
              {s.category && <Tag>{s.category.name}</Tag>}
              <Badge type={s.badge} />
              {unavailable && <Badge tone="muted">Indisponível no momento</Badge>}
            </div>
            <h1 className="detail-title">{s.name}</h1>
            {s.deck && <p className="detail-deck">Baralho: <Link to={`/baralhos/${s.deck.slug}`}>{s.deck.name}</Link></p>}
            <p className="price price-lg">{formatPrice(s.price_cents)}</p>

            <div className="detail-actions">
              {unavailable ? (
                <span className="btn btn-primary btn-lg is-disabled" aria-disabled="true">Indisponível no momento</span>
              ) : (
                <a href={wa} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon size={18} /> Agendar pelo WhatsApp
                </a>
              )}
            </div>

            <Ornament className="align-left" />
            <Markdown text={s.full_description || s.short_description} className="detail-desc" />

            {s.questions?.length > 0 && (
              <div className="detail-block">
                <h2 className="detail-subtitle">Perguntas contempladas</h2>
                <ul className="question-list">
                  {s.questions.map((q, i) => (
                    <li key={i}><Sparkle size={12} /> <span>{q}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {(s.service_format || s.delivery_time) && (
              <dl className="detail-facts">
                {s.service_format && (<div><dt>Formato de atendimento</dt><dd>{s.service_format}</dd></div>)}
                {s.delivery_time && (<div><dt>Prazo estimado</dt><dd>{s.delivery_time}</dd></div>)}
              </dl>
            )}

            {!unavailable && (
              <a href={wa} className="btn btn-ghost btn-block" target="_blank" rel="noopener noreferrer">
                Agendar {s.name} · {formatPrice(s.price_cents)}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
