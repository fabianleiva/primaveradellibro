import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout.jsx'
import Landing from './pages/Landing/Landing.jsx'
import ProgramaPage from './pages/Programa/ProgramaPage.jsx'
import TalleresPage from './pages/Talleres/TalleresPage.jsx'
import InvitadosPage from './pages/Invitados/InvitadosPage.jsx'
import GaleriaPage from './pages/Galeria/GaleriaPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/programa" element={<ProgramaPage />} />
        <Route path="/talleres" element={<TalleresPage />} />
        <Route path="/invitados" element={<InvitadosPage />} />
        <Route path="/galeria" element={<GaleriaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
