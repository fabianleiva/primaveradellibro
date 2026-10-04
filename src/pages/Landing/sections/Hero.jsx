import { TICKET_URL } from '../../../config.js'

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-art">
        <picture>
          <source media="(max-width: 700px)" srcSet="/assets/hero-mobile.webp" />
          <img
            src="/assets/hero-desktop.webp"
            alt="15ª Primavera del Libro, Feria de Editoriales de Chile. Estación Mapocho, 9, 10 y 11 de octubre de 2026. Entrada liberada."
            className="hero-img"
            fetchPriority="high"
          />
        </picture>
        <a href={TICKET_URL} target="_blank" rel="noopener" className="hero-cta">
          Conseguir ticket
        </a>
      </div>
    </section>
  )
}
