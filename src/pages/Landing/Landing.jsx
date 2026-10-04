import { useEffect, useRef, useState } from 'react'
import Hero from './sections/Hero.jsx'
import Bienvenida from './sections/Bienvenida.jsx'
import TicketBand from './sections/TicketBand.jsx'
import Petals from './sections/Petals.jsx'
import Programa from './sections/Programa.jsx'
import Talleres from './sections/Talleres.jsx'
import Invitados from './sections/Invitados.jsx'
import FotosPreview from './sections/FotosPreview.jsx'
import Mapa from './sections/Mapa.jsx'
import Sponsors from './sections/Sponsors.jsx'

const INTRO_TEXT = '¡Ya llegó la primavera!'

export default function Landing() {
  const [grainReady, setGrainReady] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [overlayFading, setOverlayFading] = useState(false)
  const [overlayHidden, setOverlayHidden] = useState(() => sessionStorage.getItem('pdl-intro-seen') === '1')
  const [introGrainLoaded, setIntroGrainLoaded] = useState(false)

  const introStartedRef = useRef(false)
  const timeoutsRef = useRef([])
  const introGrainImgRef = useRef(null)

  function handleIntroGrainLoad() {
    setIntroGrainLoaded(true)
    setGrainReady(true)
    startIntro()
  }

  useEffect(() => {
    if (overlayHidden) return
    if (introGrainImgRef.current?.complete) {
      handleIntroGrainLoad()
    }
    const fallback = setTimeout(handleIntroGrainLoad, 1800)
    timeoutsRef.current.push(fallback)

    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
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
        sessionStorage.setItem('pdl-intro-seen', '1')
        timeoutsRef.current.push(setTimeout(() => setOverlayHidden(true), 700))
      }, totalTypingTime + 800),
    )
  }

  return (
    <div className="landing-home">
      <Petals />
      {!overlayHidden && (
        <div className={`introOverlay${grainReady ? ' grain-ready' : ''}${overlayFading ? ' fading' : ''}`}>
          <img
            ref={introGrainImgRef}
            src="/assets/fondo-grano.webp"
            alt=""
            className={`grain-img${introGrainLoaded ? ' loaded' : ''}`}
            onLoad={handleIntroGrainLoad}
            onError={handleIntroGrainLoad}
          />
          <img src="/assets/banner-main.webp" alt="Primavera del Libro" className="intro-logo" />
          <div className="intro-text">
            <span>{typedText}</span>
            <span className="intro-cursor">|</span>
          </div>
        </div>
      )}

      <Hero />
      <Bienvenida />
      <Programa />
      <Talleres />
      <Invitados />
      <FotosPreview />
      <TicketBand />
      <Mapa />
      <Sponsors />
    </div>
  )
}
