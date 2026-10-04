import Stats from './Stats.jsx'

export default function Bienvenida() {
  return (
    <section className="bienvenida-section tear" id="bienvenida">
      <img src="/assets/collage/nina-libro.webp" alt="" aria-hidden="true" className="decor decor-bienvenida-l" />
      <img src="/assets/collage/abuelo-arco.webp" alt="" aria-hidden="true" className="decor decor-bienvenida-r" />

      <p className="bienvenida-eyebrow">9, 10 y 11 de octubre · Estación Mapocho</p>
      <p className="bienvenida-texto">
        La Primavera del Libro celebra sus <mark className="mark-azul">15 años de vida</mark> y se toma la{' '}
        <mark className="mark-verde">Estación Mapocho</mark> para encontrarse con su público lector durante{' '}
        <mark className="mark-amarillo">tres días</mark>!
      </p>

      <Stats />
    </section>
  )
}
