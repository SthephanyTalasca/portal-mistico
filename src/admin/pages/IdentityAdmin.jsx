import { useEffect, useRef, useState } from 'react'
import { useSite } from '../../context/SiteContext'
import { supabase, must } from '../../lib/supabase'
import { friendlyError } from '../../lib/format'
import { cleanupImages } from '../../lib/admin'
import { Loading } from '../../components/ui/States'
import { Field, PageHeader, useToast } from '../components/AdminUI'
import ImageUpload from '../components/ImageUpload'
import MarkdownEditor from '../components/MarkdownEditor'

const SETTINGS_FIELDS = ['oracle_name', 'logo_url', 'footer_phrase']
const HOME_FIELDS = [
  'hero_eyebrow', 'hero_title', 'hero_subtitle', 'hero_image_url',
  'decks_title', 'decks_subtitle', 'featured_title', 'featured_subtitle',
  'rituals_title', 'rituals_soon_title', 'rituals_soon_text',
  'about_title', 'about_name', 'about_phrase', 'about_bio', 'about_photo_url',
  'contact_title', 'contact_text',
]
const IMAGE_FIELDS = ['logo_url', 'hero_image_url', 'about_photo_url']
const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj?.[k] ?? (IMAGE_FIELDS.includes(k) ? null : '')]))

export default function IdentityAdmin() {
  const { rawSettings, rawHome, loading, reload } = useSite()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const uploaded = useRef([])
  const toast = useToast()

  useEffect(() => {
    if (!loading && !form) setForm({ ...pick(rawSettings, SETTINGS_FIELDS), ...pick(rawHome, HOME_FIELDS) })
  }, [loading, rawSettings, rawHome, form])

  if (!form) return <Loading />

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const input = (k) => ({ value: form[k] || '', onChange: (e) => set(k)(e.target.value) })
  const track = (u) => uploaded.current.push(u)

  const save = async (e) => {
    e.preventDefault()
    if (!form.oracle_name?.trim()) return toast('Informe o nome do oráculo.', 'error')
    setSaving(true)
    const before = IMAGE_FIELDS.map((k) => (rawSettings?.[k] ?? rawHome?.[k]))
    try {
      must(await supabase.from('site_settings').update(pick(form, SETTINGS_FIELDS)).eq('id', 1))
      must(await supabase.from('homepage_content').update(pick(form, HOME_FIELDS)).eq('id', 1))
      const after = IMAGE_FIELDS.map((k) => form[k])
      cleanupImages([...before, ...uploaded.current].filter((u) => u && !after.includes(u)))
      uploaded.current = []
      await reload()
      toast('Identidade e textos atualizados no site!')
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Imagens e identidade"
        subtitle="Nome, logotipo, imagens principais e textos da homepage."
        actions={<button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>}
      />

      <section className="a-panel">
        <h2>Marca</h2>
        <div className="form-grid">
          <Field label="Nome do oráculo *"><input {...input('oracle_name')} maxLength={80} /></Field>
          <Field label="Frase do rodapé"><input {...input('footer_phrase')} /></Field>
          <ImageUpload label="Logotipo" value={form.logo_url} onChange={set('logo_url')} folder="marca" onUploaded={track} aspect="1 / 1" hint="Quadrado, fundo transparente (PNG/WebP). Sem logotipo, usamos a lua crescente." />
        </div>
      </section>

      <section className="a-panel">
        <h2>Primeira dobra (hero)</h2>
        <div className="form-grid">
          <Field label="Texto decorativo"><input {...input('hero_eyebrow')} /></Field>
          <Field label="Título"><input {...input('hero_title')} /></Field>
          <Field label="Subtítulo" full><textarea rows={3} {...input('hero_subtitle')} /></Field>
          <ImageUpload label="Imagem do hero" value={form.hero_image_url} onChange={set('hero_image_url')} folder="hero" onUploaded={track} aspect="12 / 13" hint="Opcional. Sem imagem, exibimos a composição de cartas e lua. PNG transparente fica ótimo." />
        </div>
      </section>

      <section className="a-panel">
        <h2>Seções</h2>
        <div className="form-grid">
          <Field label="Título — Oráculos"><input {...input('decks_title')} /></Field>
          <Field label="Subtítulo — Oráculos"><input {...input('decks_subtitle')} /></Field>
          <Field label="Título — Destaques"><input {...input('featured_title')} /></Field>
          <Field label="Subtítulo — Destaques"><input {...input('featured_subtitle')} /></Field>
          <Field label="Título — Rituais"><input {...input('rituals_title')} /></Field>
          <Field label="Rituais: título do “Em breve”"><input {...input('rituals_soon_title')} /></Field>
          <Field label="Rituais: texto do “Em breve”" full><input {...input('rituals_soon_text')} /></Field>
          <Field label="Título — Contato"><input {...input('contact_title')} /></Field>
          <Field label="Texto — Contato"><input {...input('contact_text')} /></Field>
        </div>
      </section>

      <section className="a-panel">
        <h2>Sobre mim</h2>
        <div className="form-grid">
          <Field label="Título"><input {...input('about_title')} /></Field>
          <Field label="Nome profissional"><input {...input('about_name')} /></Field>
          <Field label="Frase de apresentação" full><input {...input('about_phrase')} /></Field>
          <MarkdownEditor label="Biografia" value={form.about_bio || ''} onChange={set('about_bio')} />
          <ImageUpload label="Foto" value={form.about_photo_url} onChange={set('about_photo_url')} folder="sobre" onUploaded={track} aspect="4 / 5" />
        </div>
        <p className="a-hint">As redes sociais ficam em Configurações.</p>
      </section>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
      </div>
    </form>
  )
}
