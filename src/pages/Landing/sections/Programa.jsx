import { Link } from 'react-router-dom'
import SectionTitle from '../../../components/SectionTitle.jsx'
import { useContenido } from '../../../data/ContenidoContext.jsx'

export default function Programa() {
  const { programa: PROGRAMA, ejemplo } = useContenido()
  return (
    <section className="programa-section tear" id="programa" style={{ '--prev-bg': 'var(--crema)' }}>
      <img src="/assets/collage/telefericos.webp" alt="" aria-hidden="true" className="decor decor-programa-r" />
      <img src="/assets/collage/ninos-corren.webp" alt="" aria-hidden="true" className="decor decor-programa-l" />
      <SectionTitle>Programa</SectionTitle>
      <p className="section-subtitle">Tres días de libros, charlas, talleres y música. Algunos destacados:</p>

      <div className="programa-cols">
        {PROGRAMA.map((d) => (
          <div key={d.id} className="programa-col">
            <h3 className="programa-col-titulo">{d.label}</h3>
            <ul className="programa-col-lista">
              {d.eventos.filter((e) => e.destacado).map((e, i) => (
                <li key={i} className="programa-card">
                  <span className="programa-hora">{e.hora}</span>
                  <span className="programa-titulo">{e.titulo}</span>
                  <span className="programa-lugar">{e.lugar}</span>
                  <span className="programa-tipo">{e.tipo}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="ver-mas-wrap">
        <Link to="/programa" className="ver-galeria-btn">Ver programa completo →</Link>
      </div>
      {ejemplo.programa && <p className="sample-note">Contenido de ejemplo — se reemplazará con el programa oficial.</p>}
    </section>
  )
}
