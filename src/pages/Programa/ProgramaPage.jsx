import { useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import { PROGRAMA } from '../../data/programa.js'

const TIPOS = ['Todos', ...Array.from(new Set(PROGRAMA.flatMap((d) => d.eventos.map((e) => e.tipo))))]

export default function ProgramaPage() {
  const [diaId, setDiaId] = useState(PROGRAMA[0].id)
  const [tipo, setTipo] = useState('Todos')

  const dia = PROGRAMA.find((d) => d.id === diaId)
  const eventos = useMemo(
    () => dia.eventos.filter((e) => tipo === 'Todos' || e.tipo === tipo),
    [dia, tipo],
  )

  return (
    <section className="page-section programa-page">
      <img src="/assets/collage/telefericos.webp" alt="" aria-hidden="true" className="decor decor-programa-r" />
      <img src="/assets/collage/ninos-corren.webp" alt="" aria-hidden="true" className="decor decor-programa-l" />

      <PageHeader title="Programa" subtitle="9, 10 y 11 de octubre · Estación Mapocho · Entrada liberada" />

      <div className="programa-tabs" role="tablist" aria-label="Día">
        {PROGRAMA.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === diaId}
            className={`programa-tab${d.id === diaId ? ' active' : ''}`}
            onClick={() => setDiaId(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="tipo-filtros" aria-label="Filtrar por tipo de actividad">
        {TIPOS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tipo-chip${t === tipo ? ' active' : ''}`}
            aria-pressed={t === tipo}
            onClick={() => setTipo(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="programa-list">
        {eventos.length === 0 && <li className="programa-vacio">No hay actividades de este tipo este día.</li>}
        {eventos.map((e, i) => (
          <li key={`${diaId}-${i}`} className="programa-item">
            <div className="programa-cuando">
              <span className="programa-hora">{e.hora}</span>
            </div>
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
