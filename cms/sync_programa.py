#!/usr/bin/env python3
"""Sincroniza la hoja de cálculo con WordPress: Programa, Encuentros profesionales, Talleres e Invitados.

La hoja es la fuente de verdad. Programa = pestaña "Copia de TODO" (sin las actividades
de tipo "Encuentros Profesionales"). Encuentros profesionales = pestaña "Encuentros
profesionales" + las actividades de ese tipo que estén en "Copia de TODO".
La columna "Contacto" (correos) NUNCA se publica.

Uso:
  python3 cms/sync_programa.py                 # simulación: solo muestra qué haría
  python3 cms/sync_programa.py --apply         # crea/actualiza como borrador
  python3 cms/sync_programa.py --apply --publish
  python3 cms/sync_programa.py --file ruta.xlsx   # usar un .xlsx local

Credenciales: WP_URL, WP_USER y WP_APP_PASSWORD en .env.local (no se sube a git).
Requiere: pip install openpyxl
"""
import argparse
import base64
import datetime
import json
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import openpyxl

RAIZ = Path(__file__).resolve().parent.parent
SHEET_ID = '1Je5tgR_sDFv7Zd0i2tzhHJ1syZ-IzNs3'
SHEET_INVITADOS_ID = '1FeyEWxjHBwFoVBjVr7DfbtwcxYr6jqgM6-cxwD2mCOQ'
PESTANA_INVITADOS = 'Hoja 1'
PESTANA = 'Copia de TODO'
PESTANA_ENCUENTROS = 'Encuentros profesionales'
PESTANA_TALLERES = 'Descripción de talleres'
# Destacados en la portada: solo se marcan al crear el taller; después se editan en WordPress.
TALLERES_DESTACADOS = {'imprenta de bolsillo', 'florecer', 'collage literario', 'escribir bordando, bordar escribiendo'}
LUGARES = {'principal': 'Escenario principal', 'transiberiano': 'Sala Transiberiano', 'acario cotapos': 'Sala Acario Cotapos', 'camilo mori': 'Sala Camilo Mori'}
DIAS = {'viernes': 'viernes', 'sábado': 'sabado', 'sabado': 'sabado', 'domingo': 'domingo', 'jueves': 'jueves'}


def leer_env():
    env = {}
    for linea in (RAIZ / '.env.local').read_text().splitlines():
        if '=' in linea and not linea.startswith('#'):
            k, v = linea.split('=', 1)
            env[k.strip()] = v.strip().strip('"')
    return env


def descargar_xlsx(sheet_id=SHEET_ID, nombre='programa_pdl'):
    url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=xlsx'
    destino = Path(f'/tmp/{nombre}.xlsx')
    with urllib.request.urlopen(url, timeout=60) as r:
        destino.write_bytes(r.read())
    return destino


def limpio(valor):
    return re.sub(r'\s+', ' ', str(valor)).strip() if valor is not None else ''


def slug(texto):
    t = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def separar_cupos(tipo, descripcion):
    """'Taller (20 cupos)' -> tipo 'Taller' y 'Cupos: 20.' al final de la descripción."""
    m = re.search(r'\(([^)]*cupos?[^)]*)\)', tipo, re.I)
    if not m:
        return tipo, descripcion
    n = re.search(r'\d+', m.group(1))
    nota = f"Cupos: {n.group(0)}." if n else f"{m.group(1).strip().capitalize()}."
    return limpio(tipo.replace(m.group(0), '')), limpio(f'{descripcion} {nota}')


