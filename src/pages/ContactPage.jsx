import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useSeo } from '../hooks/useSeo'
import { GENERIC_MESSAGE, prettyPhone, whatsappLink } from '../lib/whatsapp'
import SectionTitle from '../components/ui/SectionTitle'
import { WhatsAppIcon } from '../components/ui/Icons'

export default function ContactPage() {
  const { home, settings } = useSite()
  useSeo({ title: 'Contato' })
  const socials = [
    ['Instagram', settings.instagram_url],
    ['TikTok', settings.tiktok_url],
    ['Facebook', settings.facebook_url],
    ['YouTube', settings.youtube_url],
  ].filter(([, url]) => url)

  return (
    <section className="section page-top">
      <div className="container narrow">
        <SectionTitle as="h1" title={home.contact_title} subtitle={home.contact_text} />
        <div className="contact-panel">
          <p className="contact-number">{prettyPhone(settings.whatsapp_number)}</p>
          <a
            href={whatsappLink(settings.whatsapp_number, GENERIC_MESSAGE)}
            className="btn btn-primary btn-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={18} /> Conversar no WhatsApp
          </a>
          {settings.service_info && <p className="contact-info">{settings.service_info}</p>}
          {socials.length > 0 && (
            <ul className="social-list center">
              {socials.map(([label, url]) => (
                <li key={label}><a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noopener noreferrer">{label}</a></li>
              ))}
            </ul>
          )}
          <p className="muted">Quer escolher antes? <Link to="/tiragens">Veja as tiragens disponíveis</Link>.</p>
        </div>
      </div>
    </section>
  )
}
