const PETALS = [
  { left: '6%', color: 'var(--rosa)', duration: '16s', delay: '0s' },
  { left: '19%', color: 'var(--verde)', duration: '20s', delay: '4s' },
  { left: '33%', color: 'var(--amarillo)', duration: '18s', delay: '8s' },
  { left: '47%', color: 'var(--rojo)', duration: '22s', delay: '2s' },
  { left: '61%', color: 'var(--azul)', duration: '17s', delay: '10s' },
  { left: '74%', color: 'var(--verde)', duration: '21s', delay: '6s' },
  { left: '87%', color: 'var(--rosa)', duration: '19s', delay: '12s' },
  { left: '95%', color: 'var(--amarillo)', duration: '23s', delay: '3s' },
]

export default function Petals() {
  return (
    <div className="petals-layer" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{ left: p.left, background: p.color, animationDuration: p.duration, animationDelay: p.delay }}
        />
      ))}
    </div>
  )
}
