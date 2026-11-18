import { useMemo } from 'react'
import { renderMarkdown } from '../../lib/markdown'

/** Exibe texto com formatação básica. O HTML é escapado antes de formatar. */
export default function Markdown({ text, className = '' }) {
  const html = useMemo(() => renderMarkdown(text), [text])
  if (!html) return null
  return <div className={`prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
