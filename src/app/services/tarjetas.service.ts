import { Injectable } from '@angular/core';

export interface TarjetaRealidad {
  id: string;
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class TarjetasService {
  readonly longitudMaxima = 500;

  private clave(uid: string): string {
    if (!uid.trim()) throw new Error('Inicia sesión para acceder a tus tarjetas.');
    return `passiflora:tarjetas:v1:${uid}`;
  }

  listar(uid: string): TarjetaRealidad[] {
    const contenido = localStorage.getItem(this.clave(uid));
    if (contenido === null) return [];
    const datos: unknown = JSON.parse(contenido);
    if (!Array.isArray(datos) || !datos.every((item: unknown) => {
      if (typeof item !== 'object' || item === null) return false;
      const tarjeta = item as Record<string, unknown>;
      return typeof tarjeta['id'] === 'string' && typeof tarjeta['texto'] === 'string';
    })) throw new Error('No se pudieron leer las tarjetas guardadas.');
    return datos as TarjetaRealidad[];
  }

  guardar(uid: string, texto: string, id?: string): TarjetaRealidad[] {
    const limpio = texto.trim();
    if (!limpio || limpio.length > this.longitudMaxima) {
      throw new Error(`Escribe entre 1 y ${this.longitudMaxima} caracteres.`);
    }
    const tarjetas = this.listar(uid);
    if (id) {
      const tarjeta = tarjetas.find(item => item.id === id);
      if (!tarjeta) throw new Error('La tarjeta ya no existe. Vuelve a cargar la lista.');
      tarjeta.texto = limpio;
    } else {
      tarjetas.unshift({ id: crypto.randomUUID(), texto: limpio });
    }
    localStorage.setItem(this.clave(uid), JSON.stringify(tarjetas));
    return tarjetas;
  }

  eliminar(uid: string, id: string): TarjetaRealidad[] {
    const tarjetas = this.listar(uid).filter(item => item.id !== id);
    localStorage.setItem(this.clave(uid), JSON.stringify(tarjetas));
    return tarjetas;
  }
}
