import { useState } from 'react'
import { PROGRAMA } from '../../../data/programa.js'

export default function Programa() {
  const [activeId, setActiveId] = useState(PROGRAMA[0].id)
  const dia = PROGRAMA.find((d) => d.id === activeId)

  return (
    <section className="programa-section" id="programa">
      <img src="/assets/collage/telefericos.webp" alt="" aria-hidden="true" className="decor decor-programa-r" />
      <img src="/assets/collage/ninos-corren.webp" alt="" aria-hidden="true" className="decor decor-programa-l" />
      <h2 className="section-title">Programa</h2>
      <p className="section-subtitle">Tres días de libros, charlas, talleres y música.</p>

      <div className="programa-tabs" role="tablist">
        {PROGRAMA.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === activeId}
            className={`programa-tab${d.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <ul className="programa-list">
        {dia.eventos.map((e, i) => (
          <li key={`${dia.id}-${i}`} className="programa-item">
            <span className="programa-hora">{e.hora}</span>
            <div className="programa-detalle">
              <span className="programa-titulo">{e.titulo}</span>
              <span className="programa-lugar">{e.lugar}</span>
            </div>
            <span className="programa-tipo">{e.tipo}</span>
          </li>
        ))}
      </ul>

      <p className="sample-note">Contenido de ejemplo — se reemplazará con el programa oficial.</p>
    </section>
  )
}
