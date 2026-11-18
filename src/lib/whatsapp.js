import { formatPrice } from './format'

export const DEFAULT_WHATSAPP = '5547991678074'
export const GENERIC_MESSAGE = 'Olá! Gostaria de agendar uma consulta. Poderia me passar mais informações?'

export function normalizeNumber(n) {
  const digits = String(n || '').replace(/\D/g, '')
  return digits || DEFAULT_WHATSAPP
}

export function whatsappLink(number, message) {
  const base = `https://wa.me/${normalizeNumber(number)}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** Mensagem gerada a partir do nome e preço ATUAIS da tiragem */
export function spreadMessage(spread) {
  return `Olá! Gostaria de agendar a tiragem ${spread.name}, no valor de ${formatPrice(spread.price_cents)}. Poderia me passar mais informações?`
}

export function serviceMessage(service) {
  if (service.contact_message?.trim()) return service.contact_message.trim()
  const price = service.price_cents != null ? `, no valor de ${formatPrice(service.price_cents)}` : ''
  return `Olá! Gostaria de saber mais sobre o serviço ${service.name}${price}.`
}

/** "5547991678074" -> "+55 47 99167-8074" */
export function prettyPhone(number) {
  const d = normalizeNumber(number)
  const m = d.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/)
  return m ? `+${m[1]} ${m[2]} ${m[3]}-${m[4]}` : `+${d}`
}
