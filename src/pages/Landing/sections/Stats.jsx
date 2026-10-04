import CountUp from '../../../components/reactbits/CountUp.jsx'

const STATS = [
  { number: 181, label: 'Stands', color: 'var(--rojo)' },
  { number: 214, label: 'Editoriales', color: 'var(--azul)' },
  { number: 15, label: 'Años de historia', color: 'var(--verde)' },
  { number: 3, label: 'Días de feria', color: 'var(--rosa)' },
]

export default function Stats() {
  return (
    <section className="stats-section" id="datos">
      <img src="/assets/collage/flor-roja.webp" alt="" aria-hidden="true" className="decor decor-stats-l" />
      <img src="/assets/collage/flor-azul.webp" alt="" aria-hidden="true" className="decor decor-stats-r" />
      <div className="stats-grid">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-number" style={{ color: s.color }}>
              <CountUp to={s.number} duration={2} />
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
