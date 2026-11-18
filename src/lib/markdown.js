// Renderizador de Markdown mínimo e seguro (escapa HTML antes de formatar).
// Suporta: parágrafos, quebras de linha, **negrito**, *itálico*,
// listas com "- " e listas numeradas "1. ", e títulos "## ".

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const inline = (s) =>
  escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')

export function renderMarkdown(src = '') {
  const lines = String(src || '').replace(/\r\n/g, '\n').split('\n')
  let html = ''
  let list = null
  let para = []

  const flushPara = () => {
    if (para.length) {
      html += `<p>${para.map(inline).join('<br>')}</p>`
      para = []
    }
  }
  const closeList = () => {
    if (list) {
      html += `</${list}>`
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    let m
    if (!line) {
      flushPara()
      closeList()
      continue
    }
    if ((m = line.match(/^#{1,3}\s+(.*)$/))) {
      flushPara()
      closeList()
      html += `<h3>${inline(m[1])}</h3>`
      continue
    }
    if ((m = line.match(/^[-*•]\s+(.*)$/))) {
      flushPara()
      if (list !== 'ul') {
        closeList()
        html += '<ul>'
        list = 'ul'
      }
      html += `<li>${inline(m[1])}</li>`
      continue
    }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara()
      if (list !== 'ol') {
        closeList()
        html += '<ol>'
        list = 'ol'
      }
      html += `<li>${inline(m[1])}</li>`
      continue
    }
    closeList()
    para.push(line)
  }
  flushPara()
  closeList()
  return html
}

export function stripMarkdown(s = '') {
  return String(s || '')
    .replace(/\*\*|\*/g, '')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^\s*([-•]|\d+[.)])\s+/gm, '')
}
