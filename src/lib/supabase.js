import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Apenas a chave pública (anon) vai para o navegador.
// A segurança real fica nas políticas RLS do banco.
export const isConfigured = Boolean(url && anonKey)

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/** Lança o erro do Supabase ou devolve os dados. */
export function must({ data, error }) {
  if (error) throw error
  return data
}
