import { Injectable } from '@angular/core';

export interface ContactoApoyo { nombre: string; numero: string; mensaje: string; }
export const MENSAJE_APOYO = 'Hola, no me estoy sintiendo bien en este momento. ¿Puedes escribirme o llamarme cuando puedas?';
export function contactoValido(contacto: ContactoApoyo): boolean {
  return typeof contacto.nombre === 'string' && !!contacto.nombre.trim() && contacto.nombre.length <= 80 &&
    typeof contacto.numero === 'string' && /^3\d{9}$/.test(contacto.numero) &&
    typeof contacto.mensaje === 'string' && !!contacto.mensaje.trim() && contacto.mensaje.length <= 500;
}
export function enlaceWhatsApp(contacto: ContactoApoyo): string {
  if (!contactoValido(contacto)) throw new Error('Revisa tu contacto y mensaje.');
  return `https://wa.me/57${contacto.numero}?text=${encodeURIComponent(contacto.mensaje.trim())}`;
}
@Injectable({ providedIn: 'root' })
export class ContactoApoyoService {
  private clave(uid: string) {
    if (!uid.trim()) throw new Error('Inicia sesión para configurar tu contacto.');
    return `passiflora:contacto:v1:${uid}`;
  }
  leer(uid: string): ContactoApoyo | null {
    const texto = localStorage.getItem(this.clave(uid));
    if (!texto) return null;
    const datos = JSON.parse(texto);
    if (!datos || !contactoValido(datos)) throw new Error('No pudimos leer tu contacto. Puedes volver a configurarlo.');
    return datos;
  }
  guardar(uid: string, contacto: ContactoApoyo) {
    const datos = { nombre: contacto.nombre.trim(), numero: contacto.numero.trim(), mensaje: contacto.mensaje.trim() };
    if (!contactoValido(datos)) throw new Error('Ingresa un nombre, un celular colombiano de 10 dígitos que empiece por 3 y un mensaje de hasta 500 caracteres.');
    localStorage.setItem(this.clave(uid), JSON.stringify(datos));
    return datos;
  }
  eliminar(uid: string) { localStorage.removeItem(this.clave(uid)); }
}
