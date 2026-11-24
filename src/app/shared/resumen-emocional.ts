import { RegistroEmocional } from '../services/diario.service';

// Las fechas del diario son días de calendario; UTC evita desplazamientos por zona horaria.
export function lunesDeSemana(fecha: string): string {
  const dia = new Date(`${fecha}T12:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() - (dia.getUTCDay() + 6) % 7);
  return dia.toISOString().slice(0, 10);
}

export function etiquetaSemana(lunes: string): string {
  const fin = new Date(`${lunes}T12:00:00Z`);
  fin.setUTCDate(fin.getUTCDate() + 6);
  const formato = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return `${formato.format(new Date(`${lunes}T12:00:00Z`))} – ${formato.format(fin)}`;
}

export function resumirSemana(registros: RegistroEmocional[], semana: string) {
  const seleccion = registros.filter(r => lunesDeSemana(r.fecha) === semana);
  const conteos = new Map<string, { nombre: string; cantidad: number }>();
  for (const registro of seleccion) {
    const fila = conteos.get(registro.emocionPrincipal) ?? { nombre: registro.emocionPrincipal, cantidad: 0 };
    fila.cantidad++;
    conteos.set(fila.nombre, fila);
  }
  const emociones = [...conteos.values()].sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, 'es'));
  return {
    total: seleccion.length,
    dias: new Set(seleccion.map(r => r.fecha)).size,
    promedio: seleccion.length ? seleccion.reduce((suma, r) => suma + r.intensidad, 0) / seleccion.length : null,
    frecuentes: emociones.filter(e => e.cantidad === emociones[0]?.cantidad).map(e => e.nombre).join(', '),
    emociones: emociones.map(e => ({ ...e, porcentaje: e.cantidad * 100 / seleccion.length })),
  };
}
