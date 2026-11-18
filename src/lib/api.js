// Consultas do site público. Os filtros explícitos garantem que até
// a administradora, logada, veja o site como as visitantes veem.
import { supabase, must } from './supabase'

export const PUBLIC_SPREAD_STATUS = ['published', 'unavailable']
export const SPREAD_SELECT =
  '*, deck:decks(id, name, slug, is_published), category:categories(id, name, slug, is_visible)'

export async function getDecks() {
  const [decks, spreads] = await Promise.all([
    supabase.from('decks').select('*').eq('is_published', true).order('sort_order').order('name'),
    supabase.from('spreads').select('deck_id').in('status', PUBLIC_SPREAD_STATUS),
  ])
  const counts = must(spreads).reduce((acc, s) => ((acc[s.deck_id] = (acc[s.deck_id] || 0) + 1), acc), {})
  return must(decks).map((d) => ({ ...d, spread_count: counts[d.id] || 0 }))
}

export async function getDeckBySlug(slug) {
  return must(await supabase.from('decks').select('*').eq('slug', slug).eq('is_published', true).maybeSingle())
}

export async function getCategories() {
  return must(await supabase.from('categories').select('*').eq('is_visible', true).order('sort_order').order('name'))
}

export async function getSpreads({ deckId, featured } = {}) {
  let q = supabase
    .from('spreads')
    .select(SPREAD_SELECT)
    .in('status', PUBLIC_SPREAD_STATUS)
    .order('sort_order')
    .order('name')
  if (deckId) q = q.eq('deck_id', deckId)
  if (featured) q = q.eq('featured', true)
  return must(await q).filter((s) => s.deck?.is_published)
}

/** Sem filtro de status: a administradora logada consegue pré-visualizar rascunhos.
 *  Para visitantes, o RLS do banco esconde rascunhos. */
export async function getSpreadBySlug(slug) {
  return must(await supabase.from('spreads').select(SPREAD_SELECT).eq('slug', slug).maybeSingle())
}

export async function getServices() {
  return must(await supabase.from('services').select('*').eq('status', 'published').order('sort_order').order('name'))
}

export async function getFaqs() {
  return must(await supabase.from('faqs').select('*').eq('is_published', true).order('sort_order'))
}
