import { Link } from 'react-router-dom'

export default function CierreBand() {
  return (
    <section className="ticket-band tear" id="gracias" style={{ '--prev-bg': '#fff' }}>
      <img src="/assets/collage/nina-libro.webp" alt="" aria-hidden="true" className="decor decor-ticket-l" />
      <img src="/assets/collage/madre-hijo.webp" alt="" aria-hidden="true" className="decor decor-ticket-r" />

      <div className="ticket-band-inner">
        <h2 className="ticket-title">¡Gracias por ser parte de la 15ª Primavera del Libro!</h2>
        <p className="ticket-text">
          Fueron tres días de libros, encuentros y lectores en la Estación Mapocho. Nos vemos en la próxima edición.
        </p>
        <Link to="/galeria" className="ticket-btn">
          Ver galería de fotos
        </Link>
        <a
          className="ticket-nota"
          href="https://www.instagram.com/primaveradellibro/?hl=es"
          target="_blank"
          rel="noopener"
        >
          Síguenos en @primaveradellibro
        </a>
      </div>
    </section>
  )
}
