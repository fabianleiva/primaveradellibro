import { Link } from 'react-router-dom'
import SectionTitle from '../../../components/SectionTitle.jsx'
import { PROGRAMA } from '../../../data/programa.js'

const DESTACADOS = PROGRAMA.flatMap((d) =>
  d.eventos.filter((e) => e.destacado).map((e) => ({ ...e, dia: d.corto })),
)

export default function Programa() {
  return (
    <section className="programa-section" id="programa">
      <img src="/assets/collage/telefericos.webp" alt="" aria-hidden="true" className="decor decor-programa-r" />
      <img src="/assets/collage/ninos-corren.webp" alt="" aria-hidden="true" className="decor decor-programa-l" />
      <SectionTitle>Programa</SectionTitle>
      <p className="section-subtitle">Tres días de libros, charlas, talleres y música. Algunos destacados:</p>

      <ul className="programa-list">
        {DESTACADOS.map((e, i) => (
          <li key={i} className="programa-item">
            <div className="programa-cuando">
              <span className="programa-dia">{e.dia}</span>
              <span className="programa-hora">{e.hora}</span>
            </div>
            <div className="programa-detalle">
              <span className="programa-titulo">{e.titulo}</span>
              <span className="programa-lugar">{e.lugar}</span>
            </div>
            <span className="programa-tipo">{e.tipo}</span>
          </li>
        ))}
      </ul>

      <div className="ver-mas-wrap">
        <Link to="/programa" className="ver-galeria-btn">Ver programa completo →</Link>
      </div>
      <p className="sample-note">Contenido de ejemplo — se reemplazará con el programa oficial.</p>
    </section>
  )
}
