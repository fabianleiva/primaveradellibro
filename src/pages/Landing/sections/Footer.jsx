export default function Footer() {
  return (
    <footer className="site-footer">
      <img src="/assets/banner-main.webp" alt="Primavera del Libro" className="footer-logo" />
      <p>15ª Primavera del Libro — Feria de Editoriales de Chile</p>
      <a
        href="https://www.instagram.com/primaveradellibro/?hl=es"
        target="_blank"
        rel="noopener"
        className="footer-instagram"
      >
        @primaveradellibro
      </a>
      <p className="footer-copy">© {new Date().getFullYear()} Primavera del Libro. Todos los derechos reservados.</p>
    </footer>
  )
}