# --- Correcciones recibidas por correo (Andrea Palet, lunes 5 de octubre de 2026) ---
# Se aplican siempre al leer la hoja, para que una nueva sincronización no las deshaga.
# Si los organizadores corrigen la hoja y la fila ya no coincide con (día, hora, título), la corrección no hace nada.
QUITAR = [  # (día, hora, inicio del título)
    ('viernes', '13:00', '¿Cómo contar nuestros mitos?'),
    ('viernes', '19:00', 'Mirko Jozic'),
    ('domingo', '11:00', 'Cuentacuentos cantados'),  # el de las 15:00 se mantiene
]
CAMBIAR_PROGRAMA = [  # (día, hora, inicio del título, cambios)
    ('viernes', '16:00', 'Don Francisco', {'titulo': 'Don Francisco, historia de un intocable, de Laura Landaeta', 'hora': '19:00', 'lugar': 'Sala Camilo Mori'}),
    ('viernes', '19:00', 'Prenderse fuego', {'lugar': 'Sala Transiberiano', 'organiza': 'Primavera del Libro'}),
    ('viernes', '19:00', 'Don Francisco', {'titulo': 'Don Francisco, historia de un intocable, de Laura Landaeta'}),  # la hoja ya lo movió a las 19:00 pero conserva el título anterior
    ('sabado', '19:00', 'Divulgación y ciencias sociales', {'participantes_quitar': 'Isidora Sesnic'}),
    ('viernes', '17:00', 'La envoltura de los libros', {'tipo': 'Conversación', 'descripcion_reemplazar': ('Conversatorio', 'Conversación')}),  # Andrea: "Conversación"
    # Andrea Palet, 6 de octubre: descripción más corta
    ('sabado', '17:00', 'Hablemos de mujeres pioneras', {'descripcion': 'Encuentro donde la investigación dialogará con una experiencia artística y patrimonial en torno a la identidad porteña. Con la participación de la presidenta de la Sociedad Mutualista de Mujeres Obreras.'}),
    # Del PDF "Programa general_PDL26" (prima sobre la hoja; los correos de Andrea prima sobre el PDF)
    ('viernes', '19:00', 'Don Francisco', {'organiza': 'Ceibo'}),
    ('viernes', '20:00', 'Cancamusa', {'tipo': 'Show musical'}),
    ('sabado', '16:00', 'Nueva estación', {'tipo': 'Lanzamiento'}),
    ('sabado', '19:00', 'Cómo estamos leyendo', {'titulo': 'Cómo estamos leyendo. La violencia de la comprensión, con Cynthia Rimsky'}),
]
CAMBIAR_ENCUENTROS = [
    ('jueves', '16:00', 'Taller de podcast literario', {'participantes_quitar': 'Plan LEO'}),
    ('viernes', '17:00', 'La envoltura de los libros', {'tipo': 'Conversación', 'descripcion_reemplazar': ('Conversatorio', 'Conversación')}),
    ('viernes', '15:00', 'Publicar a un Nobel', {'tipo': 'Entrevista'}),
]
ENCUENTROS_FORZADOS = []  # (vacío) actividades que van a Encuentros profesionales aunque la hoja diga otra cosa
PROGRAMA_FORZADOS = ['La envoltura de los libros']  # van al programa general aunque la hoja las marque como Encuentros Profesionales (decisión del 6 oct)
ACTIVIDAD_INVITADOS = {  # nombre -> actividad (corrección del correo "En invitados internacionales")
    'pablo-katchadjian': 'Sábado 10 · 19:00 · Cómo estamos leyendo. La violencia de la comprensión',
    'dolores-gil': 'Sábado 10 · 18:00 · Escribir lo que se perdió',
    'cynthia-rimsky': 'Sábado 10 · 19:00 · Cómo estamos leyendo. La violencia de la comprensión',  # sin el ", con Cynthia Rimsky" del título del programa
}


def _coincide(e, dia, hora, inicio):
    return e['acf']['dia'] == dia and e['acf']['hora'] == hora and slug(e['titulo']).startswith(slug(inicio))


def aplicar_correcciones(eventos, quitar=(), cambiar=()):
    eventos = [e for e in eventos if not any(_coincide(e, *q) for q in quitar)]
    for dia, hora, inicio, cambios in cambiar:
        for e in eventos:
            if not _coincide(e, dia, hora, inicio):
                continue
            a = e['acf']
            if 'titulo' in cambios:
                e['titulo'] = cambios['titulo']
            for k in ('hora', 'lugar', 'tipo', 'organiza', 'descripcion'):
                if k in cambios:
                    a[k] = cambios[k]
            if 'participantes_quitar' in cambios:
                a['participantes'] = re.sub(r',\s*,', ',', a['participantes'].replace(cambios['participantes_quitar'], '')).strip(' ,')
            if 'descripcion_reemplazar' in cambios:
                a['descripcion'] = a['descripcion'].replace(*cambios['descripcion_reemplazar'])
            if any(k in cambios for k in ('titulo', 'hora', 'lugar')):  # la clave depende de estos datos
                e['clave'] = a['clave'] = slug(f"{a['dia']}-{a['hora']}-{a['lugar']}-{e['titulo']}")[:120]
    return eventos


def es_encuentro(tipo):
    return 'encuentros profesionales' in tipo.lower()


def hora_texto(v):
    return v.strftime('%H:%M') if isinstance(v, (datetime.time, datetime.datetime)) else limpio(v)


