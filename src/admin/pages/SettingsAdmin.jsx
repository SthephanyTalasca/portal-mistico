import { useEffect, useRef, useState } from 'react'
import { useSite } from '../../context/SiteContext'
import { supabase, must } from '../../lib/supabase'
import { friendlyError } from '../../lib/format'
import { cleanupImages } from '../../lib/admin'
import { GENERIC_MESSAGE, prettyPhone, whatsappLink } from '../../lib/whatsapp'
import { Loading } from '../../components/ui/States'
import { Field, PageHeader, useToast } from '../components/AdminUI'
import ImageUpload from '../components/ImageUpload'
import MarkdownEditor from '../components/MarkdownEditor'

const FIELDS = [
  'whatsapp_number', 'instagram_url', 'tiktok_url', 'facebook_url', 'youtube_url',
  'service_info', 'seo_title', 'seo_description', 'og_image_url', 'privacy_text', 'terms_text',
]

export default function SettingsAdmin() {
  const { rawSettings, loading, reload } = useSite()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const uploaded = useRef([])
  const toast = useToast()

  useEffect(() => {
    if (!loading && !form) setForm(Object.fromEntries(FIELDS.map((k) => [k, rawSettings?.[k] ?? (k === 'og_image_url' ? null : '')])))
  }, [loading, rawSettings, form])

  if (!form) return <Loading />

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const input = (k) => ({ value: form[k] || '', onChange: (e) => set(k)(e.target.value) })
  const digits = String(form.whatsapp_number || '').replace(/\D/g, '')

  const save = async (e) => {
    e.preventDefault()
    if (digits.length < 12 || digits.length > 13) {
      return toast('WhatsApp: informe o número com DDI e DDD, ex.: 5547991678074', 'error')
    }
    for (const k of ['instagram_url', 'tiktok_url', 'facebook_url', 'youtube_url']) {
      if (form[k] && !/^https?:\/\//i.test(form[k])) return toast('Os links das redes devem começar com https://', 'error')
    }
    setSaving(true)
    try {
      must(await supabase.from('site_settings').update({ ...form, whatsapp_number: digits }).eq('id', 1))
      const old = rawSettings?.og_image_url
      cleanupImages([old, ...uploaded.current].filter((u) => u && u !== form.og_image_url))
      uploaded.current = []
      await reload()
      toast('Configurações salvas!')
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Configurações"
        actions={<button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>}
      />

      <section className="a-panel">
        <h2>WhatsApp</h2>
        <div className="form-grid">
          <Field label="Número de atendimento *" hint={digits ? `Exibido como ${prettyPhone(digits)}` : 'DDI + DDD + número, só dígitos'}>
            <input inputMode="tel" {...input('whatsapp_number')} placeholder="5547991678074" />
          </Field>
          <div className="a-field">
            <span className="a-label">Testar</span>
            <a className="btn btn-ghost btn-sm" href={whatsappLink(digits, GENERIC_MESSAGE)} target="_blank" rel="noopener noreferrer">Abrir conversa de teste ↗</a>
          </div>
          <Field label="Informações de atendimento" hint="Ex.: dias e horários. Aparece no rodapé e em Contato." full>
            <textarea rows={2} {...input('service_info')} />
          </Field>
        </div>
      </section>

      <section className="a-panel">
        <h2>Redes sociais</h2>
        <p className="a-hint">Deixe vazio para não exibir.</p>
        <div className="form-grid">
          <Field label="Instagram"><input type="url" {...input('instagram_url')} placeholder="https://instagram.com/..." /></Field>
          <Field label="TikTok"><input type="url" {...input('tiktok_url')} placeholder="https://tiktok.com/@..." /></Field>
          <Field label="Facebook"><input type="url" {...input('facebook_url')} /></Field>
          <Field label="YouTube"><input type="url" {...input('youtube_url')} /></Field>
        </div>
      </section>

      <section className="a-panel">
        <h2>SEO e compartilhamento</h2>
        <div className="form-grid">
          <Field label="Título do site (Google e abas)" full><input {...input('seo_title')} maxLength={70} /></Field>
          <Field label="Descrição" hint="Até ~160 caracteres" full><textarea rows={2} maxLength={300} {...input('seo_description')} /></Field>
          <ImageUpload label="Imagem de compartilhamento" value={form.og_image_url} onChange={set('og_image_url')} folder="seo" onUploaded={(u) => uploaded.current.push(u)} aspect="1200 / 630" hint="1200×630 px recomendado" />
        </div>
      </section>

      <section className="a-panel">
        <h2>Páginas legais</h2>
        <MarkdownEditor label="Política de privacidade" value={form.privacy_text || ''} onChange={set('privacy_text')} rows={8} />
        <MarkdownEditor label="Termos de atendimento" value={form.terms_text || ''} onChange={set('terms_text')} rows={8} />
      </section>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
      </div>
    </form>
  )
}
