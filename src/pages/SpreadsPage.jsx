import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { getCategories, getDecks, getSpreads } from '../lib/api'
import { normalizeText } from '../lib/format'
import SpreadCard from '../components/cards/SpreadCard'
import Reveal from '../components/ui/Reveal'
import SectionTitle from '../components/ui/SectionTitle'
import { Empty, ErrorState, SkeletonGrid } from '../components/ui/States'
import { SearchIcon } from '../components/ui/Icons'

const SORTS = {
  destaque: { label: 'Ordem sugerida', fn: (a, b) => a.sort_order - b.sort_order },
  'preco-asc': { label: 'Menor preço', fn: (a, b) => a.price_cents - b.price_cents },
  'preco-desc': { label: 'Maior preço', fn: (a, b) => b.price_cents - a.price_cents },
  nome: { label: 'Nome (A–Z)', fn: (a, b) => a.name.localeCompare(b.name, 'pt-BR') },
}

export default function SpreadsPage() {
  useSeo({ title: 'Tiragens', description: 'Escolha a consulta que melhor corresponde ao seu momento.' })
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const deck = params.get('baralho') || ''
  const category = params.get('categoria') || ''
  const sort = SORTS[params.get('ordem')] ? params.get('ordem') : 'destaque'

  const data = useAsync(() => Promise.all([getSpreads(), getDecks(), getCategories()]), [])
  const [spreads, decks, categories] = data.data || [[], [], []]

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const clear = () => setParams({}, { replace: true })

  const results = useMemo(() => {
    const term = normalizeText(q.trim())
    return spreads
      .filter((s) => !deck || s.deck?.slug === deck)
      .filter((s) => !category || s.category?.slug === category)
      .filter((s) => !term || normalizeText(`${s.name} ${s.short_description} ${s.category?.name || ''}`).includes(term))
      .sort(SORTS[sort].fn)
  }, [spreads, q, deck, category, sort])

  const hasFilters = q || deck || category || sort !== 'destaque'

  return (
    <section className="section page-top">
      <div className="container">
        <SectionTitle as="h1" title="Encontre sua tiragem" subtitle="Escolha a consulta que melhor corresponde ao seu momento." />

        <form className="filter-bar" role="search" onSubmit={(e) => e.preventDefault()}>
          <label className="field field-search">
            <span className="sr-only">Buscar tiragem</span>
            <SearchIcon />
            <input type="search" placeholder="Buscar tiragem…" value={q} onChange={(e) => setParam('q', e.target.value)} />
          </label>
          <label className="field">
            <span className="sr-only">Filtrar por baralho</span>
            <select value={deck} onChange={(e) => setParam('baralho', e.target.value)}>
              <option value="">Todos os baralhos</option>
              {decks.map((d) => <option key={d.id} value={d.slug}>{d.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="sr-only">Filtrar por categoria</span>
            <select value={category} onChange={(e) => setParam('categoria', e.target.value)}>
              <option value="">Todas as categorias</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="sr-only">Ordenar</span>
            <select value={sort} onChange={(e) => setParam('ordem', e.target.value === 'destaque' ? '' : e.target.value)}>
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
        </form>

        {data.loading && <SkeletonGrid count={3} />}
        {data.error && <ErrorState error={data.error} onRetry={data.reload} />}
        {!data.loading && !data.error && (
          <>
            <div className="results-meta" aria-live="polite">
              <span>{results.length} {results.length === 1 ? 'tiragem encontrada' : 'tiragens encontradas'}</span>
              {hasFilters && <button type="button" className="link-btn" onClick={clear}>Limpar filtros</button>}
            </div>
            {results.length === 0 ? (
              <Empty
                title="Nenhuma tiragem encontrada"
                text="Tente outra busca ou remova os filtros."
                action={hasFilters ? <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>Limpar filtros</button> : null}
              />
            ) : (
              <div className="card-grid">
                {results.map((s, i) => (
                  <Reveal key={s.id} delay={Math.min(i, 6) * 60}>
                    <SpreadCard spread={s} index={i} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
