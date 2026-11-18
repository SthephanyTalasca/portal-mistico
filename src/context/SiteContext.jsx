import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_WHATSAPP } from '../lib/whatsapp'

// Valores usados apenas enquanto o banco carrega ou se um campo estiver vazio.
const DEFAULT_SETTINGS = {
  oracle_name: 'Oráculo Lunar',
  footer_phrase: 'Entre cartas, mistérios e caminhos.',
  whatsapp_number: DEFAULT_WHATSAPP,
}

const DEFAULT_HOME = {
  hero_eyebrow: '✦ BEM-VINDA AO ORÁCULO ✦',
  hero_title: 'Entre cartas, mistérios e caminhos.',
  hero_subtitle:
    'Descubra novas perspectivas através da sabedoria simbólica dos oráculos. Consultas personalizadas com Baralho Cigano.',
  decks_title: 'Os Oráculos',
  decks_subtitle: 'Cada baralho revela uma maneira diferente de compreender seus caminhos.',
  featured_title: 'Tiragens em destaque',
  featured_subtitle: 'Escolha a consulta que melhor corresponde ao seu momento.',
  rituals_title: 'Rituais & Trabalhos Espirituais',
  rituals_soon_title: 'Em breve',
  rituals_soon_text: 'Novos caminhos e serviços estão sendo preparados.',
  about_title: 'Por trás das cartas',
  about_bio:
    'Meu trabalho com o Baralho Cigano é um convite à reflexão, à intuição e à descoberta de novas perspectivas sobre os caminhos da vida.',
  contact_title: 'Vamos conversar?',
}

/** Mescla preservando os padrões quando o valor do banco está vazio */
function withDefaults(defaults, row) {
  const out = { ...defaults, ...(row || {}) }
  for (const k of Object.keys(defaults)) {
    if (out[k] === null || out[k] === undefined || out[k] === '') out[k] = defaults[k]
  }
  return out
}

const SiteContext = createContext(null)

export function SiteProvider({ children }) {
  const [state, setState] = useState({ settings: null, home: null, loading: true, error: null })

  const load = useCallback(async () => {
    const [s, h] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('homepage_content').select('*').eq('id', 1).maybeSingle(),
    ])
    setState({ settings: s.data, home: h.data, loading: false, error: s.error || h.error || null })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(
    () => ({
      settings: withDefaults(DEFAULT_SETTINGS, state.settings),
      home: withDefaults(DEFAULT_HOME, state.home),
      rawSettings: state.settings,
      rawHome: state.home,
      loading: state.loading,
      error: state.error,
      reload: load,
    }),
    [state, load]
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
