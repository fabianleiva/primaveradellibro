const PLACEHOLDER_COUNT = 6

export default function FotosPreview() {
  return (
    <section className="fotos-preview-section">
      <h2 className="section-title">Momentos de otras ediciones</h2>
      <p className="section-subtitle">Una probadita de lo que hemos vivido juntos estos 15 años.</p>

      <div className="fotos-preview-grid">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div key={i} className="foto-placeholder">
            <span>Foto próximamente</span>
          </div>
        ))}
      </div>

      <a href="#galeria" className="ver-galeria-btn">Ver galería completa →</a>
    </section>
  )
}
