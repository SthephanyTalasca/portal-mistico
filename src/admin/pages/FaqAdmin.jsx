import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { supabase, must } from '../../lib/supabase'
import { friendlyError } from '../../lib/format'
import { stripMarkdown } from '../../lib/markdown'
import { moveItem, nextSortOrder } from '../../lib/admin'
import { Empty, ErrorState, Loading } from '../../components/ui/States'
import { Field, Modal, PageHeader, SortButtons, StatusPill, Toggle, useConfirm, useToast } from '../components/AdminUI'
import MarkdownEditor from '../components/MarkdownEditor'

const load = async () => must(await supabase.from('faqs').select('*').order('sort_order'))

export default function FaqAdmin() {
  const { data, loading, error, reload, setData } = useAsync(load, [])
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()

  const move = async (i, dir) => {
    setBusy(true)
    try {
      setData(await moveItem('faqs', data, i, dir))
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (f) => {
    const ok = await confirm({ title: 'Excluir pergunta', message: `Excluir “${f.question}”?`, confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    try {
      must(await supabase.from('faqs').delete().eq('id', f.id))
      toast('Pergunta excluída.')
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
        title="Perguntas frequentes"
        subtitle="Revise as respostas: pagamento, entrega e prazos ainda precisam das suas informações."
        actions={<button className="btn btn-primary" onClick={() => setEditing({ question: '', answer: '', is_published: true })}>+ Nova pergunta</button>}
      />
      {data.length === 0 ? (
        <Empty title="Nenhuma pergunta" />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Ordem</th><th>Pergunta</th><th>Status</th><th className="right">Ações</th></tr></thead>
            <tbody>
              {data.map((f, i) => (
                <tr key={f.id}>
                  <td data-label="Ordem"><SortButtons onUp={() => move(i, -1)} onDown={() => move(i, 1)} disableUp={i === 0} disableDown={i === data.length - 1} disabled={busy} /></td>
                  <td data-label="Pergunta">
                    <span className="a-strong">{f.question}</span>
                    <div className="a-sub clamp">{stripMarkdown(f.answer) || 'Sem resposta'}</div>
                  </td>
                  <td data-label="Status"><StatusPill status={f.is_published ? 'published' : 'draft'}>{f.is_published ? 'Visível' : 'Oculta'}</StatusPill></td>
                  <td data-label="Ações" className="right">
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-xs" onClick={() => setEditing(f)}>Editar</button>
                      <button className="btn btn-text btn-xs danger" onClick={() => remove(f)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <FaqModal faq={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
    </>
  )
}

function FaqModal({ faq, onClose, onSaved }) {
  const [form, setForm] = useState(faq)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const save = async (e) => {
    e.preventDefault()
    if (!form.question.trim()) return toast('Escreva a pergunta.', 'error')
    setSaving(true)
    const payload = { question: form.question.trim(), answer: form.answer.trim(), is_published: form.is_published }
    try {
      if (faq.id) must(await supabase.from('faqs').update(payload).eq('id', faq.id))
      else must(await supabase.from('faqs').insert({ ...payload, sort_order: await nextSortOrder('faqs') }))
      toast('Pergunta salva!')
      onSaved()
    } catch (err) {
      toast(friendlyError(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={faq.id ? 'Editar pergunta' : 'Nova pergunta'} onClose={onClose} size="lg">
      <form onSubmit={save} className="form-grid">
        <Field label="Pergunta *" full>
          <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} maxLength={240} />
        </Field>
        <MarkdownEditor label="Resposta" value={form.answer} onChange={(v) => setForm({ ...form, answer: v })} rows={6} />
        <div className="full"><Toggle checked={form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} label="Visível no site" /></div>
        <div className="modal-actions full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  )
}
