import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { supabase, must } from '../../lib/supabase'
import { formatPrice, friendlyError, normalizeText, STATUS_LABELS } from '../../lib/format'
import { cleanupImages, moveItem, nextSortOrder } from '../../lib/admin'
import { Empty, ErrorState, Loading } from '../../components/ui/States'
import MysticPlaceholder from '../../components/ui/MysticPlaceholder'
import { PageHeader, SortButtons, StatusPill, useConfirm, useToast } from '../components/AdminUI'

async function load() {
  const [spreads, decks] = await Promise.all([
    supabase.from('spreads').select('*, deck:decks(id, name), category:categories(id, name)').order('sort_order').order('name'),
    supabase.from('decks').select('id, name').order('sort_order'),
  ])
  return { spreads: must(spreads), decks: must(decks) }
}

export default function SpreadsAdmin() {
  const { data, loading, error, reload, setData } = useAsync(load, [])
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const deckFilter = params.get('baralho') || ''
  const [statusFilter, setStatusFilter] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    if (!data) return []
    const term = normalizeText(q.trim())
    return data.spreads
      .filter((s) => !deckFilter || s.deck_id === deckFilter)
      .filter((s) => !statusFilter || s.status === statusFilter)
      .filter((s) => !term || normalizeText(s.name).includes(term))
  }, [data, q, deckFilter, statusFilter])

  const filtering = Boolean(q || deckFilter || statusFilter)

  const move = async (index, dir) => {
    setBusy(true)
    try {
      const next = await moveItem('spreads', data.spreads, index, dir)
      setData({ ...data, spreads: next })
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  const duplicate = async (s) => {
    setBusy(true)
    try {
      const { id, created_at, updated_at, deck, category, ...rest } = s
      const suffix = Date.now().toString(36).slice(-4)
      const copy = {
        ...rest,
        name: `${s.name} (cópia)`,
        slug: `${s.slug}-copia-${suffix}`.slice(0, 80),
        status: 'draft',
        featured: false,
        sort_order: await nextSortOrder('spreads'),
      }
      const created = must(await supabase.from('spreads').insert(copy).select('id').single())
      toast('Tiragem duplicada como rascunho.')
      navigate(`/admin/tiragens/${created.id}`)
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (s) => {
    const ok = await confirm({
      title: 'Excluir tiragem',
      message: `Tem certeza que deseja excluir “${s.name}”? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      danger: true,
    })
    if (!ok) return
    setBusy(true)
    try {
      must(await supabase.from('spreads').delete().eq('id', s.id))
      await cleanupImages([s.cover_url, ...(s.gallery || [])])
      toast('Tiragem excluída.')
      reload()
    } catch (e) {
      toast(friendlyError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Gerenciar tiragens"
        subtitle={`${data.spreads.length} cadastrada(s)`}
        actions={<Link to="/admin/tiragens/nova" className="btn btn-primary">+ Adicionar nova tiragem</Link>}
      />

      <div className="a-filters">
        <input type="search" placeholder="Buscar por nome…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <select
          value={deckFilter}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            e.target.value ? next.set('baralho', e.target.value) : next.delete('baralho')
            setParams(next, { replace: true })
          }}
          aria-label="Filtrar por baralho"
        >
          <option value="">Todos os baralhos</option>
          {data.decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Empty
          title={filtering ? 'Nenhuma tiragem com esses filtros' : 'Nenhuma tiragem cadastrada'}
          action={!filtering && <Link to="/admin/tiragens/nova" className="btn btn-primary btn-sm">Cadastrar a primeira</Link>}
        />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Baralho</th>
                <th>Preço</th>
                <th>Status</th>
                <th className="right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const idx = data.spreads.findIndex((x) => x.id === s.id)
                return (
                  <tr key={s.id}>
                    <td data-label="Ordem">
                      <SortButtons
                        onUp={() => move(idx, -1)}
                        onDown={() => move(idx, 1)}
                        disableUp={idx === 0}
                        disableDown={idx === data.spreads.length - 1}
                        disabled={busy || filtering}
                        title={filtering ? 'Limpe os filtros para reordenar' : undefined}
                      />
                    </td>
                    <td data-label="Imagem">
                      <div className="a-thumb">
                        {s.cover_url ? <img src={s.cover_url} alt="" /> : <MysticPlaceholder variant={idx} />}
                      </div>
                    </td>
                    <td data-label="Nome">
                      <Link to={`/admin/tiragens/${s.id}`} className="a-strong">{s.name}</Link>
                      <div className="a-sub">
                        {s.category?.name}
                        {s.featured && ' · ★ Destaque'}
                      </div>
                    </td>
                    <td data-label="Baralho">{s.deck?.name}</td>
                    <td data-label="Preço">{formatPrice(s.price_cents)}</td>
                    <td data-label="Status"><StatusPill status={s.status}>{STATUS_LABELS[s.status]}</StatusPill></td>
                    <td data-label="Ações" className="right">
                      <div className="row-actions">
                        <Link to={`/admin/tiragens/${s.id}`} className="btn btn-ghost btn-xs">Editar</Link>
                        <button type="button" className="btn btn-ghost btn-xs" onClick={() => duplicate(s)} disabled={busy}>Duplicar</button>
                        <button type="button" className="btn btn-text btn-xs danger" onClick={() => remove(s)} disabled={busy}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
