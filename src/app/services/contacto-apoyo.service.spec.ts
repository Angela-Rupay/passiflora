import { beforeEach, describe, expect, it } from 'vitest';
import { ContactoApoyoService, contactoValido, enlaceWhatsApp, MENSAJE_APOYO } from './contacto-apoyo.service';

const contacto = { nombre: 'Valeria', numero: '3001234567', mensaje: MENSAJE_APOYO };
describe('Contacto de apoyo local', () => {
  beforeEach(() => localStorage.clear());
  it('solo acepta celulares colombianos de diez dígitos', () => {
    expect(contactoValido(contacto)).toBe(true);
    for (const numero of ['573001234567', '+573001234567', '2001234567', '300123456', '30012345678', '300abc4567']) {
      expect(contactoValido({ ...contacto, numero })).toBe(false);
    }
    expect(contactoValido({ ...contacto, mensaje: ' ' })).toBe(false);
    expect(contactoValido({ ...contacto, mensaje: 'a'.repeat(501) })).toBe(false);
  });
  it('codifica el mensaje como texto y añade 57 una sola vez', () => {
    const mensaje = 'Hola & gracias. ¿Puedes llamarme? 💜';
    const url = new URL(enlaceWhatsApp({ ...contacto, mensaje }));
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/573001234567');
    expect(url.searchParams.get('text')).toBe(mensaje);
    expect(() => enlaceWhatsApp({ ...contacto, numero: 'javascript:123' })).toThrow();
  });
  it('separa cuentas, permite editar y elimina solo el contacto indicado', () => {
    const servicio = new ContactoApoyoService();
    servicio.guardar('angela', contacto);
    expect(servicio.leer('valeria')).toBeNull();
    servicio.guardar('valeria', { ...contacto, nombre: 'Ángela' });
    servicio.guardar('angela', { ...contacto, mensaje: '¿Hablamos?' });
    expect(servicio.leer('angela')?.mensaje).toBe('¿Hablamos?');
    servicio.eliminar('angela');
    expect(servicio.leer('angela')).toBeNull();
    expect(servicio.leer('valeria')?.nombre).toBe('Ángela');
  });
  it('rechaza datos dañados sin borrarlos ni generar un enlace', () => {
    localStorage.setItem('passiflora:contacto:v1:angela', '{');
    expect(() => new ContactoApoyoService().leer('angela')).toThrow();
    expect(localStorage.getItem('passiflora:contacto:v1:angela')).toBe('{');
  });
});
