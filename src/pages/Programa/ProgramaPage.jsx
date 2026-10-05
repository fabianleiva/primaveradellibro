import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import { useContenido } from '../../data/ContenidoContext.jsx'

// El filtro agrupa los tipos de la hoja en pocas categorías; cada ficha sigue mostrando su tipo original.
const CATEGORIAS = ['Lanzamientos', 'Conversaciones', 'Infantil y familiar', 'Talleres', 'Shows y ceremonias', 'Otros']

function categoria(tipo = '') {
  const t = tipo.toLowerCase()
  if (/cuentacuentos|infantil|familiar/.test(t)) return 'Infantil y familiar'
  if (/taller/.test(t)) return 'Talleres'
  if (/lanzamiento|presentaci/.test(t)) return 'Lanzamientos'
  if (/show|inauguraci|ceremonia|m[uú]sica|concierto/.test(t)) return 'Shows y ceremonias'
  if (/conversaci|entrevista|encuentro|lectura|charla|mesa|panel/.test(t)) return 'Conversaciones'
  return 'Otros'
}

export default function ProgramaPage() {
  const { programa: PROGRAMA, ejemplo } = useContenido()
  const TIPOS = useMemo(() => {
    const presentes = new Set(PROGRAMA.flatMap((d) => d.eventos.map((e) => categoria(e.tipo))))
    return ['Todos', ...CATEGORIAS.filter((c) => presentes.has(c))]
  }, [PROGRAMA])
  const [diaId, setDiaId] = useState(PROGRAMA[0].id)
  const [tipo, setTipo] = useState('Todos')

  const dia = PROGRAMA.find((d) => d.id === diaId)
  const eventos = useMemo(
    () => dia.eventos.filter((e) => tipo === 'Todos' || categoria(e.tipo) === tipo),
    [dia, tipo],
  )

  return (
    <section className="page-section programa-page">
      <img src="/assets/collage/telefericos.webp" alt="" aria-hidden="true" className="decor decor-programa-r" />
      <img src="/assets/collage/ninos-corren.webp" alt="" aria-hidden="true" className="decor decor-programa-l" />

      <PageHeader title="Programa" subtitle="9, 10 y 11 de octubre · Estación Mapocho · Entrada liberada" />

      <p className="aviso-cruzado">
        Además de este programa, hay <strong>talleres de oficios</strong> abiertos durante la feria. <Link to="/talleres">Ver talleres →</Link>
        <br />
        Los <strong>encuentros profesionales</strong> (jueves 8 y viernes 9) tienen su propia página. <Link to="/encuentros-profesionales">Ver encuentros →</Link>
      </p>

      <div className="programa-tabs" role="tablist" aria-label="Día">
        {PROGRAMA.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === diaId}
            className={`programa-tab${d.id === diaId ? ' active' : ''}`}
            onClick={() => setDiaId(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="tipo-filtros" aria-label="Filtrar por tipo de actividad">
        {TIPOS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tipo-chip${t === tipo ? ' active' : ''}`}
            aria-pressed={t === tipo}
            onClick={() => setTipo(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="programa-list">
        {eventos.length === 0 && <li className="programa-vacio">No hay actividades de este tipo este día.</li>}
        {eventos.map((e, i) => (
          <li key={`${diaId}-${i}`} className="programa-item">
            <div className="programa-cuando">
              <span className="programa-hora">{e.hora}</span>
            </div>
            <div className="programa-detalle">
              <span className="programa-titulo">{e.titulo}</span>
              {e.participantes && <span className="programa-participantes">{e.participantes}</span>}
              <span className="programa-lugar">{e.lugar}</span>
              {e.descripcion && <span className="programa-descripcion">{e.descripcion}</span>}
            </div>
            <span className="programa-tipo">{e.tipo}</span>
          </li>
        ))}
      </ul>

      {ejemplo.programa && <p className="sample-note">Contenido de ejemplo — se reemplazará con el programa oficial.</p>}
    </section>
  )
}
