import { useSite } from '../../context/SiteContext'
import { GENERIC_MESSAGE, whatsappLink } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../ui/Icons'

export default function WhatsAppFloat() {
  const { settings } = useSite()
  return (
    <a
      className="whatsapp-float"
      href={whatsappLink(settings.whatsapp_number, GENERIC_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
    >
      <WhatsAppIcon size={26} />
    </a>
  )
}
