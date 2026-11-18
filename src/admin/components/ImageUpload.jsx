import { useEffect, useRef, useState } from 'react'
import { ACCEPT, MAX_MB, uploadImage, validateImage } from '../../lib/storage'
import { friendlyError } from '../../lib/format'
import { useToast } from './AdminUI'

/**
 * Upload de uma imagem com prévia, substituição e remoção.
 * onUploaded(url) é chamado para cada envio (usado para limpar arquivos não salvos).
 */
export default function ImageUpload({ label, value, onChange, folder = 'geral', onUploaded, aspect = '16 / 10', hint }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [localPreview, setLocalPreview] = useState(null)
  const toast = useToast()

  useEffect(() => () => localPreview && URL.revokeObjectURL(localPreview), [localPreview])

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const err = validateImage(file)
    if (err) return toast(err, 'error')
    setLocalPreview(URL.createObjectURL(file))
    setBusy(true)
    try {
      const url = await uploadImage(file, folder)
      onUploaded?.(url)
      onChange(url)
    } catch (ex) {
      toast(`Falha no envio: ${friendlyError(ex)}`, 'error')
    } finally {
      setBusy(false)
      setLocalPreview(null)
    }
  }

  const src = localPreview || value

  return (
    <div className="image-upload">
      {label && <span className="a-label">{label}</span>}
      <div className="image-upload-box" style={{ aspectRatio: aspect }}>
        {src ? <img src={src} alt="Prévia" /> : <span className="image-upload-empty">Nenhuma imagem</span>}
        {busy && <span className="image-upload-busy">Enviando…</span>}
      </div>
      <div className="image-upload-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => input.current?.click()} disabled={busy}>
          {value ? 'Substituir' : 'Enviar imagem'}
        </button>
        {value && (
          <button type="button" className="btn btn-text btn-sm danger" onClick={() => onChange(null)} disabled={busy}>
            Remover
          </button>
        )}
      </div>
      <small className="a-hint">{hint || `JPG, PNG ou WebP · até ${MAX_MB} MB`}</small>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={pick} />
    </div>
  )
}
