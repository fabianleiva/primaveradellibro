#!/usr/bin/env python3
"""Sincroniza la hoja de cálculo con WordPress: Programa, Encuentros profesionales y Talleres.

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


def descargar_xlsx():
    url = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=xlsx'
    destino = Path('/tmp/programa_pdl.xlsx')
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
        if es_encuentro(limpio(f[3])) != solo_encuentros:
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
    return eventos


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
    return eventos


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
                'publico': limpio(f[2]),
                'cupos': '',
                'a_cargo': limpio(f[4]),
                'clave': clave,
            },
        })
    return talleres


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
        wp.pedir('POST', f'/{endpoint}', {'title': e['titulo'], 'status': estado, 'acf': {**e['acf'], **e.get('acf_nuevo', {})}})
    for e in cambian:
        p = actuales[e['clave']]
        wp.pedir('POST', f"/{endpoint}/{p['id']}", {'title': e['titulo'], 'acf': e['acf']})
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
    args = ap.parse_args()

    ruta = Path(args.file) if args.file else descargar_xlsx()
    wp = WP(leer_env())
    sincronizar(wp, 'programa', 'Programa', leer_programa(ruta), args)
    sincronizar(wp, 'encuentros', 'Encuentros profesionales', leer_encuentros(ruta), args)
    sincronizar(wp, 'talleres', 'Talleres', leer_talleres(ruta), args)
    if not args.apply:
        print('\nSimulación: no se escribió nada. Usa --apply para aplicar.')


if __name__ == '__main__':
    main()
