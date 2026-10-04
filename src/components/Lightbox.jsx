import { useEffect, useRef } from 'react'

export default function Lightbox({ fotos, index, onClose, onChange }) {
  const closeRef = useRef(null)
  const foto = fotos[index]

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % fotos.length)
      if (e.key === 'ArrowLeft') onChange((index - 1 + fotos.length) % fotos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, fotos.length, onClose, onChange])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={foto.titulo} onClick={onClose}>
      <button ref={closeRef} type="button" className="lightbox-btn lightbox-close" aria-label="Cerrar" onClick={onClose}>×</button>
      <button
        type="button"
        className="lightbox-btn lightbox-prev"
        aria-label="Foto anterior"
        onClick={(e) => { e.stopPropagation(); onChange((index - 1 + fotos.length) % fotos.length) }}
      >‹</button>
      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        {foto.src ? (
          <img src={foto.src} alt={foto.titulo} />
        ) : (
          <div className="lightbox-placeholder" style={{ aspectRatio: foto.ratio }}>Foto próximamente</div>
        )}
        <figcaption>{foto.titulo} · {index + 1} de {fotos.length}</figcaption>
      </figure>
      <button
        type="button"
        className="lightbox-btn lightbox-next"
        aria-label="Foto siguiente"
        onClick={(e) => { e.stopPropagation(); onChange((index + 1) % fotos.length) }}
      >›</button>
    </div>
  )
}
