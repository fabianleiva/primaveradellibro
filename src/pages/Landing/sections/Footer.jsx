import { Link } from 'react-router-dom'
import { TICKET_URL } from '../../../config.js'

export default function Footer() {
  return (
    <footer className="site-footer tear" style={{ '--prev-bg': 'var(--crema)' }}>
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/assets/banner-main.webp" alt="Primavera del Libro" className="footer-logo" />
          <p className="footer-title">15ª Primavera del Libro</p>
          <p>Feria de Editoriales de Chile</p>
          <p>9, 10 y 11 de octubre de 2026</p>
        </div>

        <nav className="footer-col" aria-label="Secciones">
          <span className="footer-col-title">Explora</span>
          <Link to="/programa">Programa</Link>
          <Link to="/talleres">Talleres</Link>
          <Link to="/encuentros-profesionales">Encuentros profesionales</Link>
          <Link to="/invitados">Invitados</Link>
          <Link to="/galeria">Galería</Link>
          <a href={TICKET_URL} target="_blank" rel="noopener">Conseguir ticket</a>
        </nav>

        <div className="footer-col">
          <span className="footer-col-title">Visítanos</span>
          <p>Estación Mapocho<br />Bandera 201, Santiago</p>
          <p>Entrada liberada</p>
          <a href="https://www.instagram.com/primaveradellibro/?hl=es" target="_blank" rel="noopener" className="footer-instagram">
            @primaveradellibro
          </a>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Primavera del Libro</p>
    </footer>
  )
}
