import SectionTitle from '../../../components/SectionTitle.jsx'

export default function Mapa() {
  return (
    <section className="mapa-section tear" id="ubicacion" style={{ '--prev-bg': 'var(--verde)' }}>
      <SectionTitle>Ubicación</SectionTitle>
      <p className="section-subtitle">Estación Mapocho · Santiago de Chile</p>

      <div className="mapa-content">
        <iframe
          title="Ubicación Estación Mapocho"
          className="mapa-embed"
          src="https://www.google.com/maps?q=Centro+Cultural+Estaci%C3%B3n+Mapocho,+Plaza+de+la+Cultura,+Santiago,+Chile&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="mapa-info">
          <div className="mapa-info-item">
            <strong>Dirección</strong>
            <span>Plaza de la Cultura s/n, ex estación de trenes, Av. Presidente Balmaceda, Santiago</span>
          </div>
          <div className="mapa-info-item">
            <strong>Metro</strong>
            <span>Cal y Canto</span>
          </div>
          <div className="mapa-info-item">
            <strong>Fechas</strong>
            <span>9, 10 y 11 de octubre de 2026</span>
          </div>
          <div className="mapa-info-item">
            <strong>Horario</strong>
            <span>De 11:00 a 21:00 hrs</span>
          </div>
          <div className="mapa-info-item">
            <strong>Entrada</strong>
            <span>Liberada — requiere ticket gratuito</span>
          </div>
        </div>
      </div>
    </section>
  )
}
