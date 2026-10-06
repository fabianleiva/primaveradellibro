import { useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import Lightbox from '../../components/Lightbox.jsx'
import { useContenido } from '../../data/ContenidoContext.jsx'

export default function GaleriaPage() {
  const { galeria, ejemplo, cargando } = useContenido()
  const { anios: ANIOS, fotos: FOTOS } = galeria
  const [anio, setAnio] = useState('Todas')
  const [abierta, setAbierta] = useState(null)

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
            onClick={() => setAnio(a)}
          >
            {a}
          </button>
        ))}
      </div>

      {FOTOS.length === 0 && (
        <p className="programa-vacio">{cargando.galeria ? 'Cargando fotos…' : 'No pudimos cargar las fotos. Recarga la página.'}</p>
      )}

      <div className="galeria-masonry">
        {fotos.map((f, i) => (
          <button key={f.id} type="button" className="galeria-item" onClick={() => setAbierta(i)} aria-label={`Abrir ${f.titulo}`}>
            {f.src ? (
              <img src={f.src} alt={f.titulo} loading="lazy" />
            ) : (
              <div className={`galeria-placeholder tono-${i % 5}`} style={{ aspectRatio: f.ratio }}>
                <span>{f.anio}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {ejemplo.galeria && <p className="sample-note">Fotos de ejemplo — se reemplazarán con las fotos reales de cada edición.</p>}

      {abierta !== null && (
        <Lightbox fotos={fotos} index={abierta} onClose={() => setAbierta(null)} onChange={setAbierta} />
      )}
    </section>
  )
}
