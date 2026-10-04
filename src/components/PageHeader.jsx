import { Link } from 'react-router-dom'
import SectionTitle from './SectionTitle.jsx'

export default function PageHeader({ title, subtitle }) {
  return (
    <>
      <Link to="/" className="volver-link">← Volver al inicio</Link>
      <SectionTitle>{title}</SectionTitle>
      <p className="section-subtitle">{subtitle}</p>
    </>
  )
}
