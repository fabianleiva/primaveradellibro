const PLACEHOLDER_COUNT = 6

export default function FotosPreview() {
  return (
    <section className="fotos-preview-section" id="galeria">
      <img src="/assets/collage/ninos-carta.webp" alt="" aria-hidden="true" className="decor decor-fotos-l" />
      <img src="/assets/collage/flor-azul.webp" alt="" aria-hidden="true" className="decor decor-fotos-r" />
      <h2 className="section-title">Momentos de otras ediciones</h2>
      <p className="section-subtitle">Una probadita de lo que hemos vivido juntos estos 15 años.</p>

      <div className="fotos-preview-grid">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <figure key={i} className="foto-frame">
            <div className="foto-placeholder" />
            <figcaption>Foto próximamente</figcaption>
          </figure>
        ))}
      </div>

      <a href="#galeria" className="ver-galeria-btn">Ver galería completa →</a>
    </section>
  )
}
