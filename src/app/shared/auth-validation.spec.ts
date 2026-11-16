import { describe, expect, it } from 'vitest';
import { FormControl } from '@angular/forms';
import { nombreValido, PATRON_CLAVE, PATRON_CORREO, mensajeAuth } from './auth-validation';

describe('Validación de credenciales', () => {
  it('acepta nombres tildados y rechaza números y espacios vacíos', () => {
    expect(nombreValido(new FormControl('Ángela María'))).toBeNull();
    expect(nombreValido(new FormControl('   '))).not.toBeNull();
    expect(nombreValido(new FormControl('Ana1'))).not.toBeNull();
  });
  it('acepta .com y .co y rechaza correos incompletos', () => {
    expect(PATRON_CORREO.test('ana@universidad.edu.co')).toBe(true);
    expect(PATRON_CORREO.test('ana@example.com')).toBe(true);
    expect(PATRON_CORREO.test('ana@example')).toBe(false);
    expect(PATRON_CORREO.test('ana example.com')).toBe(false);
  });
  it('exige longitud, mayúscula y número', () => {
    expect(PATRON_CLAVE.test('Segura123')).toBe(true);
    for (const clave of ['segura123', 'SegurasinNumero', 'Aa1']) expect(PATRON_CLAVE.test(clave)).toBe(false);
  });
  it('no presenta credenciales inválidas como un correo inexistente', () => {
    expect(mensajeAuth({ code: 'auth/invalid-credential' })).toContain('correo o la contraseña');
    expect(mensajeAuth({ code: 'auth/network-request-failed' })).toContain('conexión');
  });
});
