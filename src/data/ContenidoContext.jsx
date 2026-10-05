import { createContext, useContext, useEffect, useState } from 'react'
import { PROGRAMA as PROGRAMA_EJEMPLO } from './programa.js'
import { TALLERES as TALLERES_EJEMPLO } from './talleres.js'
import { INVITADOS as INVITADOS_EJEMPLO } from './invitados.js'
import { ANIOS as ANIOS_EJEMPLO, FOTOS as FOTOS_EJEMPLO } from './galeria.js'

// Los datos vienen del CMS (WordPress + ACF). Mientras el CMS no tenga contenido
// publicado de un tipo, se muestra el contenido de ejemplo de src/data/*.js.
const CMS_URL = import.meta.env.VITE_CMS_URL || 'https://cms.primaveradellibro.cl'

const DIAS = {
  viernes: { label: 'Viernes 9', corto: 'Vie 9' },
  sabado: { label: 'Sábado 10', corto: 'Sáb 10' },
  domingo: { label: 'Domingo 11', corto: 'Dom 11' },
}
const ORDEN_DIAS = Object.keys(DIAS)

const EJEMPLO = {
  programa: PROGRAMA_EJEMPLO,
  talleres: TALLERES_EJEMPLO,
  invitados: INVITADOS_EJEMPLO,
  galeria: { anios: ANIOS_EJEMPLO, fotos: FOTOS_EJEMPLO },
}

function texto(html = '') {
  return new DOMParser().parseFromString(html, 'text/html').documentElement.textContent
}

async function leer(ruta) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const url = `${CMS_URL}/wp-json/wp/v2/${ruta}?per_page=100&acf_format=standard&orderby=menu_order&order=asc&_fields=id,title,menu_order,acf`
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

const porHora = (a, b) => (a.hora || '').localeCompare(b.hora || '', 'es', { numeric: true })

function armarPrograma(items) {
  const eventos = items.map((p) => ({
    hora: p.acf.hora || '',
    titulo: texto(p.title.rendered),
    lugar: p.acf.lugar || '',
    tipo: p.acf.tipo || 'Otro',
    destacado: !!p.acf.destacado,
    dia: p.acf.dia,
  }))
  return ORDEN_DIAS.map((id) => ({
    id,
    ...DIAS[id],
    eventos: eventos.filter((e) => e.dia === id).sort(porHora),
  }))
}

function armarTalleres(items) {
  return items
    .map((p) => {
      const dia = DIAS[p.acf.dia] || DIAS.viernes
      return {
        id: p.id,
        titulo: texto(p.title.rendered),
        descripcion: p.acf.descripcion || '',
        dia: dia.label,
        corto: dia.corto,
        diaOrden: ORDEN_DIAS.indexOf(p.acf.dia),
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
    destacado: !!p.acf.destacado,
    foto: p.acf.foto?.sizes?.medium_large || p.acf.foto?.url || null,
  }))
}

function armarGaleria(items) {
  const ediciones = items
    .map((p) => ({ anio: parseInt(texto(p.title.rendered), 10), id: p.id, fotos: Array.isArray(p.acf.fotos) ? p.acf.fotos : [] }))
    .filter((e) => !Number.isNaN(e.anio))
    .sort((a, b) => b.anio - a.anio)
  const fotos = ediciones.flatMap((e) =>
    e.fotos.map((f) => ({
      id: `${e.id}-${f.id}`,
      anio: e.anio,
      titulo: f.alt || f.title || `Primavera del Libro ${e.anio}`,
      src: f.sizes?.large || f.url,
      ratio: f.width && f.height ? `${f.width} / ${f.height}` : '4 / 3',
    })),
  )
  return { anios: ediciones.map((e) => e.anio), fotos }
}

const Contexto = createContext(null)

export function ContenidoProvider({ children }) {
  const [contenido, setContenido] = useState({ ...EJEMPLO, ejemplo: { programa: true, talleres: true, invitados: true, galeria: true } })

  useEffect(() => {
    let vivo = true
    const cargar = (tipo, ruta, armar, vacio) =>
      leer(ruta).then((items) => {
        if (!vivo || items.length === 0) return
        const nuevo = armar(items)
        if (vacio(nuevo)) return
        setContenido((c) => ({ ...c, [tipo]: nuevo, ejemplo: { ...c.ejemplo, [tipo]: false } }))
      })

    cargar('programa', 'programa', armarPrograma, (d) => d.every((x) => x.eventos.length === 0))
    cargar('talleres', 'talleres', armarTalleres, (d) => d.length === 0)
    cargar('invitados', 'invitados', armarInvitados, (d) => d.length === 0)
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
