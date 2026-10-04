// Contenido de ejemplo: reemplazar con las fotos reales (campo `src`).
export const ANIOS = [2025, 2024, 2023, 2022, 2021]
const RATIOS = ['4 / 3', '3 / 4', '1 / 1', '3 / 2', '4 / 5', '16 / 9']

export const FOTOS = ANIOS.flatMap((anio, a) =>
  Array.from({ length: 6 }, (_, i) => ({
    id: `${anio}-${i + 1}`,
    anio,
    titulo: `Primavera del Libro ${anio} · Foto ${i + 1}`,
    ratio: RATIOS[(i + a) % RATIOS.length],
    src: null,
  })),
)
