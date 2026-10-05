import { useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import { useContenido } from '../../data/ContenidoContext.jsx'

export default function InvitadosPage() {
  const { invitados: INVITADOS, ejemplo } = useContenido()
  const TIPOS = ['Todos', ...Array.from(new Set(INVITADOS.map((i) => i.tipo)))]
  const [tipo, setTipo] = useState('Todos')
  const invitados = INVITADOS.filter((i) => tipo === 'Todos' || i.tipo === tipo)

  return (
    <section className="page-section invitados-page">
      <PageHeader title="Invitados" subtitle="Autores, poetas, ilustradores y editores de Chile y del mundo." />

      <div className="tipo-filtros" aria-label="Filtrar por tipo de invitado">
        {TIPOS.map((t) => (
          <button key={t} type="button" className={`tipo-chip${t === tipo ? ' active' : ''}`} aria-pressed={t === tipo} onClick={() => setTipo(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="invitados-grid invitados-grid-page">
        {invitados.map((inv, i) => (
          <article key={inv.id} className="invitado-card invitado-card-full">
            {inv.foto
              ? <img className="invitado-avatar invitado-avatar-foto" src={inv.foto} alt="" loading="lazy" />
              : <div className="invitado-avatar" aria-hidden="true">{inv.nombre.charAt(0)}</div>}
            <h3 className="invitado-nombre">{inv.nombre}</h3>
            <span className="invitado-rol">{inv.rol}</span>
            <span className="invitado-pais">{inv.pais}</span>
            <p className="invitado-bio">{inv.bio}</p>
            <span className="invitado-actividad">{inv.actividad}</span>
          </article>
        ))}
      </div>

      {ejemplo.invitados && <p className="sample-note">Contenido de ejemplo — se reemplazará con los invitados oficiales.</p>}
    </section>
  )
}
