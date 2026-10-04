import SectionTitle from '../../../components/SectionTitle.jsx'
const GROUPS = [
  { titulo: 'Organiza', logos: [['Logo_EditorialesdeChile', 'Editoriales de Chile']] },
  { titulo: 'Colabora', logos: [['Logo_CajaLosAndes', 'Caja Los Andes']] },
  {
    titulo: 'Apoyan',
    logos: [
      ['Logo_MINCAP', 'Ministerio de las Culturas, las Artes y el Patrimonio'],
      ['Logo_ProChile', 'ProChile'],
      ['Logo_Aquiselee', 'Aquí se lee'],
      ['MT_logotipo_institucional', 'Museo Taller'],
      ['Logo-RS-vertical-2Recurso-2', 'Reciclar es simple'],
    ],
  },
  { titulo: 'Patrocina', logos: [['Logo_EstacionMapocho', 'Estación Mapocho']] },
  {
    titulo: 'Medios asociados',
    logos: [
      ['Logo_Chilevision', 'ChileVisión'],
      ['Logo_T13radio', 'T13 Radio'],
      ['Logo_Neverland', 'Estudios Neverland'],
      ['Logo_ElCiudadano', 'El Ciudadano'],
      ['Logo_LaRata', 'La Rata'],
    ],
  },
  {
    titulo: 'Entrada gratuita en',
    logos: [
      ['Logo_Ticketplus', 'Ticketplus'],
      ['Logo_LengSenas', 'Lengua de señas'],
    ],
  },
]

export default function Sponsors() {
  return (
    <section className="sponsors-section" id="auspiciadores">
      <SectionTitle>Quienes hacen posible la feria</SectionTitle>
      <div className="sponsors-groups">
        {GROUPS.map((g) => (
          <div key={g.titulo} className="sponsor-group">
            <span className="sponsor-group-title">{g.titulo}</span>
            <div className="sponsor-logos">
              {g.logos.map(([file, alt]) => (
                <img key={file} src={`/assets/partners/${file}.webp`} alt={alt} loading="lazy" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
