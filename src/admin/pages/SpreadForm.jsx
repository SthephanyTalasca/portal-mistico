import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, must } from '../../lib/supabase'
import { BADGES, centsToInput, friendlyError, parsePriceToCents, slugify, STATUS_LABELS } from '../../lib/format'
import { cleanupImages, nextSortOrder } from '../../lib/admin'
import SpreadCard from '../../components/cards/SpreadCard'
import { ErrorState, Loading } from '../../components/ui/States'
import { Field, PageHeader, Toggle, useToast } from '../components/AdminUI'
import ImageUpload from '../components/ImageUpload'
import GalleryUpload from '../components/GalleryUpload'
import MarkdownEditor from '../components/MarkdownEditor'

const EMPTY = {
  name: '',
  slug: '',
  deck_id: '',
  category_id: '',
  price: '',
  short_description: '',
  full_description: '',
  questions: '',
  service_format: '',
  delivery_time: '',
  cover_url: null,
  gallery: [],
  status: 'draft',
  featured: false,
  badge: 'none',
}

function toForm(row) {
  return {
    ...EMPTY,
    ...row,
    price: centsToInput(row.price_cents),
    questions: (row.questions || []).join('\n'),
    gallery: row.gallery || [],
  }
}

export default function SpreadForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [original, setOriginal] = useState(null)
  const [options, setOptions] = useState({ decks: [], categories: [] })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const uploaded = useRef([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [decks, categories, row] = await Promise.all([
          supabase.from('decks').select('id, name, slug').order('sort_order'),
          supabase.from('categories').select('id, name, slug').order('sort_order'),
          isNew ? Promise.resolve({ data: null, error: null }) : supabase.from('spreads').select('*').eq('id', id).maybeSingle(),
        ])
        if (!alive) return
        const d = must(decks)
        const c = must(categories)
        const r = must(row)
        setOptions({ decks: d, categories: c })
        if (!isNew && !r) throw new Error('Tiragem não encontrada.')
        if (r) {
          setForm(toForm(r))
          setOriginal(r)
        } else {
          setForm({ ...EMPTY, deck_id: d[0]?.id || '', category_id: c[0]?.id || '' })
        }
      } catch (e) {
        if (alive) setLoadError(e)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [id, isNew])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const setInput = (key) => (e) => set(key)(e.target.value)

  const onName = (e) => {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }))
  }

  const priceCents = parsePriceToCents(form.price)

  const previewSpread = useMemo(
    () => ({
      ...form,
      price_cents: Number.isFinite(priceCents) ? priceCents : 0,
      category: options.categories.find((c) => c.id === form.category_id),
      deck: options.decks.find((d) => d.id === form.deck_id),
    }),
    [form, priceCents, options]
  )

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Informe o nome da tiragem.'
    if (!form.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) e.slug = 'Use apenas letras minúsculas, números e hífens.'
    if (!form.deck_id) e.deck_id = 'Escolha um baralho.'
    if (!form.category_id) e.category_id = 'Escolha uma categoria.'
    if (priceCents === null || Number.isNaN(priceCents)) e.price = 'Informe um preço válido, ex.: 40,00'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async (e) => {
    e.preventDefault()
    if (!validate()) return toast('Revise os campos destacados.', 'error')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      deck_id: form.deck_id,
      category_id: form.category_id,
      price_cents: priceCents,
      short_description: form.short_description.trim(),
      full_description: form.full_description.trim(),
      questions: form.questions.split('\n').map((q) => q.trim()).filter(Boolean),
      service_format: form.service_format.trim(),
      delivery_time: form.delivery_time.trim(),
      cover_url: form.cover_url || null,
      gallery: form.gallery,
      status: form.status,
      featured: form.featured,
      badge: form.badge,
    }
    try {
      let saved
      if (isNew) {
        payload.sort_order = await nextSortOrder('spreads')
        saved = must(await supabase.from('spreads').insert(payload).select().single())
      } else {
        saved = must(await supabase.from('spreads').update(payload).eq('id', id).select().single())
      }
      // Remove do Storage imagens que deixaram de ser usadas
      const before = original ? [original.cover_url, ...(original.gallery || [])] : []
      const after = [saved.cover_url, ...(saved.gallery || [])]
      const orphaned = [...before, ...uploaded.current].filter((u) => u && !after.includes(u))
      uploaded.current = []
      cleanupImages(orphaned)
      toast('Alterações salvas! O site já foi atualizado.')
      if (isNew) navigate(`/admin/tiragens/${saved.id}`, { replace: true })
      else {
        setOriginal(saved)
        setForm(toForm(saved))
      }
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    const keep = original ? [original.cover_url, ...(original.gallery || [])] : []
    cleanupImages(uploaded.current.filter((u) => !keep.includes(u)))
    uploaded.current = []
    navigate('/admin/tiragens')
  }

  const track = (url) => uploaded.current.push(url)

  if (loading) return <Loading />
  if (loadError) return <ErrorState error={loadError} />

  const noOptions = options.decks.length === 0 || options.categories.length === 0

  return (
    <>
      <PageHeader
        title={isNew ? 'Nova tiragem' : `Editar: ${original?.name}`}
        actions={
          !isNew && (
            <a href={`/tiragens/${original.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              Pré-visualizar página ↗
            </a>
          )
        }
      />
      {noOptions && (
        <div className="a-alert">
          Antes de cadastrar tiragens, crie pelo menos um <Link to="/admin/baralhos">baralho</Link> e uma{' '}
          <Link to="/admin/categorias">categoria</Link>.
        </div>
      )}

      <form className="form-layout" onSubmit={save} noValidate>
        <div className="form-main">
          <section className="a-panel">
            <h2>Informações principais</h2>
            <div className="form-grid">
              <Field label="Nome da tiragem *" error={errors.name} full>
                <input value={form.name} onChange={onName} maxLength={140} />
              </Field>
              <Field label="Endereço (slug) *" error={errors.slug} hint={`/tiragens/${form.slug || '...'}`} full>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    set('slug')(slugify(e.target.value))
                  }}
                />
              </Field>
              <Field label="Baralho associado *" error={errors.deck_id}>
                <select value={form.deck_id} onChange={setInput('deck_id')}>
                  <option value="">Selecione…</option>
                  {options.decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="Categoria *" error={errors.category_id}>
                <select value={form.category_id} onChange={setInput('category_id')}>
                  <option value="">Selecione…</option>
                  {options.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Preço (R$) *" error={errors.price} hint="Ex.: 40,00">
                <input inputMode="decimal" value={form.price} onChange={setInput('price')} placeholder="0,00" />
              </Field>
              <Field label="Etiqueta">
                <select value={form.badge} onChange={setInput('badge')}>
                  {Object.entries(BADGES).map(([k, v]) => <option key={k} value={k}>{v || 'Nenhuma'}</option>)}
                </select>
              </Field>
              <Field label="Descrição curta" hint="Aparece no card do catálogo." full>
                <textarea rows={2} maxLength={220} value={form.short_description} onChange={setInput('short_description')} />
              </Field>
            </div>
          </section>

          <section className="a-panel">
            <h2>Detalhes da consulta</h2>
            <MarkdownEditor label="Descrição completa" value={form.full_description} onChange={set('full_description')} />
            <div className="form-grid">
              <Field label="Perguntas contempladas" hint="Uma pergunta por linha." full>
                <textarea rows={5} value={form.questions} onChange={setInput('questions')} />
              </Field>
              <Field label="Formato do atendimento" hint="Ex.: áudio pelo WhatsApp (opcional)">
                <input value={form.service_format} onChange={setInput('service_format')} />
              </Field>
              <Field label="Prazo de entrega" hint="Deixe vazio se não quiser exibir">
                <input value={form.delivery_time} onChange={setInput('delivery_time')} />
              </Field>
            </div>
          </section>

          <section className="a-panel">
            <h2>Imagens</h2>
            <div className="form-grid">
              <ImageUpload label="Imagem de capa" value={form.cover_url} onChange={set('cover_url')} folder="tiragens" onUploaded={track} />
              <GalleryUpload value={form.gallery} onChange={set('gallery')} folder="tiragens" onUploaded={track} />
            </div>
          </section>
        </div>

        <aside className="form-side">
          <section className="a-panel">
            <h2>Publicação</h2>
            <Field label="Status">
              <select value={form.status} onChange={setInput('status')}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <p className="a-hint">
              Rascunho fica oculto. Indisponível aparece no site sem botão de agendamento.
            </p>
            <Toggle checked={form.featured} onChange={set('featured')} label="Destaque na homepage" />
          </section>

          <section className="a-panel">
            <h2>Pré-visualização do card</h2>
            <div className="card-preview">
              <SpreadCard spread={previewSpread} preview />
            </div>
          </section>

          <div className="form-actions sticky">
            <button type="button" className="btn btn-ghost" onClick={cancel} disabled={saving}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving || noOptions}>
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </aside>
      </form>
    </>
  )
}
