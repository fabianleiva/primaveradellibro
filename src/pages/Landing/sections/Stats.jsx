const STATS = [
  { number: '184', label: 'Stands' },
  { number: '90+', label: 'Editoriales' },
  { number: '15', label: 'Años de historia' },
  { number: '3', label: 'Días de feria' },
]

export default function Stats() {
  return (
    <section className="stats-section" id="datos">
      <div className="stats-grid">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-number">{s.number}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="stats-note">*Cifras referenciales — actualizar con los datos definitivos de esta edición.</p>
    </section>
  )
}
