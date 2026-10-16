import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sponsors from '../pages/Landing/sections/Sponsors.jsx'
import Navbar from '../components/Navbar/Navbar.jsx'
import Footer from '../pages/Landing/sections/Footer.jsx'
import '../pages/Landing/Landing.css'

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    let tries = 0
    const timer = setInterval(() => {
      const el = document.getElementById(id)
      tries += 1
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        clearInterval(timer)
      } else if (tries > 20) {
        clearInterval(timer)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [pathname, hash])

  return null
}

// Páginas con fondo crema; las demás son blancas (de ahí sale el color del borde rasgado de los logos)
const FONDO_CREMA = ['/talleres', '/invitados']

export default function SiteLayout() {
  const { pathname } = useLocation()
  const esPortada = pathname === '/'
  return (
    <div className="site-root">
      <ScrollManager />
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!esPortada && <Sponsors prev={FONDO_CREMA.includes(pathname) ? 'var(--crema)' : '#fff'} />}
      <Footer />
    </div>
  )
}
