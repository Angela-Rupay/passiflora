import { describe, expect, it } from 'vitest';
import { NuevoRegistroEmocional, registroValido } from './diario.service';

const registro: NuevoRegistroEmocional = {
  fecha: '2026-11-17',
  emocionPrincipal: 'Felicidad',
  emoji: '😊',
  subemocion: 'Pacífico',
  intensidad: 5,
  color: '#E09F3E',
};

describe('Datos del diario enviados a Firestore', () => {
  it('valida fechas reales y admite el formato existente sin creadoEn', () => {
    expect(registroValido(registro)).toBe(true);
    expect(registroValido({ ...registro, fecha: '2026-02-30' })).toBe(false);
    expect(registroValido({ ...registro, fecha: '2026-13-01' })).toBe(false);
    expect(registroValido({ ...registro, fecha: '' })).toBe(false);
  });
  it('rechaza intensidades fuera de escala y datos incompletos', () => {
    for (const intensidad of [0, 11, 1.5, NaN]) expect(registroValido({ ...registro, intensidad })).toBe(false);
    expect(registroValido({ ...registro, subemocion: ' ' })).toBe(false);
    expect(registroValido({ ...registro, color: 'incorrecto' })).toBe(false);
  });
});
