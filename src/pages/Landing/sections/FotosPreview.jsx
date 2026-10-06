import { Link } from 'react-router-dom'
import SectionTitle from '../../../components/SectionTitle.jsx'
import { useContenido } from '../../../data/ContenidoContext.jsx'
const PLACEHOLDER_COUNT = 6

export default function FotosPreview() {
  const { galeria } = useContenido()
  const reales = galeria.fotos.filter((f) => f.src).slice(0, PLACEHOLDER_COUNT)
  return (
    <section className="fotos-preview-section tear" id="galeria" style={{ '--prev-bg': '#fff' }}>
      <img src="/assets/collage/ninos-carta.webp" alt="" aria-hidden="true" className="decor decor-fotos-l" />
      <img src="/assets/collage/flor-azul.webp" alt="" aria-hidden="true" className="decor decor-fotos-r" />
      <SectionTitle>Momentos de otras ediciones</SectionTitle>
      <p className="section-subtitle">Una probadita de lo que hemos vivido juntos estos 15 años.</p>

      <div className="fotos-preview-grid">
        {reales.map((f) => (
          <figure key={f.id} className="foto-frame">
            <img className="foto-real" src={f.src} alt={f.titulo} loading="lazy" />
            <figcaption>{f.anio}</figcaption>
          </figure>
        ))}
      </div>

      <Link to="/galeria" className="ver-galeria-btn">Ver galería completa →</Link>
    </section>
  )
}
