import { Link } from 'react-router-dom'
import { useSite } from '../../context/SiteContext'
import { GENERIC_MESSAGE, prettyPhone, whatsappLink } from '../../lib/whatsapp'
import { Ornament } from '../ui/Icons'
import { Brand } from './Header'

export default function Footer() {
  const { settings } = useSite()
  const year = new Date().getFullYear()
  const socials = [
    ['Instagram', settings.instagram_url],
    ['TikTok', settings.tiktok_url],
    ['Facebook', settings.facebook_url],
    ['YouTube', settings.youtube_url],
  ].filter(([, url]) => url)

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <Brand />
          {settings.footer_phrase && <p className="footer-phrase">{settings.footer_phrase}</p>}
        </div>

        <nav className="footer-col" aria-label="Navegação do rodapé">
          <h2 className="footer-title">Navegação</h2>
          <ul>
            <li><Link to="/">Início</Link></li>
            <li><Link to="/baralhos">Baralhos</Link></li>
            <li><Link to="/tiragens">Tiragens</Link></li>
            <li><Link to="/sobre">Sobre mim</Link></li>
          </ul>
        </nav>

        <div className="footer-col">
          <h2 className="footer-title">Atendimento</h2>
          <ul>
            <li>
              <a href={whatsappLink(settings.whatsapp_number, GENERIC_MESSAGE)} target="_blank" rel="noopener noreferrer">
                WhatsApp · {prettyPhone(settings.whatsapp_number)}
              </a>
            </li>
            {socials.map(([label, url]) => (
              <li key={label}>
                <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
              </li>
            ))}
          </ul>
          {settings.service_info && <p className="footer-note">{settings.service_info}</p>}
        </div>

        <nav className="footer-col" aria-label="Informações">
          <h2 className="footer-title">Informações</h2>
          <ul>
            <li><Link to="/perguntas-frequentes">Perguntas frequentes</Link></li>
            <li><Link to="/privacidade">Política de privacidade</Link></li>
            <li><Link to="/termos">Termos de atendimento</Link></li>
          </ul>
        </nav>
      </div>

      <div className="container footer-bottom">
        <Ornament />
        <p>© {year} {settings.oracle_name}. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
