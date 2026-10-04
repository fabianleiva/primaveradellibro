export default function Footer() {
  return (
    <footer className="site-footer">
      <img src="/assets/banner-main.webp" alt="Primavera del Libro" className="footer-logo" />
      <p className="footer-title">15ª Primavera del Libro</p>
      <p>Feria de Editoriales de Chile · Estación Mapocho · 9, 10 y 11 de octubre de 2026</p>
      <a
        href="https://www.instagram.com/primaveradellibro/?hl=es"
        target="_blank"
        rel="noopener"
        className="footer-instagram"
      >
        @primaveradellibro
      </a>
      <p className="footer-copy">© {new Date().getFullYear()} Primavera del Libro</p>
    </footer>
  )
}
