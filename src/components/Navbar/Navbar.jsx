import { useState, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { TICKET_URL } from '../../config.js'
import './Navbar.css'

const TOOLTIP_TEXT = '¡Nos vemos en la feria!'

const LINKS = [
  { to: '/programa', label: 'Programa' },
  { to: '/talleres', label: 'Talleres' },
  { to: '/invitados', label: 'Invitados' },
  { to: '/encuentros-profesionales', label: 'Profesionales' },
  { to: '/galeria', label: 'Galería' },
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
      <Link
        to="/"
        className="logo-wrap"
        aria-label="Ir al inicio"
        onClick={closeMenu}
        onMouseEnter={startTooltipTyping}
        onMouseLeave={stopTooltipTyping}
      >
        <img src="/assets/banner-main.webp" alt="Primavera del Libro" className="logo-idle" />
        <span className="logo-tooltip">
          <span>{tooltipText}</span>
          <span className="intro-cursor" style={{ display: tooltipVisible ? 'inline' : 'none' }}>|</span>
        </span>
      </Link>

      <div className={`nav-links${menuOpen ? ' mobile-open' : ''}`}>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            {link.label}
          </NavLink>
        ))}
        <a href={TICKET_URL} target="_blank" rel="noopener" className="nav-ticket-menu" onClick={closeMenu}>Conseguir ticket</a>
      </div>

      <div className="nav-right">
        <a href={TICKET_URL} target="_blank" rel="noopener" className="nav-ticket">Conseguir ticket</a>

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
