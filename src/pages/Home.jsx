import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { getDecks, getSpreads } from '../lib/api'
import { GENERIC_MESSAGE, whatsappLink } from '../lib/whatsapp'
import DeckCard from '../components/cards/DeckCard'
import SpreadCard from '../components/cards/SpreadCard'
import FaqList from '../components/FaqList'
import HeroArt from '../components/ui/HeroArt'
import Reveal from '../components/ui/Reveal'
import SectionTitle from '../components/ui/SectionTitle'
import { Empty, ErrorState, SkeletonGrid } from '../components/ui/States'
import { ArrowRight, WhatsAppIcon } from '../components/ui/Icons'
import AboutSection from './sections/AboutSection'
import RitualsSection from './sections/RitualsSection'

export default function Home() {
  const { home, settings } = useSite()
  useSeo({})
  const decks = useAsync(getDecks, [])
  const featured = useAsync(() => getSpreads({ featured: true }), [])
  const wa = whatsappLink(settings.whatsapp_number, GENERIC_MESSAGE)

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-text">
            <p className="eyebrow hero-eyebrow">{home.hero_eyebrow}</p>
            <h1 id="hero-title" className="hero-title">{home.hero_title}</h1>
            <p className="hero-subtitle">{home.hero_subtitle}</p>
            <div className="hero-actions">
              <Link to="/tiragens" className="btn btn-primary btn-lg">Explorar Tiragens</Link>
              <a href={wa} className="btn btn-ghost btn-lg" target="_blank" rel="noopener noreferrer">
                Falar com a Cartomante
              </a>
            </div>
          </div>
          <div className="hero-visual">
            {home.hero_image_url ? (
              <img src={home.hero_image_url} alt="" className="hero-image float-b" />
            ) : (
              <HeroArt />
            )}
          </div>
        </div>
      </section>

      <section className="section" id="oraculos">
        <div className="container">
          <SectionTitle title={home.decks_title} subtitle={home.decks_subtitle} />
          {decks.loading && <SkeletonGrid count={1} />}
          {decks.error && <ErrorState error={decks.error} onRetry={decks.reload} />}
          {decks.data?.length === 0 && <Empty title="Oráculos em preparação" />}
          {decks.data?.length > 0 && (
            <div className="deck-grid">
              {decks.data.map((d, i) => (
                <Reveal key={d.id} delay={i * 90}>
                  <DeckCard deck={d} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {(featured.loading || featured.data?.length > 0 || featured.error) && (
        <section className="section section-alt" id="destaques">
          <div className="container">
            <SectionTitle title={home.featured_title} subtitle={home.featured_subtitle} />
            {featured.loading && <SkeletonGrid count={3} />}
            {featured.error && <ErrorState error={featured.error} onRetry={featured.reload} />}
            {featured.data?.length > 0 && (
              <>
                <div className="card-grid">
                  {featured.data.map((s, i) => (
                    <Reveal key={s.id} delay={i * 80}>
                      <SpreadCard spread={s} index={i} />
                    </Reveal>
                  ))}
                </div>
                <div className="section-cta">
                  <Link to="/tiragens" className="btn btn-ghost">
                    Ver todas as tiragens <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <RitualsSection />
      <AboutSection />

      <section className="section" id="faq">
        <div className="container narrow">
          <SectionTitle title="Perguntas frequentes" />
          <FaqList />
        </div>
      </section>

      <section className="section contact-cta">
        <Reveal className="container narrow contact-panel">
          <h2 className="display">{home.contact_title}</h2>
          {home.contact_text && <p className="lead">{home.contact_text}</p>}
          <a href={wa} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> Chamar no WhatsApp
          </a>
        </Reveal>
      </section>
    </>
  )
}
