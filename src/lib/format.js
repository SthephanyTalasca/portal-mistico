const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** 4000 -> "R$ 40,00" */
export function formatPrice(cents) {
  if (cents === null || cents === undefined || cents === '') return ''
  return brl.format(Number(cents) / 100).replace(/ /g, ' ')
}

/** "40,00" | "40" | "1.234,56" -> centavos (inteiro). Vazio -> null. Inválido -> NaN */
export function parsePriceToCents(input) {
  if (input === null || input === undefined) return null
  const s = String(input).trim().replace(/[^\d,.]/g, '')
  if (!s) return null
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return NaN
  return Math.round(n * 100)
}

/** 4000 -> "40,00" (para campos de formulário) */
export function centsToInput(cents) {
  if (cents === null || cents === undefined) return ''
  return (Number(cents) / 100).toFixed(2).replace('.', ',')
}

export function slugify(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Remove acentos e caixa para buscas */
export function normalizeText(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export const BADGES = {
  none: null,
  novo: 'Novo',
  popular: 'Popular',
  em_breve: 'Em breve',
}

export const STATUS_LABELS = {
  published: 'Publicada',
  draft: 'Rascunho',
  unavailable: 'Indisponível',
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Traduz erros comuns do Supabase/Postgres para mensagens amigáveis */
export function friendlyError(err) {
  if (!err) return 'Ocorreu um erro inesperado.'
  const msg = err.message || String(err)
  if (err.code === '23505' || /duplicate key/i.test(msg)) {
    if (/slug/i.test(msg)) return 'Já existe um item com este endereço (slug). Escolha outro.'
    return 'Já existe um registro com esses dados.'
  }
  if (err.code === '23503' || /foreign key/i.test(msg)) {
    return 'Este item está vinculado a outros registros. Transfira ou exclua os vínculos primeiro.'
  }
  if (err.code === '42501' || /row-level security|not authorized|não autorizado/i.test(msg)) {
    return 'Você não tem permissão para esta ação.'
  }
  if (err.code === '23514' || /check constraint/i.test(msg)) {
    return 'Algum campo tem um valor inválido. Revise o formulário.'
  }
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Sem conexão com o servidor. Verifique sua internet.'
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  return msg
}
