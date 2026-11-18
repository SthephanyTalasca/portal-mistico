import { useEffect } from 'react'
import { useSite } from '../context/SiteContext'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content || '')
}

/** Atualiza título e metadados de SEO/compartilhamento da página atual */
export function useSeo({ title, description, image, noindex } = {}) {
  const { settings } = useSite()
  useEffect(() => {
    const site = settings.oracle_name
    const fullTitle = title ? `${title} · ${site}` : settings.seo_title || site
    const desc = description || settings.seo_description || ''
    const img = image || settings.og_image_url || ''
    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', window.location.href)
    setMeta('property', 'og:site_name', site)
    if (img) setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  }, [title, description, image, noindex, settings])
}
