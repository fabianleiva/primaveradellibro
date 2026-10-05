import { Link } from 'react-router-dom'
import SectionTitle from '../../../components/SectionTitle.jsx'
import DescripcionCorta from '../../../components/DescripcionCorta.jsx'
import { useContenido } from '../../../data/ContenidoContext.jsx'

export default function Talleres() {
  const { talleres: TALLERES, ejemplo } = useContenido()
  const destacados = TALLERES.filter((t) => t.destacado)

  return (
    <section className="talleres-section tear" id="talleres" style={{ '--prev-bg': '#fff' }}>
      <img src="/assets/collage/flor-rosa.webp" alt="" aria-hidden="true" className="decor decor-talleres-l" />
      <img src="/assets/collage/mujer-lee.webp" alt="" aria-hidden="true" className="decor decor-talleres-r" />
      <SectionTitle>Talleres de oficios</SectionTitle>
      <p className="section-subtitle">Aprende haciendo: talleres abiertos para toda la familia.</p>

      <div className="talleres-grid">
        {destacados.map((t) => (
          <article key={t.id} className="taller-card">
            <span className="taller-horario">{[t.corto, t.hora].filter(Boolean).join(' · ')}</span>
            <h3 className="taller-titulo">{t.titulo}</h3>
            <DescripcionCorta texto={t.descripcion} />
            {(t.aCargo || t.cupos) && <span className="taller-cupos">{t.aCargo || t.cupos}</span>}
          </article>
        ))}
      </div>

      <div className="ver-mas-wrap">
        <Link to="/talleres" className="ver-galeria-btn">Ver todos los talleres →</Link>
      </div>
      {ejemplo.talleres && <p className="sample-note">Contenido de ejemplo — se reemplazará con los talleres oficiales.</p>}
    </section>
  )
}
