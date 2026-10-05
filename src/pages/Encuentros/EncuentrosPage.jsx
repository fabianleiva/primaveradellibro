import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import { useContenido } from '../../data/ContenidoContext.jsx'

export default function EncuentrosPage() {
  const { encuentros: DIAS } = useContenido()
  const [diaId, setDiaId] = useState(DIAS[0].id)

  const dia = DIAS.find((d) => d.id === diaId) || DIAS[0]
  const hayContenido = DIAS.some((d) => d.eventos.length > 0)

  return (
    <section className="page-section programa-page">
      <img src="/assets/collage/encuentro.webp" alt="" aria-hidden="true" className="decor decor-programa-r" />

      <PageHeader
        title="Encuentros profesionales"
        subtitle="Jueves 8 y viernes 9 · Actividades exclusivas para profesionales del libro: bibliotecarios, libreros, editores y mediadores de lectura"
      />

      <p className="aviso-cruzado">
        Las charlas, lanzamientos y shows para todo público están en el <Link to="/programa">programa general →</Link>
      </p>

      {hayContenido ? (
        <>
          <div className="programa-tabs" role="tablist" aria-label="Día">
            {DIAS.map((d) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={d.id === dia.id}
                className={`programa-tab${d.id === dia.id ? ' active' : ''}`}
                onClick={() => setDiaId(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <ul className="programa-list">
            {dia.eventos.length === 0 && <li className="programa-vacio">No hay actividades este día.</li>}
            {dia.eventos.map((e, i) => (
              <li key={`${dia.id}-${i}`} className="programa-item">
                <div className="programa-cuando">
                  <span className="programa-hora">{e.hora}</span>
                </div>
                <div className="programa-detalle">
                  <span className="programa-titulo">{e.titulo}</span>
                  {e.participantes && <span className="programa-participantes">{e.participantes}</span>}
                  {e.lugar && <span className="programa-lugar">{e.lugar}</span>}
                  {e.descripcion && <span className="programa-descripcion">{e.descripcion}</span>}
                </div>
                {e.tipo && <span className="programa-tipo">{e.tipo}</span>}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="programa-vacio">Pronto publicaremos aquí los encuentros profesionales del jueves 8 y el viernes 9.</p>
      )}
    </section>
  )
}