def leer_programa(ruta, solo_encuentros=False):
    ws = openpyxl.load_workbook(ruta, data_only=True)[PESTANA]
    filas = list(ws.iter_rows(values_only=True))
    cab = next(i for i, f in enumerate(filas) if f[2] == 'Lugar')
    eventos, vistas = [], {}
    for f in filas[cab + 1:]:
        dia = DIAS.get(limpio(f[0]).lower())
        nombre = limpio(f[4])
        if not dia or not nombre:
            continue
        forzado = any(slug(nombre).startswith(slug(x)) for x in ENCUENTROS_FORZADOS)
        en_programa = any(slug(nombre).startswith(slug(x)) for x in PROGRAMA_FORZADOS)
        if ((es_encuentro(limpio(f[3])) and not en_programa) or forzado) != solo_encuentros:
            continue
        hora = hora_texto(f[1])
        clave = slug(f'{dia}-{hora}-{limpio(f[2])}-{nombre}')[:120]
        vistas[clave] = vistas.get(clave, 0) + 1
        if vistas[clave] > 1:
            clave = f'{clave}-{vistas[clave]}'
        tipo, descripcion = separar_cupos(
            limpio(f[3]),
            limpio(f[7]) or ('Inauguración de la feria' if limpio(f[3]).lower().startswith('inauguraci') else ''))
        eventos.append({
            'titulo': nombre,
            'clave': clave,
            'acf': {
                'dia': dia,
                'hora': hora,
                'lugar': limpio(f[2]),
                'tipo': tipo,
                'participantes': limpio(f[5]),
                'organiza': limpio(f[6]),
                'descripcion': descripcion,
                'clave': clave,
            },
        })
    if solo_encuentros:
        return eventos
    return aplicar_correcciones(eventos, QUITAR, CAMBIAR_PROGRAMA)


def leer_encuentros(ruta):
    """Pestaña 'Encuentros profesionales' (bloques por día) + actividades de ese tipo del programa."""
    ws = openpyxl.load_workbook(ruta, data_only=True)[PESTANA_ENCUENTROS]
    eventos, dia, vistos = [], None, set()
    for f in ws.iter_rows(values_only=True):
        etiqueta = limpio(f[0]).lower()
        if etiqueta in DIAS and not any(limpio(c) for c in f[1:]):
            dia = DIAS[etiqueta]
            continue
        nombre = limpio(f[3])
        if not dia or not nombre or not isinstance(f[0], (datetime.time, datetime.datetime)):
            continue
        hora = hora_texto(f[0])
        lugar = LUGARES.get(limpio(f[1]).lower(), limpio(f[1]))
        clave = slug(f'{dia}-{hora}-{lugar}-{nombre}')[:120]
        vistos.add((dia, slug(nombre)))
        tipo, descripcion = separar_cupos(limpio(f[2]), limpio(f[5]))
        eventos.append({'titulo': nombre, 'clave': clave, 'acf': {
            'dia': dia, 'hora': hora, 'lugar': lugar, 'tipo': tipo,
            'participantes': limpio(f[4]), 'organiza': '', 'descripcion': descripcion, 'clave': clave}})
    for e in leer_programa(ruta, solo_encuentros=True):
        if (e['acf']['dia'], slug(e['titulo'])) not in vistos:
            eventos.append(e)
    return aplicar_correcciones(eventos, (), CAMBIAR_ENCUENTROS)


def leer_talleres(ruta):
    """Pestaña 'Descripción de talleres'. No trae día ni hora: por ahora se asume que se repiten varias veces al día."""
    ws = openpyxl.load_workbook(ruta, data_only=True)[PESTANA_TALLERES]
    talleres = []
    for f in list(ws.iter_rows(values_only=True))[1:]:
        nombre = limpio(f[0])
        if not nombre:
            continue
        dur = f[3]
        duracion = f"{int(dur)} min" if isinstance(dur, (int, float)) else (f"{int(float(dur))} min" if re.fullmatch(r'\d+(\.0+)?', limpio(dur)) else limpio(dur))
        clave = slug(nombre)
        talleres.append({
            'titulo': nombre,
            'clave': clave,
            'acf_nuevo': {'destacado': nombre.lower() in TALLERES_DESTACADOS},
            'acf': {
                'descripcion': limpio(f[1]),
                'hora': 'Varias veces al día',
                'duracion': duracion,
                'lugar': '',
                'publico': 'Mayores de 12 años' if re.fullmatch(r'\+\s*12', limpio(f[2])) else limpio(f[2]),
                'cupos': '',
                'a_cargo': limpio(f[4]),
                'clave': clave,
            },
        })
    return talleres


