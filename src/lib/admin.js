import { supabase, must } from './supabase'
import { deleteImage } from './storage'

/**
 * Move um item uma posição para cima (-1) ou para baixo (+1)
 * e renumera sort_order de toda a lista (10, 20, 30...).
 */
export async function moveItem(table, items, index, dir) {
  const target = index + dir
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]
  const renumbered = next.map((it, i) => ({ ...it, sort_order: (i + 1) * 10 }))
  const original = new Map(items.map((o) => [o.id, o.sort_order]))
  const changed = renumbered.filter((it) => original.get(it.id) !== it.sort_order)
  const results = await Promise.all(
    changed.map((it) => supabase.from(table).update({ sort_order: it.sort_order }).eq('id', it.id))
  )
  const err = results.find((r) => r.error)?.error
  if (err) throw err
  return renumbered
}

export async function nextSortOrder(table) {
  const rows = must(await supabase.from(table).select('sort_order').order('sort_order', { ascending: false }).limit(1))
  return (rows?.[0]?.sort_order || 0) + 10
}

const countEq = async (table, col, url) => {
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq(col, url)
  if (error) throw error
  return count || 0
}

/** Verifica se a imagem ainda é usada em algum lugar antes de apagá-la */
export async function isImageInUse(url) {
  const [cover, gallery, deck, service, settings, home] = await Promise.all([
    countEq('spreads', 'cover_url', url),
    (async () => {
      const { count, error } = await supabase
        .from('spreads')
        .select('id', { count: 'exact', head: true })
        .contains('gallery', [url])
      if (error) throw error
      return count || 0
    })(),
    countEq('decks', 'cover_url', url),
    countEq('services', 'image_url', url),
    supabase.from('site_settings').select('logo_url, og_image_url').eq('id', 1).maybeSingle(),
    supabase.from('homepage_content').select('hero_image_url, about_photo_url').eq('id', 1).maybeSingle(),
  ])
  const inRow = (r) => Boolean(r?.data && Object.values(r.data).includes(url))
  return cover + gallery + deck + service > 0 || inRow(settings) || inRow(home)
}

/** Apaga do Storage as imagens que não são mais usadas por nenhum registro */
export async function cleanupImages(urls) {
  for (const url of new Set((urls || []).filter(Boolean))) {
    try {
      if (!(await isImageInUse(url))) await deleteImage(url)
    } catch (e) {
      console.warn('Não foi possível limpar a imagem', url, e)
    }
  }
}
