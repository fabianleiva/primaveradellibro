import { createContext, useContext, useEffect, useState } from 'react'

// Los datos vienen del CMS (WordPress + ACF). Mientras llegan se muestra "Cargando…" (nunca contenido inventado)
// y la última carga exitosa se guarda en el navegador para que las visitas siguientes aparezcan al instante.
const CMS_URL = import.meta.env.VITE_CMS_URL || 'https://cms.primaveradellibro.cl'

const DIAS = {
  jueves: { label: 'Jueves 8', corto: 'Jue 8' },
  viernes: { label: 'Viernes 9', corto: 'Vie 9' },
  sabado: { label: 'Sábado 10', corto: 'Sáb 10' },
  domingo: { label: 'Domingo 11', corto: 'Dom 11' },
}
const ORDEN_DIAS = ['viernes', 'sabado', 'domingo']
const ORDEN_ENCUENTROS = ['jueves', 'viernes']
const sinEventos = (orden) => orden.map((id) => ({ id, ...DIAS[id], eventos: [] }))

const VACIO = {
  programa: sinEventos(ORDEN_DIAS),
  encuentros: sinEventos(ORDEN_ENCUENTROS),
  talleres: [],
  invitados: [],
  galeria: { anios: [], fotos: [] },
}
const TIPOS = Object.keys(VACIO)
const CLAVE_CACHE = 'pdl-contenido-v1'
const leerCache = () => {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE_CACHE))
    return c && typeof c === 'object' ? c : {}
  } catch {
    return {}
  }
}
const guardarCache = (datos) => {
  try {
    localStorage.setItem(CLAVE_CACHE, JSON.stringify(datos))
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

function texto(html = '') {
  return new DOMParser().parseFromString(html, 'text/html').documentElement.textContent
}

async function leer(ruta, conOrden) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const orden = conOrden ? '&orderby=menu_order&order=asc' : ''
    // El servidor del CMS permite cachear 48 h: la versión cambia cada 5 min para que los cambios se vean pronto
    const version = Math.floor(Date.now() / 300000)
    const url = `${CMS_URL}/wp-json/wp/v2/${ruta}?per_page=100&acf_format=standard${orden}&_fields=id,title,menu_order,acf&v=${version}`
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

const SALAS = ['Escenario principal', 'Sala Acario Cotapos', 'Sala Pedro Prado', 'Sala Transiberiano']
const porSala = (a, b) => {
  const i = SALAS.indexOf(a.lugar)
  const j = SALAS.indexOf(b.lugar)
  return (i < 0 ? 99 : i) - (j < 0 ? 99 : j)
}
const porHora = (a, b) => (a.hora || '').localeCompare(b.hora || '', 'es', { numeric: true })

function armarPrograma(items, orden = ORDEN_DIAS) {
  const eventos = items.map((p) => ({
    hora: p.acf.hora || '',
    titulo: texto(p.title.rendered),
    lugar: p.acf.lugar || '',
    tipo: p.acf.tipo || 'Otro',
    participantes: p.acf.participantes || '',
    organiza: p.acf.organiza || '',
    descripcion: p.acf.descripcion || '',
    destacado: !!p.acf.destacado,
    dia: p.acf.dia,
  }))
  return orden.map((id) => ({
    id,
    ...DIAS[id],
    eventos: eventos.filter((e) => e.dia === id).sort((a, b) => porHora(a, b) || porSala(a, b)),
  }))
}

function armarTalleres(items) {
  return items
    .map((p) => {
      const dia = DIAS[p.acf.dia] || null
      return {
        id: p.id,
        titulo: texto(p.title.rendered),
        descripcion: p.acf.descripcion || '',
        dia: dia ? dia.label : '',
        corto: dia ? dia.corto : '',
        diaOrden: dia ? ORDEN_DIAS.indexOf(p.acf.dia) : -1,
        aCargo: p.acf.a_cargo || '',
        // "Varias veces al día" aplica a todos: se dice una vez en la página, no en cada tarjeta
        cuando: [dia ? dia.corto : '', p.acf.hora && p.acf.hora !== 'Varias veces al día' ? p.acf.hora : ''].filter(Boolean).join(' · '),
        hora: p.acf.hora || '',
        duracion: p.acf.duracion || '',
        lugar: p.acf.lugar || '',
        publico: p.acf.publico || '',
        cupos: p.acf.cupos || '',
        destacado: !!p.acf.destacado,
      }
    })
    .sort((a, b) => a.diaOrden - b.diaOrden || porHora(a, b))
}

function armarInvitados(items) {
  return items.map((p) => ({
    id: p.id,
    nombre: texto(p.title.rendered),
    tipo: p.acf.tipo || 'Otros',
    rol: p.acf.rol || '',
    pais: p.acf.pais || '',
    bio: p.acf.bio || '',
    actividad: p.acf.actividad || '',
    creditoFoto: p.acf.credito_foto || '',
    destacado: !!p.acf.destacado,
    foto: p.acf.foto?.sizes?.medium_large || p.acf.foto?.url || null,
  }))
}

function armarGaleria(items) {
  const ediciones = items
    .map((p) => ({ anio: parseInt(texto(p.title.rendered), 10), id: p.id, fotos: Array.isArray(p.acf.fotos) ? p.acf.fotos : [] }))
    .filter((e) => !Number.isNaN(e.anio) && e.fotos.length > 0) // los años sin fotos no aparecen
    .sort((a, b) => b.anio - a.anio)
  const fotos = ediciones.flatMap((e) =>
    e.fotos.map((f) => ({
      id: `${e.id}-${f.id}`,
      anio: e.anio,
      titulo: `Primavera del Libro ${e.anio}`, // el título de WordPress suele ser el nombre del archivo (DSC0123), no se muestra
      src: f.sizes?.large || f.url,
      ratio: f.width && f.height ? `${f.width} / ${f.height}` : '4 / 3',
    })),
  )
  return { anios: ediciones.map((e) => e.anio), fotos }
}

const Contexto = createContext(null)

export function ContenidoProvider({ children }) {
  const [contenido, setContenido] = useState(() => {
    const cache = leerCache()
    return {
      ...VACIO,
      ...cache,
      cargando: Object.fromEntries(TIPOS.map((t) => [t, !cache[t]])),
      ejemplo: Object.fromEntries(TIPOS.map((t) => [t, false])), // ya no hay contenido de ejemplo
    }
  })

  useEffect(() => {
    let vivo = true
    const cargar = (tipo, ruta, armar, vacio, conOrden = false) =>
      leer(ruta, conOrden).then((items) => {
        if (!vivo) return
        const nuevo = items.length > 0 ? armar(items) : null
        const util = nuevo && !vacio(nuevo)
        if (util) guardarCache({ ...leerCache(), [tipo]: nuevo })
        setContenido((c) => ({ ...c, ...(util ? { [tipo]: nuevo } : {}), cargando: { ...c.cargando, [tipo]: false } }))
      })

    cargar('programa', 'programa', armarPrograma, (d) => d.every((x) => x.eventos.length === 0))
    cargar('encuentros', 'encuentros', (items) => armarPrograma(items, ORDEN_ENCUENTROS), (d) => d.every((x) => x.eventos.length === 0))
    cargar('talleres', 'talleres', armarTalleres, (d) => d.length === 0, true)
    cargar('invitados', 'invitados', armarInvitados, (d) => d.length === 0, true)
    cargar('galeria', 'ediciones', armarGaleria, (d) => d.fotos.length === 0)
    return () => {
      vivo = false
    }
  }, [])

  return <Contexto.Provider value={contenido}>{children}</Contexto.Provider>
}

export function useContenido() {
  return useContext(Contexto)
}
