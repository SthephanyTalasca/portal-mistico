import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { supabase, must } from '../../lib/supabase'
import { friendlyError, slugify } from '../../lib/format'
import { moveItem, nextSortOrder } from '../../lib/admin'
import { Empty, ErrorState, Loading } from '../../components/ui/States'
import { Field, Modal, PageHeader, SortButtons, StatusPill, useConfirm, useToast } from '../components/AdminUI'

async function load() {
  const [cats, spreads] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order').order('name'),
    supabase.from('spreads').select('category_id'),
  ])
  const counts = must(spreads).reduce((a, s) => ((a[s.category_id] = (a[s.category_id] || 0) + 1), a), {})
  return must(cats).map((c) => ({ ...c, spread_count: counts[c.id] || 0 }))
}

export default function CategoriesAdmin() {
  const { data, loading, error, reload, setData } = useAsync(load, [])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()

  const move = async (i, dir) => {
    setBusy(true)
    try {
      setData(await moveItem('categories', data, i, dir))
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (c) => {
    try {
      must(await supabase.from('categories').update({ is_visible: !c.is_visible }).eq('id', c.id))
      reload()
    } catch (e) {
      toast(friendlyError(e), 'error')
    }
  }

  const remove = async (c) => {
    if (c.spread_count > 0) return setDeleting(c)
    const ok = await confirm({ title: 'Excluir categoria', message: `Excluir “${c.name}”?`, confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    try {
      must(await supabase.rpc('delete_category_transfer', { p_category: c.id, p_target: null }))
      toast('Categoria excluída.')
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
        title="Gerenciar categorias"
        actions={<button type="button" className="btn btn-primary" onClick={() => setEditing({ name: '', slug: '' })}>+ Nova categoria</button>}
      />
      {data.length === 0 ? (
        <Empty title="Nenhuma categoria" />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Ordem</th><th>Nome</th><th>Tiragens</th><th>Status</th><th className="right">Ações</th></tr></thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={c.id}>
                  <td data-label="Ordem"><SortButtons onUp={() => move(i, -1)} onDown={() => move(i, 1)} disableUp={i === 0} disableDown={i === data.length - 1} disabled={busy} /></td>
                  <td data-label="Nome"><span className="a-strong">{c.name}</span></td>
                  <td data-label="Tiragens">{c.spread_count}</td>
                  <td data-label="Status"><StatusPill status={c.is_visible ? 'published' : 'draft'}>{c.is_visible ? 'Visível' : 'Oculta'}</StatusPill></td>
                  <td data-label="Ações" className="right">
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditing(c)}>Renomear</button>
                      <button className="btn btn-ghost btn-xs" onClick={() => toggle(c)}>{c.is_visible ? 'Ocultar' : 'Mostrar'}</button>
                      <button className="btn btn-text btn-xs danger" onClick={() => remove(c)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="a-hint">Categorias ocultas não aparecem no filtro do catálogo, mas as tiragens continuam visíveis.</p>

      {editing && <CategoryModal cat={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
      {deleting && (
        <TransferModal
          cat={deleting}
          others={data.filter((c) => c.id !== deleting.id)}
          onClose={() => setDeleting(null)}
          onDone={() => { setDeleting(null); reload() }}
        />
      )}
    </>
  )
}

function CategoryModal({ cat, onClose, onSaved }) {
  const isNew = !cat.id
  const [name, setName] = useState(cat.name)
  const [slug, setSlug] = useState(cat.slug)
  const [touched, setTouched] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const save = async (e) => {
    e.preventDefault()
    if (!name.trim() || !slug) return toast('Informe o nome.', 'error')
    setSaving(true)
    try {
      if (isNew) must(await supabase.from('categories').insert({ name: name.trim(), slug, sort_order: await nextSortOrder('categories') }))
      else must(await supabase.from('categories').update({ name: name.trim(), slug }).eq('id', cat.id))
      toast('Categoria salva!')
      onSaved()
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={isNew ? 'Nova categoria' : 'Renomear categoria'} onClose={onClose} size="sm">
      <form onSubmit={save} className="form-grid">
        <Field label="Nome *" full>
          <input value={name} onChange={(e) => { setName(e.target.value); if (!touched) setSlug(slugify(e.target.value)) }} />
        </Field>
        <Field label="Endereço (slug)" full hint="Usado no filtro do catálogo (?categoria=...)">
          <input value={slug} onChange={(e) => { setTouched(true); setSlug(slugify(e.target.value)) }} />
        </Field>
        <div className="modal-actions full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  )
}

function TransferModal({ cat, others, onClose, onDone }) {
  const [target, setTarget] = useState(others[0]?.id || '')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const run = async (e) => {
    e.preventDefault()
    if (!target) return toast('Escolha a categoria de destino.', 'error')
    setSaving(true)
    try {
      must(await supabase.rpc('delete_category_transfer', { p_category: cat.id, p_target: target }))
      toast(`Tiragens transferidas e “${cat.name}” excluída.`)
      onDone()
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Transferir tiragens antes de excluir" onClose={onClose} size="sm">
      {others.length === 0 ? (
        <>
          <p>Crie outra categoria primeiro: as {cat.spread_count} tiragem(ns) de “{cat.name}” precisam ser transferidas.</p>
          <div className="modal-actions"><button className="btn btn-primary" onClick={onClose}>Entendi</button></div>
        </>
      ) : (
        <form onSubmit={run}>
          <p>“{cat.name}” contém {cat.spread_count} tiragem(ns). Para onde devem ir?</p>
          <Field label="Nova categoria">
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-danger" disabled={saving}>{saving ? 'Transferindo…' : 'Transferir e excluir'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}
