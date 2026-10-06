import { PROGRAMA_PDF_URL } from '../config.js'

// Botón para bajar el programa oficial en PDF (el mismo al que apunta el QR impreso)
export default function DescargarPrograma({ className = '' }) {
  return (
    <a className={`descargar-programa ${className}`.trim()} href={PROGRAMA_PDF_URL} target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" />
      </svg>
      Descargar programa (PDF)
    </a>
  )
}
