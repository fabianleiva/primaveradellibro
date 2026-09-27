import { useRef } from 'react'

const CONFETTI_COLORS = ['#80b282', '#c27ba8', '#c76d6d', '#e5ba76', '#85a5c1']

const FORM_URLS = {
  editoriales: 'https://forms.gle/HAUE8S8koLNeEySc9',
  imprentas: 'https://forms.gle/7MYgvZmM7CvwrJZe8',
}

export default function PostulacionSection() {
  const cursorRef = useRef(null)

  function handleCtaClick(e, url) {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    for (let i = 0; i < 26; i++) {
      const piece = document.createElement('div')
      const size = 6 + Math.random() * 6
      piece.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};pointer-events:none;z-index:999;`
      document.body.appendChild(piece)
      const angle = Math.random() * Math.PI * 2
      const dist = 80 + Math.random() * 140
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist - 40
      const rot = Math.random() * 720 - 360
      piece.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(0.25, 0.8, 0.4, 1)' },
      )
      setTimeout(() => piece.remove(), 1400)
    }
    setTimeout(() => window.open(url, '_blank', 'noopener'), 550)
    return false
  }

  return (
    <section className="postulacion-section" id="postulacion">
      <h2 className="section-title">Postulaciones abiertas</h2>
      <p className="postulacion-copy">
        Este año la primavera cumple 15 años de vida, ¡celebra con nosotros!
      </p>

      <div className="postulacion-buttons">
        <a
          href={FORM_URLS.editoriales}
          target="_blank"
          rel="noopener"
          className="btn-lift"
          onClick={(e) => handleCtaClick(e, FORM_URLS.editoriales)}
        >
          <div className="btn-pulse">
            <img src="/assets/btn-editoriales-v2.webp" alt="Postulación Editoriales" />
          </div>
        </a>
        <a
          href={FORM_URLS.imprentas}
          target="_blank"
          rel="noopener"
          className="btn-lift"
          onClick={(e) => handleCtaClick(e, FORM_URLS.imprentas)}
        >
          <div className="btn-pulse" style={{ animationDelay: '1.2s' }}>
            <img src="/assets/btn-imprentas-v2.webp" alt="Postulación Imprentas" />
          </div>
        </a>
      </div>

      <p className="postulacion-footnote">Cada botón te lleva a un formulario de Google.</p>
      <div ref={cursorRef} />
    </section>
  )
}
