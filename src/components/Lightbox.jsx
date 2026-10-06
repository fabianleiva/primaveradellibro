import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Lightbox({ fotos, index, onClose, onChange }) {
  const closeRef = useRef(null)
  const foto = fotos[index]
  const toque = useRef(null)

  // Deslizar con el dedo: izquierda = siguiente, derecha = anterior
  const alTocar = (e) => { toque.current = e.touches[0].clientX }
  const alSoltar = (e) => {
    if (toque.current === null) return
    const dx = e.changedTouches[0].clientX - toque.current
    toque.current = null
    if (Math.abs(dx) < 50) return
    onChange(dx < 0 ? (index + 1) % fotos.length : (index - 1 + fotos.length) % fotos.length)
  }

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
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

  // Se dibuja en <body>, fuera de la sección: así queda fijo sobre toda la pantalla
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={foto.titulo} onClick={onClose} onTouchStart={alTocar} onTouchEnd={alSoltar}>
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
    </div>,
    document.body,
  )
}
