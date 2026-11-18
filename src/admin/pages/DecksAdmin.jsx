import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { supabase, must } from '../../lib/supabase'
import { BADGES, friendlyError, slugify } from '../../lib/format'
import { cleanupImages, moveItem, nextSortOrder } from '../../lib/admin'
import { Empty, ErrorState, Loading } from '../../components/ui/States'
import MysticPlaceholder from '../../components/ui/MysticPlaceholder'
import { Field, Modal, PageHeader, SortButtons, StatusPill, Toggle, useConfirm, useToast } from '../components/AdminUI'
import ImageUpload from '../components/ImageUpload'

async function load() {
  const [decks, spreads] = await Promise.all([
    supabase.from('decks').select('*').order('sort_order').order('name'),
    supabase.from('spreads').select('deck_id'),
  ])
  const counts = must(spreads).reduce((a, s) => ((a[s.deck_id] = (a[s.deck_id] || 0) + 1), a), {})
  return must(decks).map((d) => ({ ...d, spread_count: counts[d.id] || 0 }))
}

const EMPTY = { name: '', slug: '', description: '', cover_url: null, badge: 'none', is_published: true }

export default function DecksAdmin() {
  const { data, loading, error, reload, setData } = useAsync(load, [])
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()

  const move = async (i, dir) => {
    setBusy(true)
    try {
      setData(await moveItem('decks', data, i, dir))
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  const togglePublish = async (d) => {
    try {
      must(await supabase.from('decks').update({ is_published: !d.is_published }).eq('id', d.id))
      toast(d.is_published ? 'Baralho ocultado do site.' : 'Baralho publicado!')
      reload()
    } catch (e) {
      toast(friendlyError(e), 'error')
    }
  }

  const remove = async (d) => {
    if (d.spread_count > 0) {
      return toast(`“${d.name}” tem ${d.spread_count} tiragem(ns). Mova-as para outro baralho ou exclua-as antes.`, 'error')
    }
    const ok = await confirm({ title: 'Excluir baralho', message: `Excluir “${d.name}”?`, confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    try {
      must(await supabase.from('decks').delete().eq('id', d.id))
      await cleanupImages([d.cover_url])
      toast('Baralho excluído.')
      reload()
    } catch (e) {
      toast(friendlyError(e), 'error')
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Gerenciar baralhos"
        subtitle="Sem limite de baralhos. A ordem aqui é a ordem do site."
        actions={<button type="button" className="btn btn-primary" onClick={() => setEditing(EMPTY)}>+ Novo baralho</button>}
      />
      {data.length === 0 ? (
        <Empty title="Nenhum baralho" action={<button className="btn btn-primary btn-sm" onClick={() => setEditing(EMPTY)}>Criar baralho</button>} />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>Ordem</th><th>Capa</th><th>Nome</th><th>Tiragens</th><th>Status</th><th className="right">Ações</th></tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={d.id}>
                  <td data-label="Ordem">
                    <SortButtons onUp={() => move(i, -1)} onDown={() => move(i, 1)} disableUp={i === 0} disableDown={i === data.length - 1} disabled={busy} />
                  </td>
                  <td data-label="Capa"><div className="a-thumb">{d.cover_url ? <img src={d.cover_url} alt="" /> : <MysticPlaceholder variant={i} />}</div></td>
                  <td data-label="Nome">
                    <span className="a-strong">{d.name}</span>
                    {BADGES[d.badge] && <div className="a-sub">Etiqueta: {BADGES[d.badge]}</div>}
                  </td>
                  <td data-label="Tiragens"><Link to={`/admin/tiragens?baralho=${d.id}`}>{d.spread_count} · ver</Link></td>
                  <td data-label="Status">
                    <StatusPill status={d.is_published ? 'published' : 'draft'}>{d.is_published ? 'Publicado' : 'Oculto'}</StatusPill>
                  </td>
                  <td data-label="Ações" className="right">
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditing(d)}>Editar</button>
                      <button className="btn btn-ghost btn-xs" onClick={() => togglePublish(d)}>{d.is_published ? 'Ocultar' : 'Publicar'}</button>
                      <button className="btn btn-text btn-xs danger" onClick={() => remove(d)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="a-hint">Para associar tiragens a um baralho, escolha o baralho no formulário de cada tiragem.</p>
      {editing && <DeckModal deck={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
    </>
  )
}

function DeckModal({ deck, onClose, onSaved }) {
  const isNew = !deck.id
  const [form, setForm] = useState({ ...EMPTY, ...deck })
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const uploaded = useRef([])
  const toast = useToast()
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const close = () => {
    cleanupImages(uploaded.current.filter((u) => u !== deck.cover_url))
    onClose()
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast('Informe o nome do baralho.', 'error')
    if (!form.slug) return toast('Informe o endereço (slug).', 'error')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      description: form.description.trim(),
      cover_url: form.cover_url || null,
      badge: form.badge,
      is_published: form.is_published,
    }
    try {
      if (isNew) {
        payload.sort_order = await nextSortOrder('decks')
        must(await supabase.from('decks').insert(payload))
      } else {
        must(await supabase.from('decks').update(payload).eq('id', deck.id))
      }
      cleanupImages([deck.cover_url, ...uploaded.current].filter((u) => u && u !== payload.cover_url))
      toast('Baralho salvo!')
      onSaved()
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={isNew ? 'Novo baralho' : 'Editar baralho'} onClose={close}>
      <form onSubmit={save} className="form-grid">
        <Field label="Nome *" full>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))} />
        </Field>
        <Field label="Endereço (slug)" hint={`/baralhos/${form.slug || '...'}`} full>
          <input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug')(slugify(e.target.value)) }} />
        </Field>
        <Field label="Descrição" full>
          <textarea rows={3} value={form.description} onChange={(e) => set('description')(e.target.value)} />
        </Field>
        <Field label="Etiqueta">
          <select value={form.badge} onChange={(e) => set('badge')(e.target.value)}>
            {Object.entries(BADGES).map(([k, v]) => <option key={k} value={k}>{v || 'Nenhuma'}</option>)}
          </select>
        </Field>
        <div className="a-field"><span className="a-label">Visibilidade</span><Toggle checked={form.is_published} onChange={set('is_published')} label="Publicado no site" /></div>
        <div className="full">
          <ImageUpload label="Imagem de capa" value={form.cover_url} onChange={set('cover_url')} folder="baralhos" onUploaded={(u) => uploaded.current.push(u)} />
        </div>
        <div className="modal-actions full">
          <button type="button" className="btn btn-ghost" onClick={close}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
        </div>
      </form>
    </Modal>
  )
}
