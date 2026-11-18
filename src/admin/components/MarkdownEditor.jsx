import { useRef, useState } from 'react'
import Markdown from '../../components/ui/Markdown'

/** Editor com formatação básica (negrito, itálico, títulos e listas) e prévia */
export default function MarkdownEditor({ label, value = '', onChange, rows = 8, hint }) {
  const ref = useRef(null)
  const [tab, setTab] = useState('write')

  const restore = (start, end) =>
    requestAnimationFrame(() => {
      ref.current?.focus()
      ref.current?.setSelectionRange(start, end)
    })

  const wrap = (mark) => {
    const ta = ref.current
    const { selectionStart: s, selectionEnd: e } = ta
    const sel = value.slice(s, e) || 'texto'
    onChange(value.slice(0, s) + mark + sel + mark + value.slice(e))
    restore(s + mark.length, s + mark.length + sel.length)
  }

  const prefix = (fn) => {
    const ta = ref.current
    const { selectionStart: s, selectionEnd: e } = ta
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const endIdx = value.indexOf('\n', e)
    const lineEnd = endIdx === -1 ? value.length : endIdx
    const block = value.slice(lineStart, lineEnd)
    const replaced = block
      .split('\n')
      .map((l, i) => fn(i) + l.replace(/^(#{1,3}\s+|[-*•]\s+|\d+[.)]\s+)/, ''))
      .join('\n')
    onChange(value.slice(0, lineStart) + replaced + value.slice(lineEnd))
    restore(lineStart, lineStart + replaced.length)
  }

  const tools = [
    { label: 'N', title: 'Negrito', cls: 'b', run: () => wrap('**') },
    { label: 'I', title: 'Itálico', cls: 'i', run: () => wrap('*') },
    { label: 'T', title: 'Título', run: () => prefix(() => '## ') },
    { label: '• Lista', title: 'Lista com marcadores', run: () => prefix(() => '- ') },
    { label: '1. Lista', title: 'Lista numerada', run: () => prefix((i) => `${i + 1}. `) },
  ]

  return (
    <div className="md-editor a-field full">
      {label && <span className="a-label">{label}</span>}
      <div className="md-toolbar" role="toolbar" aria-label="Formatação">
        {tab === 'write' &&
          tools.map((t) => (
            <button key={t.title} type="button" className={`md-tool ${t.cls || ''}`} title={t.title} aria-label={t.title} onClick={t.run}>
              {t.label}
            </button>
          ))}
        <span className="md-tabs">
          <button type="button" className={tab === 'write' ? 'is-active' : ''} onClick={() => setTab('write')}>Escrever</button>
          <button type="button" className={tab === 'preview' ? 'is-active' : ''} onClick={() => setTab('preview')}>Pré-visualizar</button>
        </span>
      </div>
      {tab === 'write' ? (
        <textarea ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="md-preview">{value ? <Markdown text={value} /> : <p className="a-hint">Nada para pré-visualizar.</p>}</div>
      )}
      <small className="a-hint">{hint || 'Deixe uma linha em branco entre parágrafos. Use "- " para listas.'}</small>
    </div>
  )
}
