#!/usr/bin/env python3
"""Sincroniza el programa de la hoja de cálculo con WordPress (tipo "Programa").

La hoja es la fuente de verdad: cada fila de la pestaña "Copia de TODO" es una
actividad. La columna "Contacto" (correos) NUNCA se publica.

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


def leer_programa(ruta):
    ws = openpyxl.load_workbook(ruta, data_only=True)[PESTANA]
    filas = list(ws.iter_rows(values_only=True))
    cab = next(i for i, f in enumerate(filas) if f[2] == 'Lugar')
    eventos, vistas = [], {}
    for f in filas[cab + 1:]:
        dia = DIAS.get(limpio(f[0]).lower())
        nombre = limpio(f[4])
        if not dia or not nombre:
            continue
        hora = f[1].strftime('%H:%M') if isinstance(f[1], (datetime.time, datetime.datetime)) else limpio(f[1])
        clave = slug(f'{dia}-{hora}-{limpio(f[2])}-{nombre}')[:120]
        vistas[clave] = vistas.get(clave, 0) + 1
        if vistas[clave] > 1:
            clave = f'{clave}-{vistas[clave]}'
        eventos.append({
            'titulo': nombre,
            'clave': clave,
            'acf': {
                'dia': dia,
                'hora': hora,
                'lugar': limpio(f[2]),
                'tipo': limpio(f[3]),
                'participantes': limpio(f[5]),
                'organiza': limpio(f[6]),
                'descripcion': limpio(f[7]),
                'clave': clave,
            },
        })
    return eventos


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

    def existentes(self):
        out, pagina = [], 1
        while True:
            lote = self.pedir('GET', f'/programa?context=edit&status=any&per_page=100&page={pagina}&_fields=id,status,title,acf')
            out += lote
            if len(lote) < 100:
                return out
            pagina += 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='escribir en WordPress (sin esto solo simula)')
    ap.add_argument('--publish', action='store_true', help='publicar los nuevos (por defecto quedan como borrador)')
    ap.add_argument('--file', help='ruta a un .xlsx local en vez de descargar la hoja')
    args = ap.parse_args()

    eventos = leer_programa(Path(args.file) if args.file else descargar_xlsx())
    por_dia = {}
    for e in eventos:
        por_dia[e['acf']['dia']] = por_dia.get(e['acf']['dia'], 0) + 1
    print(f'Hoja: {len(eventos)} actividades {por_dia}')

    wp = WP(leer_env())
    actuales = {p['acf'].get('clave'): p for p in wp.existentes() if p.get('acf') and p['acf'].get('clave')}
    claves = {e['clave'] for e in eventos}
    nuevos = [e for e in eventos if e['clave'] not in actuales]
    cambian = [e for e in eventos if e['clave'] in actuales and any(
        (actuales[e['clave']]['acf'].get(k) or '') != v for k, v in e['acf'].items())]
    huerfanos = [p for c, p in actuales.items() if c not in claves and p['status'] != 'draft']
    print(f'CMS: {len(actuales)} sincronizadas | nuevas: {len(nuevos)} | con cambios: {len(cambian)} | ya no están en la hoja: {len(huerfanos)}')
    if not args.apply:
        print('Simulación: no se escribió nada. Usa --apply para aplicar.')
        return

    estado = 'publish' if args.publish else 'draft'
    for e in nuevos:
        wp.pedir('POST', '/programa', {'title': e['titulo'], 'status': estado, 'acf': e['acf']})
    for e in cambian:
        p = actuales[e['clave']]
        wp.pedir('POST', f"/programa/{p['id']}", {'title': e['titulo'], 'acf': e['acf']})
    if args.publish:  # publica también los borradores que ya estaban cargados y siguen en la hoja
        for e in eventos:
            p = actuales.get(e['clave'])
            if p and p['status'] == 'draft':
                wp.pedir('POST', f"/programa/{p['id']}", {'status': 'publish'})
    for p in huerfanos:  # reversible: pasan a borrador, no se borran
        wp.pedir('POST', f"/programa/{p['id']}", {'status': 'draft'})
    print(f'Listo: {len(nuevos)} creadas ({estado}), {len(cambian)} actualizadas, {len(huerfanos)} pasadas a borrador.')


if __name__ == '__main__':
    main()
