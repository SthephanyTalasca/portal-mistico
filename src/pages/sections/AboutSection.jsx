import { useSite } from '../../context/SiteContext'
import Markdown from '../../components/ui/Markdown'
import MysticPlaceholder from '../../components/ui/MysticPlaceholder'
import Reveal from '../../components/ui/Reveal'
import { Ornament } from '../../components/ui/Icons'

export default function AboutSection({ headingLevel = 'h2' }) {
  const { home, settings } = useSite()
  const H = headingLevel
  const socials = [
    ['Instagram', settings.instagram_url],
    ['TikTok', settings.tiktok_url],
    ['Facebook', settings.facebook_url],
    ['YouTube', settings.youtube_url],
  ].filter(([, url]) => url)

  return (
    <section className="section about" id="sobre" aria-labelledby="about-title">
      <div className="container about-grid">
        <Reveal className="about-photo">
          <div className="frame">
            {home.about_photo_url ? (
              <img src={home.about_photo_url} alt={home.about_name ? `Foto de ${home.about_name}` : 'Foto da cartomante'} loading="lazy" />
            ) : (
              <MysticPlaceholder variant={0} />
            )}
          </div>
        </Reveal>
        <Reveal className="about-text" delay={120}>
          <p className="eyebrow">✦ Sobre mim ✦</p>
          <H id="about-title" className="display">{home.about_title}</H>
          <Ornament className="align-left" />
          {home.about_name && <p className="about-name">{home.about_name}</p>}
          {home.about_phrase && <blockquote className="about-phrase">{home.about_phrase}</blockquote>}
          <Markdown text={home.about_bio} className="about-bio" />
          {socials.length > 0 && (
            <ul className="social-list">
              {socials.map(([label, url]) => (
                <li key={label}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">{label}</a>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  )
}
