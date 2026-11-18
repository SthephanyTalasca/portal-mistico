import { supabase } from './supabase'

export const BUCKET = 'media'
export const MAX_MB = 5
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const ACCEPT = Object.keys(TYPES).join(',')

export function validateImage(file) {
  if (!file) return 'Nenhum arquivo selecionado.'
  if (!TYPES[file.type]) return 'Formato inválido. Use JPG, PNG ou WebP.'
  if (file.size > MAX_MB * 1024 * 1024) return `A imagem deve ter no máximo ${MAX_MB} MB.`
  return null
}

/** Envia a imagem ao Storage e devolve a URL pública */
export async function uploadImage(file, folder = 'geral') {
  const err = validateImage(file)
  if (err) throw new Error(err)
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${TYPES[file.type]}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const { error: mediaError } = await supabase
    .from('media')
    .insert({ path, url: data.publicUrl, bucket: BUCKET, mime_type: file.type, size_bytes: file.size })
  if (mediaError) console.warn('Imagem enviada, mas não registrada na tabela media:', mediaError)
  return data.publicUrl
}

export function pathFromUrl(url) {
  if (!url) return null
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = url.indexOf(marker)
  return i >= 0 ? decodeURIComponent(url.slice(i + marker.length).split('?')[0]) : null
}

export async function deleteImage(url) {
  const path = pathFromUrl(url)
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
  await supabase.from('media').delete().eq('path', path)
}
