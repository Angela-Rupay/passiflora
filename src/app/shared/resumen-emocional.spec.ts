import { describe, expect, it } from 'vitest';
import { lunesDeSemana, resumirSemana } from './resumen-emocional';
import { RegistroEmocional } from '../services/diario.service';

const registro = (fecha: string, emocionPrincipal: string, intensidad: number): RegistroEmocional => ({
  id: `${fecha}-${emocionPrincipal}`, fecha, emocionPrincipal, intensidad,
  emoji: '💜', subemocion: 'Detalle', color: '#5E4B8B', pendiente: false, creadoEnMs: 0,
});
describe('Resumen semanal del diario', () => {
  it('agrupa por lunes a domingo incluso entre dos años', () => {
    expect(lunesDeSemana('2027-01-03')).toBe('2026-12-28');
    expect(lunesDeSemana('2027-01-04')).toBe('2027-01-04');
  });
  it('cuenta registros y días distintos, excluyendo otras semanas', () => {
    const resumen = resumirSemana([
      registro('2026-11-23', 'Felicidad', 2), registro('2026-11-23', 'Miedo', 8),
      registro('2026-11-29', 'Felicidad', 5), registro('2026-11-30', 'Ira', 10),
    ], '2026-11-23');
    expect(resumen.total).toBe(3); expect(resumen.dias).toBe(2);
    expect(resumen.promedio).toBe(5); expect(resumen.frecuentes).toBe('Felicidad');
    expect(resumen.emociones[0].cantidad).toBe(2);
    expect(resumen.emociones.reduce((s, e) => s + e.porcentaje, 0)).toBeCloseTo(100);
  });
  it('incluye todos los empates en la emoción más frecuente', () => {
    const resumen = resumirSemana([registro('2026-11-23', 'Miedo', 5), registro('2026-11-24', 'Tristeza', 5)], '2026-11-23');
    expect(resumen.frecuentes).toBe('Miedo, Tristeza');
  });
  it('no inventa una intensidad cero cuando no existen registros', () => {
    const resumen = resumirSemana([], '2026-11-23');
    expect(resumen.total).toBe(0); expect(resumen.promedio).toBeNull();
    expect(resumen.frecuentes).toBe(''); expect(resumen.emociones).toEqual([]);
  });
});
