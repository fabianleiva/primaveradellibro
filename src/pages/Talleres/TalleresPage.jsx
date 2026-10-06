import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import DescripcionCorta from '../../components/DescripcionCorta.jsx'
import { useContenido } from '../../data/ContenidoContext.jsx'

const DIAS = ['Todos', 'Viernes 9', 'Sábado 10', 'Domingo 11']

export default function TalleresPage() {
  const { talleres: TALLERES, ejemplo, cargando } = useContenido()
  const [dia, setDia] = useState('Todos')
  const talleres = TALLERES.filter((t) => dia === 'Todos' || !t.dia || t.dia === dia)

  return (
    <section className="page-section talleres-page">
      <PageHeader title="Talleres de oficios" subtitle="Aprende haciendo: talleres abiertos, junto a Caja Los Andes." />

      <p className="taller-aviso">Inscripción el día de la feria</p>
      <p className="aviso-cruzado">
        Las charlas, lanzamientos y shows están en el <Link to="/programa">programa completo →</Link>
      </p>

      {TALLERES.some((t) => t.dia) && (
        <div className="tipo-filtros" aria-label="Filtrar por día">
          {DIAS.map((d) => (
            <button key={d} type="button" className={`tipo-chip${d === dia ? ' active' : ''}`} aria-pressed={d === dia} onClick={() => setDia(d)}>
              {d}
            </button>
          ))}
        </div>
      )}

      <div className="talleres-grid talleres-grid-page">
        {talleres.length === 0 && (
          <p className="programa-vacio">
            {TALLERES.length > 0 ? 'No hay talleres este día.' : cargando.talleres ? 'Cargando talleres…' : 'No pudimos cargar los talleres. Recarga la página.'}
          </p>
        )}
        {talleres.map((t) => (
          <article key={t.id} className="taller-card">
            {(t.cuando ?? `${t.corto} · ${t.hora}`) && <span className="taller-horario">{t.cuando ?? `${t.corto} · ${t.hora}`}</span>}
            <h3 className="taller-titulo">{t.titulo}</h3>
            <DescripcionCorta texto={t.descripcion} />
            <dl className="taller-datos">
              {t.aCargo && <div><dt>A cargo</dt><dd>{t.aCargo}</dd></div>}
              {t.lugar && <div><dt>Lugar</dt><dd>{t.lugar}</dd></div>}
              {t.duracion && <div><dt>Duración</dt><dd>{t.duracion}</dd></div>}
              {t.publico && <div><dt>Público</dt><dd>{t.publico}</dd></div>}
            </dl>
            {t.cupos && <span className="taller-cupos">{t.cupos}</span>}
          </article>
        ))}
      </div>

      <div className="info-box">
        <strong>¿Cómo participar?</strong>
        <p>Los talleres tienen <strong>cupos limitados</strong> y las <strong>inscripciones son el día de la feria, por orden de llegada</strong>. Se realizan varias veces al día.</p>
        <p>Son para todas las edades, excepto los marcados como <strong>Mayores de 12 años</strong>. Los menores deben asistir acompañados por una persona adulta.</p>
      </div>

      {ejemplo.talleres && <p className="sample-note">Contenido de ejemplo — se reemplazará con los talleres oficiales.</p>}
    </section>
  )
}