def titulo_real(texto, conocidos):
    """Busca en los títulos del programa el que corresponde a lo escrito en la hoja de invitados."""
    import difflib
    objetivo = slug(texto)
    mejor = max(conocidos, key=lambda t: difflib.SequenceMatcher(None, slug(t), objetivo).ratio(), default=None)
    if mejor and difflib.SequenceMatcher(None, slug(mejor), objetivo).ratio() > 0.8:
        return mejor
    return None


def limpiar_actividad(texto, conocidos):
    """'Viernes 9 13:00 hrs: Encuentros Profesionales: LA LIBRERÍA DESAFIADA' -> 'Viernes 9 · 13:00 · La librería desafiada'.
    Las actividades 'por confirmar' o reuniones privadas no se publican."""
    texto = limpio(texto)
    if not texto or re.search(r'por confirmar|potencial|reuni[oó]n', texto, re.I):
        return ''
    m = re.match(r'(\w+)\s+(\d+),?\s+(\d{1,2}:\d{2})\s*h(?:rs?)?\.?:?\s*(.*)$', texto, re.I)
    if not m:
        return texto
    dia, num, hora, resto = m.groups()
    resto = re.sub(r'^Encuentros? Profesionales?:\s*', '', resto, flags=re.I)
    real = titulo_real(resto, conocidos)
    if real is None:
        real = resto.capitalize() if resto.isupper() else resto
    return f'{dia.capitalize().replace("Sabado", "Sábado")} {num} · {hora} · {real}'


def leer_invitados(ruta, carpeta_fotos, conocidos):
    """Hoja de invitados. La columna 'Comentario' (financiamiento, etc.) NO se publica;
    solo se usa para el crédito de la foto si lo trae."""
    ws = openpyxl.load_workbook(ruta, data_only=True)[PESTANA_INVITADOS]
    filas = [f for f in ws.iter_rows(values_only=True) if limpio(f[0]) and limpio(f[0]).lower() != 'nombre']
    # Primero quienes ya tienen actividad pública sin condiciones; el resto, en el orden de la hoja
    invitados = []
    for f in filas:
        nombre, ocupacion, pais, bio = limpio(f[0]), limpio(f[1]), limpio(f[2]), limpio(f[3])
        credito = ''
        m = re.search(r'cr[eé]dito de la foto es de ([^.]+)', limpio(f[6]), re.I)
        if m:
            credito = m.group(1).strip()
        clave = slug(nombre)
        foto = Path(carpeta_fotos) / f'{re.sub("[^a-z]", "", slug(nombre).replace("-", ""))}.jpg' if carpeta_fotos else None
        invitados.append({
            'titulo': nombre,
            'clave': clave,
            'foto_path': foto if foto and foto.exists() else None,
            'acf': {
                'tipo': 'Autores/as' if 'escritor' in ocupacion.lower() else 'Profesionales del libro',
                'rol': ocupacion,
                'pais': pais,
                'bio': bio,
                'actividad': ACTIVIDAD_INVITADOS.get(clave) or limpiar_actividad(f[5], conocidos),
                'credito_foto': credito,
                'clave': clave,
            },
        })
    invitados.sort(key=lambda i: 0 if i['acf']['tipo'] == 'Autores/as' else 1)
    for n, i in enumerate(invitados):
        i['post'] = {'menu_order': n}
        i['acf_nuevo'] = {'destacado': n < 8 and bool(i['acf']['actividad'] or i['acf']['tipo'] == 'Autores/as')}
    return invitados


def subir_foto(wp, ruta, titulo):
    """Sube la foto a la biblioteca de medios de WordPress y devuelve su ID."""
    datos = Path(ruta).read_bytes()
    req = urllib.request.Request(wp.base + '/media', method='POST', data=datos, headers={
        'Authorization': wp.headers['Authorization'],
        'Content-Type': 'image/jpeg',
        'Content-Disposition': f'attachment; filename="{slug(titulo)}.jpg"',
    })
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            medio = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f'Error {e.code} subiendo foto de {titulo}: {e.read().decode()[:300]}')
    wp.pedir('POST', f"/media/{medio['id']}", {'alt_text': f'Foto de {titulo}', 'title': titulo})
    return medio['id']


class WP:
    def __init__(self, env):
        self.base = env['WP_URL'].rstrip('/') + '/wp-json/wp/v2'
        token = base64.b64encode(f"{env['WP_USER']}:{env['WP_APP_PASSWORD']}".encode()).decode()
        self.headers = {'Authorization': f'Basic {token}', 'Content-Type': 'application/json'}

    def pedir(self, metodo, ruta, cuerpo=None):
        req = urllib.request.Request(self.base + ruta, method=metodo, headers=self.headers,
                                     data=json.dumps(cuerpo).encode() if cuerpo is not None else None)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            sys.exit(f'Error {e.code} en {metodo} {ruta}: {e.read().decode()[:300]}')

    def existentes(self, endpoint):
        out, pagina = [], 1
        while True:
            lote = self.pedir('GET', f'/{endpoint}?context=edit&status=any&per_page=100&page={pagina}&_fields=id,status,title,acf')
            out += lote
            if len(lote) < 100:
                return out
            pagina += 1


