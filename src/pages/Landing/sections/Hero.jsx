export default function Hero() {
  return (
    <section className="hero-section">
      <img src="/assets/fondo-grano.webp" alt="" className="hero-grain" aria-hidden="true" />
      <div className="hero-inner">
        <img
          src="/assets/hero-banner.webp"
          alt="15ª Primavera del Libro — Feria de Editoriales de Chile. Estación Mapocho, 9, 10 y 11 de octubre de 2026. Entrada liberada."
          className="hero-banner-img"
        />
        <a href="#comprar-ticket" className="hero-ticket-btn">
          Conseguir Ticket
        </a>
      </div>
    </section>
  )
}
