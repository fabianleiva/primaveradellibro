import { useEffect, useRef, useState } from 'react'

// Muestra la descripción recortada a 4 líneas, con "Ver más" solo si el texto no cabe.
export default function DescripcionCorta({ texto, className = 'taller-desc' }) {
  const ref = useRef(null)
  const [abierta, setAbierta] = useState(false)
  const [desborda, setDesborda] = useState(false)

  useEffect(() => {
    const medir = () => {
      const el = ref.current
      if (el && !abierta) setDesborda(el.scrollHeight > el.clientHeight + 1)
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [texto, abierta])

  return (
    <>
      <p ref={ref} className={`${className}${abierta ? '' : ' desc-recortada'}`}>{texto}</p>
      {(desborda || abierta) && (
        <button type="button" className="ver-mas-btn" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
          {abierta ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </>
  )
}