def sincronizar(wp, endpoint, nombre, eventos, args):
    por_dia = {}
    for e in eventos:
        dia = e['acf'].get('dia') or 'todos'
        por_dia[dia] = por_dia.get(dia, 0) + 1
    print(f'\n[{nombre}] Hoja: {len(eventos)} actividades {por_dia}')

    actuales = {p['acf'].get('clave'): p for p in wp.existentes(endpoint) if p.get('acf') and p['acf'].get('clave')}
    claves = {e['clave'] for e in eventos}
    nuevos = [e for e in eventos if e['clave'] not in actuales]
    cambian = [e for e in eventos if e['clave'] in actuales and any(
        (actuales[e['clave']]['acf'].get(k) or '') != v for k, v in e['acf'].items())]
    huerfanos = [p for c, p in actuales.items() if c not in claves and p['status'] != 'draft']
    print(f'[{nombre}] CMS: {len(actuales)} sincronizadas | nuevas: {len(nuevos)} | con cambios: {len(cambian)} | ya no están en la hoja: {len(huerfanos)}')
    for p in huerfanos:
        print(f"    saldría (pasa a borrador): {p['title']['rendered'][:70]}")
    if not args.apply:
        return

    estado = 'publish' if args.publish else 'draft'
    for e in nuevos:
        acf = {**e['acf'], **e.get('acf_nuevo', {})}
        if e.get('foto_path'):
            acf['foto'] = subir_foto(wp, e['foto_path'], e['titulo'])
        wp.pedir('POST', f'/{endpoint}', {'title': e['titulo'], 'status': estado, 'acf': acf, **e.get('post', {})})
    for e in cambian:
        p = actuales[e['clave']]
        acf = dict(e['acf'])
        if e.get('foto_path') and not p['acf'].get('foto'):
            acf['foto'] = subir_foto(wp, e['foto_path'], e['titulo'])
        wp.pedir('POST', f"/{endpoint}/{p['id']}", {'title': e['titulo'], 'acf': acf, **e.get('post', {})})
    if args.publish:  # publica también los borradores que ya estaban cargados y siguen en la hoja
        for e in eventos:
            p = actuales.get(e['clave'])
            if p and p['status'] == 'draft':
                wp.pedir('POST', f"/{endpoint}/{p['id']}", {'status': 'publish'})
    for p in huerfanos:  # reversible: pasan a borrador, no se borran
        wp.pedir('POST', f"/{endpoint}/{p['id']}", {'status': 'draft'})
    print(f'[{nombre}] Listo: {len(nuevos)} creadas ({estado}), {len(cambian)} actualizadas, {len(huerfanos)} pasadas a borrador.')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='escribir en WordPress (sin esto solo simula)')
    ap.add_argument('--publish', action='store_true', help='publicar los nuevos (por defecto quedan como borrador)')
    ap.add_argument('--file', help='ruta a un .xlsx local en vez de descargar la hoja')
    ap.add_argument('--invitados-file', help='ruta a un .xlsx local de invitados')
    ap.add_argument('--fotos', help='carpeta con las fotos de invitados (<nombre-sin-espacios>.jpg, ya recortadas)')
    args = ap.parse_args()

    ruta = Path(args.file) if args.file else descargar_xlsx()
    wp = WP(leer_env())
    sincronizar(wp, 'programa', 'Programa', leer_programa(ruta), args)
    sincronizar(wp, 'encuentros', 'Encuentros profesionales', leer_encuentros(ruta), args)
    sincronizar(wp, 'talleres', 'Talleres', leer_talleres(ruta), args)
    ruta_inv = Path(args.invitados_file) if args.invitados_file else descargar_xlsx(SHEET_INVITADOS_ID, 'invitados_pdl')
    conocidos = [e['titulo'] for e in leer_programa(ruta)] + [e['titulo'] for e in leer_encuentros(ruta)]
    sincronizar(wp, 'invitados', 'Invitados', leer_invitados(ruta_inv, args.fotos, conocidos), args)
    if not args.apply:
        print('\nSimulación: no se escribió nada. Usa --apply para aplicar.')


if __name__ == '__main__':
    main()
