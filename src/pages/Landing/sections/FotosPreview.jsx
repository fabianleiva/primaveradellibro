import { Link } from 'react-router-dom'
import SectionTitle from '../../../components/SectionTitle.jsx'
import { useContenido } from '../../../data/ContenidoContext.jsx'
const PLACEHOLDER_COUNT = 6

export default function FotosPreview() {
  const { galeria } = useContenido()
  const todas = galeria.fotos.filter((f) => f.src)
  // fotos de la edición más reciente, repartidas a lo largo de sus tres días
  const recientes = todas.filter((f) => f.anio === todas[0]?.anio)
  const paso = Math.max(1, Math.floor(recientes.length / PLACEHOLDER_COUNT))
  const reales = recientes.length > PLACEHOLDER_COUNT ? Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => recientes[i * paso]) : todas.slice(0, PLACEHOLDER_COUNT)
  return (
    <section className="fotos-preview-section tear" id="galeria" style={{ '--prev-bg': 'var(--crema)' }}>
      <img src="/assets/collage/ninos-carta.webp" alt="" aria-hidden="true" className="decor decor-fotos-l" />
      <img src="/assets/collage/flor-azul.webp" alt="" aria-hidden="true" className="decor decor-fotos-r" />
      <SectionTitle>Así se vivió la 15ª Primavera</SectionTitle>
      <p className="section-subtitle">Tres días de libros y lectores en la Estación Mapocho. Revive la feria y las ediciones anteriores.</p>

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
