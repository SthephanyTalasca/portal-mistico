import { useRef, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { supabase, must } from '../../lib/supabase'
import { centsToInput, formatPrice, friendlyError, parsePriceToCents, slugify, STATUS_LABELS } from '../../lib/format'
import { cleanupImages, moveItem, nextSortOrder } from '../../lib/admin'
import { Empty, ErrorState, Loading } from '../../components/ui/States'
import { Field, Modal, PageHeader, SortButtons, StatusPill, useConfirm, useToast } from '../components/AdminUI'
import ImageUpload from '../components/ImageUpload'
import MarkdownEditor from '../components/MarkdownEditor'

const load = async () => must(await supabase.from('services').select('*').order('sort_order').order('name'))
const EMPTY = { name: '', slug: '', description: '', image_url: null, price: '', guidelines: '', contact_message: '', status: 'draft' }

export default function ServicesAdmin() {
  const { data, loading, error, reload, setData } = useAsync(load, [])
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()

  const move = async (i, dir) => {
    setBusy(true)
    try {
      setData(await moveItem('services', data, i, dir))
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (s) => {
    const ok = await confirm({ title: 'Excluir serviço', message: `Excluir “${s.name}”?`, confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    try {
      must(await supabase.from('services').delete().eq('id', s.id))
      await cleanupImages([s.image_url])
      toast('Serviço excluído.')
      reload()
    } catch (e) {
      toast(friendlyError(e), 'error')
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const published = data.filter((s) => s.status === 'published').length

  return (
    <>
      <PageHeader
        title="Gerenciar serviços"
        subtitle="Rituais & Trabalhos Espirituais"
        actions={<button type="button" className="btn btn-primary" onClick={() => setEditing(EMPTY)}>+ Novo serviço</button>}
      />
      <div className="a-alert">
        {published === 0
          ? 'Nenhum serviço publicado: o site exibe “Em breve — Novos caminhos e serviços estão sendo preparados.”'
          : `${published} serviço(s) publicado(s) aparecem no site.`}{' '}
        Serviços em rascunho ficam ocultos até você publicar.
      </div>
      {data.length === 0 ? (
        <Empty title="Nenhum serviço cadastrado" text="A estrutura está pronta para quando você quiser oferecer novos serviços." />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Ordem</th><th>Nome</th><th>Valor</th><th>Status</th><th className="right">Ações</th></tr></thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={s.id}>
                  <td data-label="Ordem"><SortButtons onUp={() => move(i, -1)} onDown={() => move(i, 1)} disableUp={i === 0} disableDown={i === data.length - 1} disabled={busy} /></td>
                  <td data-label="Nome"><span className="a-strong">{s.name}</span></td>
                  <td data-label="Valor">{s.price_cents != null ? formatPrice(s.price_cents) : '—'}</td>
                  <td data-label="Status"><StatusPill status={s.status}>{STATUS_LABELS[s.status].replace('Publicada', 'Publicado')}</StatusPill></td>
                  <td data-label="Ações" className="right">
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditing({ ...s, price: centsToInput(s.price_cents) })}>Editar</button>
                      <button className="btn btn-text btn-xs danger" onClick={() => remove(s)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <ServiceModal service={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
    </>
  )
}

function ServiceModal({ service, onClose, onSaved }) {
  const isNew = !service.id
  const [form, setForm] = useState({ ...EMPTY, ...service })
  const [touched, setTouched] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const uploaded = useRef([])
  const toast = useToast()
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const close = () => {
    cleanupImages(uploaded.current.filter((u) => u !== service.image_url))
    onClose()
  }

  const save = async (e) => {
    e.preventDefault()
    const price = parsePriceToCents(form.price)
    if (!form.name.trim() || !form.slug) return toast('Informe o nome do serviço.', 'error')
    if (Number.isNaN(price)) return toast('Valor inválido. Ex.: 50,00 (ou deixe vazio).', 'error')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      description: form.description.trim(),
      image_url: form.image_url || null,
      price_cents: price,
      guidelines: form.guidelines.trim(),
      contact_message: form.contact_message.trim(),
      status: form.status,
    }
    try {
      if (isNew) {
        payload.sort_order = await nextSortOrder('services')
        must(await supabase.from('services').insert(payload))
      } else {
        must(await supabase.from('services').update(payload).eq('id', service.id))
      }
      cleanupImages([service.image_url, ...uploaded.current].filter((u) => u && u !== payload.image_url))
      toast('Serviço salvo!')
      onSaved()
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={isNew ? 'Novo serviço' : 'Editar serviço'} onClose={close} size="lg">
      <form onSubmit={save} className="form-grid">
        <Field label="Nome *" full>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: touched ? f.slug : slugify(e.target.value) }))} />
        </Field>
        <Field label="Endereço (slug)" full>
          <input value={form.slug} onChange={(e) => { setTouched(true); set('slug')(slugify(e.target.value)) }} />
        </Field>
        <MarkdownEditor label="Descrição" value={form.description} onChange={set('description')} rows={5} />
        <MarkdownEditor label="Orientações" value={form.guidelines} onChange={set('guidelines')} rows={4} />
        <Field label="Valor (R$)" hint="Opcional — deixe vazio para não exibir">
          <input inputMode="decimal" value={form.price} onChange={(e) => set('price')(e.target.value)} />
        </Field>
        <Field label="Disponibilidade">
          <select value={form.status} onChange={(e) => set('status')(e.target.value)}>
            <option value="draft">Rascunho (oculto)</option>
            <option value="published">Publicado</option>
            <option value="unavailable">Indisponível (oculto)</option>
          </select>
        </Field>
        <Field label="Mensagem do botão de contato" hint="Opcional. Se vazio, a mensagem é gerada com o nome e o valor." full>
          <input value={form.contact_message} onChange={(e) => set('contact_message')(e.target.value)} />
        </Field>
        <div className="full">
          <ImageUpload label="Imagem" value={form.image_url} onChange={set('image_url')} folder="servicos" onUploaded={(u) => uploaded.current.push(u)} />
        </div>
        <div className="modal-actions full">
          <button type="button" className="btn btn-ghost" onClick={close}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
        </div>
      </form>
    </Modal>
  )
}
