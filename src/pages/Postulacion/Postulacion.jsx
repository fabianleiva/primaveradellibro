import { useEffect, useRef, useState } from 'react'
import './Postulacion.css'

const INTRO_TEXT = '¡Ya llegó la primavera!'
const TOOLTIP_TEXT = '¡Nos vemos en la feria!'
const CONFETTI_COLORS = ['#80b282', '#c27ba8', '#c76d6d', '#e5ba76', '#85a5c1']

const PETALS = [
  { left: '8%', color: '#c27ba8', duration: '14s', delay: '0s' },
  { left: '22%', color: '#80b282', duration: '18s', delay: '3s' },
  { left: '40%', color: '#e5ba76', duration: '16s', delay: '6s' },
  { left: '58%', color: '#c76d6d', duration: '20s', delay: '1.5s' },
  { left: '74%', color: '#80b282', duration: '15s', delay: '8s' },
  { left: '90%', color: '#c27ba8', duration: '19s', delay: '4.5s' },
]

const FORM_URLS = {
  editoriales: 'https://forms.gle/HAUE8S8koLNeEySc9',
  imprentas: 'https://forms.gle/7MYgvZmM7CvwrJZe8',
}

export default function Postulacion() {
  const [grainReady, setGrainReady] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayHidden, setOverlayHidden] = useState(false)
  const [petalsGo, setPetalsGo] = useState(false)
  const [heroGrainLoaded, setHeroGrainLoaded] = useState(false)
  const [introGrainLoaded, setIntroGrainLoaded] = useState(false)
  const [tooltipText, setTooltipText] = useState('')
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const introStartedRef = useRef(false)
  const timeoutsRef = useRef([])
  const tooltipTimeoutsRef = useRef([])
  const grainBgRef = useRef(null)
  const cursorRef = useRef(null)
  const introGrainImgRef = useRef(null)

  function handleIntroGrainLoad() {
    setIntroGrainLoaded(true)
    setGrainReady(true)
    startIntro()
  }

  useEffect(() => {
    // A cached image can finish loading (and fire 'load') before this effect
    // attaches, before the onLoad prop is wired up, or even before React
    // commits the listener — leaving the intro stuck forever. Cover that by
    // checking the already-resolved state on mount, and add a hard fallback
    // in case the image never resolves at all (slow network, blocked request).
    if (introGrainImgRef.current?.complete) {
      handleIntroGrainLoad()
    }
    const fallback = setTimeout(handleIntroGrainLoad, 1800)
    timeoutsRef.current.push(fallback)

    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
      tooltipTimeoutsRef.current.forEach(clearTimeout)
      tooltipTimeoutsRef.current = []
      // Undo the "already started" mark too — StrictMode's dev-only
      // mount → cleanup → mount cycle can run this synchronously before
      // any timer fires, cancelling the scheduled typing chain. Without
      // resetting this, the surviving mount's startIntro() call sees
      // "already started" and skips scheduling a new one, leaving the
      // intro stuck forever.
      introStartedRef.current = false
    }
  }, [])

  function startIntro() {
    if (introStartedRef.current) return
    introStartedRef.current = true

    let i = 0
    const typeChar = () => {
      if (i <= INTRO_TEXT.length) {
        setTypedText(INTRO_TEXT.slice(0, i))
        i++
        timeoutsRef.current.push(setTimeout(typeChar, 65))
      }
    }
    timeoutsRef.current.push(setTimeout(typeChar, 500))

    const totalTypingTime = 500 + INTRO_TEXT.length * 65
    timeoutsRef.current.push(
      setTimeout(() => {
        setOverlayFading(true)
        setPetalsGo(true)
        timeoutsRef.current.push(setTimeout(() => setOverlayHidden(true), 700))
      }, totalTypingTime + 800),
    )
  }

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

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 48
      const y = (e.clientY / window.innerHeight - 0.5) * 48
      if (grainBgRef.current) {
        grainBgRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`
        cursorRef.current.style.top = `${e.clientY}px`
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

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

  function handleCtaEnter() {
    cursorRef.current?.classList.add('active')
  }
  function handleCtaLeave() {
    cursorRef.current?.classList.remove('active')
  }

  return (
    <div
      className={`postulacion-page pageRoot${petalsGo ? ' petals-go' : ''}`}
      style={{
        height: '100vh',
        width: '100%',
        background: 'transparent',
        fontFamily: "'Nunito Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {!overlayHidden && (
        <div
          className={`introOverlay${grainReady ? ' grain-ready' : ''}${overlayFading ? ' fading' : ''}`}
        >
          <img
            ref={introGrainImgRef}
            src="/assets/paper-grain.jpg"
            alt=""
            className={`grain-img${introGrainLoaded ? ' loaded' : ''}`}
            onLoad={handleIntroGrainLoad}
            onError={handleIntroGrainLoad}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />
          <img
            src="/assets/banner-main.webp"
            alt="Primavera del Libro"
            className="intro-logo"
            style={{
              width: 'clamp(140px, 21vh, 230px)',
              height: 'clamp(140px, 21vh, 230px)',
              position: 'relative',
              zIndex: 1,
            }}
          />
          <div
            className="intro-text"
            style={{
              marginTop: 'clamp(16px, 2.5vh, 28px)',
              fontFamily: "'Special Elite', 'Roboto Slab', serif",
              fontSize: 'clamp(20px, 3.2vh, 34px)',
              color: '#4d4d4d',
              letterSpacing: '0.02em',
              minHeight: '1.2em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span>{typedText}</span>
            <span className="intro-cursor">|</span>
          </div>
        </div>
      )}

      <img
        ref={grainBgRef}
        src="/assets/paper-grain.jpg"
        alt=""
        className={`grain-img${heroGrainLoaded ? ' loaded' : ''}`}
        onLoad={() => setHeroGrainLoaded(true)}
        style={{
          position: 'absolute',
          inset: '-100px',
          width: 'calc(100% + 200px)',
          height: 'calc(100% + 200px)',
          objectFit: 'cover',
          pointerEvents: 'none',
          transition: 'transform 0.2s ease-out',
        }}
      />

      {PETALS.map((petal, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: petal.left,
            background: petal.color,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
          }}
        />
      ))}

      <nav
        className="nav-fade"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(6px, 1vw, 12px) clamp(24px, 3.2vw, 40px) clamp(10px, 1.6vw, 20px)',
          boxSizing: 'border-box',
          flex: '0 0 auto',
          position: 'relative',
          zIndex: 5,
          background: 'transparent',
          borderRadius: '0 0 48px 48px',
        }}
      >
        <div
          className="logo-wrap"
          onMouseEnter={startTooltipTyping}
          onMouseLeave={stopTooltipTyping}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'clamp(90px, 13.4vh, 130px)',
            height: 'clamp(90px, 13.4vh, 130px)',
            marginLeft: 'clamp(-19px, -1.9vh, -13px)',
          }}
        >
          <img
            src="/assets/banner-main.webp"
            alt="Primavera del Libro"
            className="logo-idle"
            style={{ width: 'clamp(64px, 9.5vh, 92px)', height: 'clamp(64px, 9.5vh, 92px)' }}
          />
          <span className="logo-tooltip">
            <span>{tooltipText}</span>
            <span className="intro-cursor" style={{ display: tooltipVisible ? 'inline' : 'none' }}>
              |
            </span>
          </span>
        </div>
        <div className="nav-links">
          <a href="#programa" className="nav-link">Programa</a>
          <a href="#talleres" className="nav-link">Talleres</a>
          <a href="#invitados" className="nav-link">Invitados</a>
          <a href="#galeria" className="nav-link">Galería</a>
          <a href="#comprar-ticket" className="nav-ticket">Comprar Ticket</a>
        </div>
        <a
          href="https://www.instagram.com/primaveradellibro/?hl=es"
          target="_blank"
          rel="noopener"
          className="siguenos"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}
          aria-label="Instagram Primavera del Libro"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="2" width="20" height="20" rx="5.5" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.4" cy="6.6" r="1.05" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </nav>

      <div
        className="contentArea"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(10px, 1.5vh, 16px)',
          boxSizing: 'border-box',
          padding: 'clamp(12px, 2.5vh, 28px) clamp(24px, 6vw, 80px)',
          marginTop: -130,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <img
          src="/assets/banner-nobg.webp"
          alt="15ª Primavera del Libro — Feria de Editoriales 2026"
          className="banner-fadein desktop-hero"
          style={{ width: '100%', maxWidth: 1850, height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
        />

        <div className="mobile-hero banner-fadein">
          <img
            src="/assets/mobile-primavera-titulo.png"
            alt="15ª Primavera del Libro — Feria de Editoriales de Chile"
            style={{ width: '88%', maxWidth: 340, height: 'auto' }}
          />
          <img
            src="/assets/mobile-estacion-mapocho.png"
            alt="9, 10 y 11 de octubre 2026 — Estación Mapocho, Santiago de Chile"
            style={{ width: '82%', maxWidth: 320, height: 'auto' }}
          />
        </div>

        <p
          className="copy-fade"
          style={{
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: 'clamp(13px, 1.7vh, 17px)',
            lineHeight: 1.5,
            color: '#4d4d4d',
            textAlign: 'center',
            maxWidth: 640,
            margin: '-60px 0 0',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '1.15em', display: 'block', marginBottom: '0.5em' }}>
            Este año la primavera cumple 15 años de vida, celebra con nosotros!
          </span>
          Postulaciones abiertas:
        </p>

        <div
          className="postulacion-buttons btns-fade"
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(16px, 2.4vw, 28px)' }}
        >
          <a
            href={FORM_URLS.editoriales}
            target="_blank"
            rel="noopener"
            className="btn-lift"
            onClick={(e) => handleCtaClick(e, FORM_URLS.editoriales)}
            onMouseEnter={handleCtaEnter}
            onMouseLeave={handleCtaLeave}
            style={{ width: 'min(260px, 34vw)', borderRadius: 8, overflow: 'hidden' }}
          >
            <div className="btn-pulse" style={{ borderRadius: 8, overflow: 'hidden' }}>
              <img src="/assets/btn-editoriales-v2.webp" alt="Postulación Editoriales" style={{ width: '100%', display: 'block' }} />
            </div>
          </a>
          <a
            href={FORM_URLS.imprentas}
            target="_blank"
            rel="noopener"
            className="btn-lift"
            onClick={(e) => handleCtaClick(e, FORM_URLS.imprentas)}
            onMouseEnter={handleCtaEnter}
            onMouseLeave={handleCtaLeave}
            style={{ width: 'min(260px, 34vw)', borderRadius: 8, overflow: 'hidden' }}
          >
            <div className="btn-pulse" style={{ borderRadius: 8, overflow: 'hidden', animationDelay: '1.2s' }}>
              <img src="/assets/btn-imprentas-v2.webp" alt="Postulación Imprentas" style={{ width: '100%', display: 'block' }} />
            </div>
          </a>
        </div>

        <p
          className="footer-fade"
          style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 'clamp(11px, 1.2vh, 13px)', color: '#999999', margin: 0, textAlign: 'center' }}
        >
          Cada botón te lleva a un formulario de Google.
        </p>
      </div>

      <div ref={cursorRef} className="custom-cursor">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#c27ba8">
          <circle cx="12" cy="6.5" r="3.4" />
          <circle cx="17.5" cy="12" r="3.4" />
          <circle cx="12" cy="17.5" r="3.4" />
          <circle cx="6.5" cy="12" r="3.4" />
          <circle cx="12" cy="12" r="2.6" fill="#e5ba76" />
        </svg>
      </div>
    </div>
  )
}
