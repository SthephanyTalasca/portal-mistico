import { useRef, useState } from 'react'
import { ACCEPT, MAX_MB, uploadImage, validateImage } from '../../lib/storage'
import { friendlyError } from '../../lib/format'
import { useToast } from './AdminUI'

export default function GalleryUpload({ value = [], onChange, folder = 'galeria', onUploaded }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(0)
  const toast = useToast()

  const pick = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    const valid = files.filter((f) => {
      const err = validateImage(f)
      if (err) toast(`${f.name}: ${err}`, 'error')
      return !err
    })
    if (!valid.length) return
    setBusy(valid.length)
    const added = []
    for (const f of valid) {
      try {
        const url = await uploadImage(f, folder)
        onUploaded?.(url)
        added.push(url)
      } catch (ex) {
        toast(`${f.name}: ${friendlyError(ex)}`, 'error')
      }
      setBusy((b) => b - 1)
    }
    if (added.length) onChange([...value, ...added])
  }

  const move = (i, dir) => {
    const next = [...value]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="gallery-upload">
      <span className="a-label">Galeria (opcional)</span>
      <div className="gallery-grid">
        {value.map((url, i) => (
          <figure key={url} className="gallery-item">
            <img src={url} alt={`Imagem ${i + 1} da galeria`} />
            <div className="gallery-item-actions">
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover para a esquerda">◀</button>
              <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Mover para a direita">▶</button>
              <button type="button" className="icon-btn danger" onClick={() => onChange(value.filter((u) => u !== url))} aria-label="Remover imagem">×</button>
            </div>
          </figure>
        ))}
        <button type="button" className="gallery-add" onClick={() => input.current?.click()} disabled={busy > 0}>
          {busy > 0 ? `Enviando ${busy}…` : '+ Adicionar'}
        </button>
      </div>
      <small className="a-hint">JPG, PNG ou WebP · até {MAX_MB} MB cada</small>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={pick} />
    </div>
  )
}
