import { INVITADOS } from '../../../data/invitados.js'

export default function Invitados() {
  return (
    <section className="invitados-section" id="invitados">
      <img src="/assets/collage/pajaritos.webp" alt="" aria-hidden="true" className="decor decor-invitados-l" />
      <img src="/assets/collage/encuentro.webp" alt="" aria-hidden="true" className="decor decor-invitados-r" />
      <h2 className="section-title">Invitados</h2>
      <p className="section-subtitle">Autores, ilustradores y editores que nos acompañan esta edición.</p>

      <div className="invitados-grid">
        {INVITADOS.map((inv, i) => (
          <article key={i} className="invitado-card">
            <div className="invitado-avatar" aria-hidden="true">
              {inv.nombre.charAt(0)}
            </div>
            <h3 className="invitado-nombre">{inv.nombre}</h3>
            <span className="invitado-rol">{inv.rol}</span>
            <span className="invitado-pais">{inv.pais}</span>
          </article>
        ))}
      </div>

      <p className="sample-note">Contenido de ejemplo — se reemplazará con los invitados oficiales.</p>
    </section>
  )
}
