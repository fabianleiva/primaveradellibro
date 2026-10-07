import { useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import Lightbox from '../../components/Lightbox.jsx'
import { useContenido } from '../../data/ContenidoContext.jsx'

const POR_TANDA = 24

// Cada foto reserva su espacio (proporción real) y aparece con un fundido cuando termina de cargar:
// la página no se mueve y se nota que está cargando, en vez de ver fotos entrar de a una.
function FotoGaleria({ f, i, onAbrir }) {
  const [lista, setLista] = useState(false)
  return (
    <button type="button" className="galeria-item" onClick={() => onAbrir(i)} aria-label={`Abrir ${f.titulo}`}>
      <span className={`galeria-foto${lista ? ' lista' : ''}`} style={{ aspectRatio: f.ratio }}>
        <img
          ref={(el) => { if (el && el.complete && el.naturalWidth) setLista(true) }}
          src={f.src}
          alt={f.titulo}
          loading={i < 12 ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLista(true)}
        />
      </span>
    </button>
  )
}

export default function GaleriaPage() {
  const { galeria, ejemplo, cargando } = useContenido()
  const { anios: ANIOS, fotos: FOTOS } = galeria
  const [anio, setAnio] = useState('Todas')
  const [abierta, setAbierta] = useState(null)
  const [cuantas, setCuantas] = useState(POR_TANDA)

  const fotos = anio === 'Todas' ? FOTOS : FOTOS.filter((f) => f.anio === anio)

  return (
    <section className="page-section galeria-page">
      <PageHeader title="Galería" subtitle="Quince años de primaveras: revive los mejores momentos de cada edición." />

      <div className="tipo-filtros" aria-label="Filtrar por año">
        {['Todas', ...ANIOS].map((a) => (
          <button
            key={a}
            type="button"
            className={`tipo-chip${a === anio ? ' active' : ''}`}
            aria-pressed={a === anio}
            onClick={() => { setAnio(a); setCuantas(POR_TANDA) }}
          >
            {a}
          </button>
        ))}
      </div>

      {FOTOS.length === 0 && (
        <p className="programa-vacio">{cargando.galeria ? 'Cargando fotos…' : 'No pudimos cargar las fotos. Recarga la página.'}</p>
      )}

      <div className="galeria-masonry">
        {fotos.slice(0, cuantas).map((f, i) => (
          <FotoGaleria key={f.id} f={f} i={i} onAbrir={setAbierta} />
        ))}
      </div>

      {fotos.length > cuantas && (
        <div className="ver-mas-wrap">
          <button type="button" className="ver-galeria-btn galeria-mas" onClick={() => setCuantas((n) => n + POR_TANDA)}>
            Ver más fotos ({fotos.length - cuantas} más)
          </button>
        </div>
      )}

      {ejemplo.galeria && <p className="sample-note">Fotos de ejemplo — se reemplazarán con las fotos reales de cada edición.</p>}

      {abierta !== null && (
        <Lightbox fotos={fotos} index={abierta} onClose={() => setAbierta(null)} onChange={setAbierta} />
      )}
    </section>
  )
}
