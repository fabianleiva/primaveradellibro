import { useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import { TALLERES } from '../../data/talleres.js'

const DIAS = ['Todos', 'Viernes 9', 'Sábado 10', 'Domingo 11']

export default function TalleresPage() {
  const [dia, setDia] = useState('Todos')
  const talleres = TALLERES.filter((t) => dia === 'Todos' || t.dia === dia)

  return (
    <section className="page-section talleres-page">
      <PageHeader title="Talleres de oficios" subtitle="Aprende haciendo: talleres abiertos, junto a Caja Los Andes." />

      <div className="tipo-filtros" aria-label="Filtrar por día">
        {DIAS.map((d) => (
          <button key={d} type="button" className={`tipo-chip${d === dia ? ' active' : ''}`} aria-pressed={d === dia} onClick={() => setDia(d)}>
            {d}
          </button>
        ))}
      </div>

      <div className="talleres-grid talleres-grid-page">
        {talleres.length === 0 && <p className="programa-vacio">No hay talleres este día.</p>}
        {talleres.map((t) => (
          <article key={t.id} className="taller-card">
            <span className="taller-horario">{t.corto} · {t.hora}</span>
            <h3 className="taller-titulo">{t.titulo}</h3>
            <p className="taller-desc">{t.descripcion}</p>
            <dl className="taller-datos">
              <div><dt>Lugar</dt><dd>{t.lugar}</dd></div>
              <div><dt>Duración</dt><dd>{t.duracion}</dd></div>
              <div><dt>Público</dt><dd>{t.publico}</dd></div>
            </dl>
            <span className="taller-cupos">{t.cupos}</span>
          </article>
        ))}
      </div>

      <div className="info-box">
        <strong>¿Cómo participar?</strong>
        <p>Los talleres son gratuitos y los cupos se asignan por orden de llegada. Toda la información sobre inscripción se confirmará pronto.</p>
      </div>

      <p className="sample-note">Contenido de ejemplo — se reemplazará con los talleres oficiales.</p>
    </section>
  )
}
