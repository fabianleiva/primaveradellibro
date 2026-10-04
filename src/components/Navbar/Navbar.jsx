import { useState, useRef } from 'react'
import { TICKET_URL } from '../../config.js'
import './Navbar.css'

const TOOLTIP_TEXT = '¡Nos vemos en la feria!'

const LINKS = [
  { href: '#programa', label: 'Programa' },
  { href: '#talleres', label: 'Talleres' },
  { href: '#invitados', label: 'Invitados' },
  { href: '#galeria', label: 'Galería' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tooltipText, setTooltipText] = useState('')
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const tooltipTimeoutsRef = useRef([])

  function startTooltipTyping() {
    tooltipTimeoutsRef.current.forEach(clearTimeout)
    tooltipTimeoutsRef.current = []
    setTooltipVisible(true)
    setTooltipText('')
    TOOLTIP_TEXT.split('').forEach((_, i) => {
      tooltipTimeoutsRef.current.push(
        setTimeout(() => setTooltipText(TOOLTIP_TEXT.slice(0, i + 1)), i * 55),
      )
    })
  }

  function stopTooltipTyping() {
    tooltipTimeoutsRef.current.forEach(clearTimeout)
    tooltipTimeoutsRef.current = []
    setTooltipText('')
    setTooltipVisible(false)
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <nav className="site-nav">
      <div
        className="logo-wrap"
        onMouseEnter={startTooltipTyping}
        onMouseLeave={stopTooltipTyping}
      >
        <img src="/assets/banner-main.webp" alt="Primavera del Libro" className="logo-idle" />
        <span className="logo-tooltip">
          <span>{tooltipText}</span>
          <span className="intro-cursor" style={{ display: tooltipVisible ? 'inline' : 'none' }}>|</span>
        </span>
      </div>

      <div className={`nav-links${menuOpen ? ' mobile-open' : ''}`}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="nav-link" onClick={closeMenu}>
            {link.label}
          </a>
        ))}
        <a href={TICKET_URL} target="_blank" rel="noopener" className="nav-ticket" onClick={closeMenu}>Comprar Ticket</a>
      </div>

      <div className="nav-right">
        <a
          href="https://www.instagram.com/primaveradellibro/?hl=es"
          target="_blank"
          rel="noopener"
          className="siguenos"
          aria-label="Instagram Primavera del Libro"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="2" width="20" height="20" rx="5.5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="1.05" fill="currentColor" stroke="none" />
          </svg>
        </a>

        <button
          type="button"
          className={`hamburger-btn${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
