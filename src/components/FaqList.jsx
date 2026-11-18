import { useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { getFaqs } from '../lib/api'
import Markdown from './ui/Markdown'
import { ChevronDown } from './ui/Icons'
import { Empty, ErrorState, Loading } from './ui/States'

export default function FaqList({ limit }) {
  const { data, loading, error, reload } = useAsync(getFaqs, [])
  const [open, setOpen] = useState(null)

  if (loading) return <Loading label="Carregando perguntas…" />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const items = limit ? data.slice(0, limit) : data
  if (!items.length) return <Empty title="Perguntas em breve" text="Em caso de dúvida, fale comigo pelo WhatsApp." />

  return (
    <div className="faq-list">
      {items.map((f) => {
        const isOpen = open === f.id
        return (
          <div key={f.id} className={`faq-item${isOpen ? ' is-open' : ''}`}>
            <h3>
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={`faq-${f.id}`}
                onClick={() => setOpen(isOpen ? null : f.id)}
              >
                <span>{f.question}</span>
                <ChevronDown />
              </button>
            </h3>
            <div id={`faq-${f.id}`} className="faq-answer" role="region" aria-hidden={!isOpen}>
              <div className="faq-answer-inner">
                <Markdown text={f.answer || 'Resposta em breve.'} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
