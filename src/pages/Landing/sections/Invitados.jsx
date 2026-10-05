import { Link } from 'react-router-dom'
import SectionTitle from '../../../components/SectionTitle.jsx'
import { useContenido } from '../../../data/ContenidoContext.jsx'

export default function Invitados() {
  const { invitados: INVITADOS, ejemplo } = useContenido()
  const destacados = INVITADOS.filter((i) => i.destacado)

  return (
    <section className="invitados-section tear" id="invitados" style={{ '--prev-bg': 'var(--crema)' }}>
      <img src="/assets/collage/pajaritos.webp" alt="" aria-hidden="true" className="decor decor-invitados-l" />
      <img src="/assets/collage/encuentro.webp" alt="" aria-hidden="true" className="decor decor-invitados-r" />
      <SectionTitle>Invitados</SectionTitle>
      <p className="section-subtitle">Autores, ilustradores y editores que nos acompañan esta edición.</p>

      <div className="invitados-grid">
        {destacados.map((inv) => (
          <article key={inv.id} className="invitado-card">
            {inv.foto
              ? <img className="invitado-avatar invitado-avatar-foto" src={inv.foto} alt="" loading="lazy" />
              : <div className="invitado-avatar" aria-hidden="true">{inv.nombre.charAt(0)}</div>}
            <h3 className="invitado-nombre">{inv.nombre}</h3>
            <span className="invitado-rol">{inv.rol}</span>
            <span className="invitado-pais">{inv.pais}</span>
          </article>
        ))}
      </div>

      <div className="ver-mas-wrap">
        <Link to="/invitados" className="ver-galeria-btn">Ver todos los invitados →</Link>
      </div>
      {ejemplo.invitados && <p className="sample-note">Contenido de ejemplo — se reemplazará con los invitados oficiales.</p>}
    </section>
  )
}
