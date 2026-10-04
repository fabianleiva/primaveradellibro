import { TALLERES } from '../../../data/talleres.js'

export default function Talleres() {
  return (
    <section className="talleres-section" id="talleres">
      <img src="/assets/collage/flor-rosa.webp" alt="" aria-hidden="true" className="decor decor-talleres-l" />
      <img src="/assets/collage/mujer-lee.webp" alt="" aria-hidden="true" className="decor decor-talleres-r" />
      <h2 className="section-title">Talleres de oficios</h2>
      <p className="section-subtitle">Aprende haciendo: talleres abiertos para toda la familia.</p>

      <div className="talleres-grid">
        {TALLERES.map((t) => (
          <article key={t.titulo} className="taller-card">
            <span className="taller-horario">{t.horario}</span>
            <h3 className="taller-titulo">{t.titulo}</h3>
            <p className="taller-desc">{t.descripcion}</p>
            <span className="taller-cupos">{t.cupos}</span>
          </article>
        ))}
      </div>

      <p className="sample-note">Contenido de ejemplo — se reemplazará con los talleres oficiales.</p>
    </section>
  )
}
