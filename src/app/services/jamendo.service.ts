import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';

export interface PistaAmbiental {
  id: string;
  titulo: string;
  artista: string;
  duracion: number;
  audioUrl: string;
  fuenteUrl: string;
  licenciaUrl: string;
}

// Identificador público de Passiflora. No se utiliza Client Secret ni OAuth.
export const JAMENDO_CLIENT_ID = '9c38c796';

function registro(valor: unknown): Record<string, unknown> | null {
  return typeof valor === 'object' && valor !== null ? (valor as Record<string, unknown>) : null;
}

function enlace(valor: unknown, dominio: string): string {
  if (typeof valor !== 'string' || !valor) return '';
  try {
    const url = new URL(valor);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    if (url.hostname !== dominio && !url.hostname.endsWith(`.${dominio}`)) return '';
    url.protocol = 'https:';
    return url.href;
  } catch {
    return '';
  }
}

@Injectable({ providedIn: 'root' })
export class JamendoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<PistaAmbiental[]> {
    const params = new HttpParams()
      .set('client_id', JAMENDO_CLIENT_ID)
      .set('format', 'json')
      .set('limit', '12')
      .set('fuzzytags', 'ambient+relaxation')
      .set('vocalinstrumental', 'instrumental')
      .set('audioformat', 'mp31');
    return this.http.get<unknown>('https://api.jamendo.com/v3.0/tracks/', { params }).pipe(
      timeout(15000),
      map((respuesta) => {
        const datos = registro(respuesta);
        const cabecera = registro(datos?.['headers']);
        if (cabecera?.['status'] !== 'success' || cabecera['code'] !== 0 || !Array.isArray(datos?.['results'])) {
          throw new Error('Jamendo no pudo devolver el catálogo.');
        }
        return datos['results'].flatMap((valor: unknown): PistaAmbiental[] => {
          const pista = registro(valor);
          if (
            !pista ||
            typeof pista['id'] !== 'string' ||
            !/^\d+$/.test(pista['id']) ||
            typeof pista['name'] !== 'string' ||
            typeof pista['artist_name'] !== 'string'
          )
            return [];
          const audioUrl = enlace(pista['audio'], 'jamendo.com');
          const licenciaUrl = enlace(pista['license_ccurl'], 'creativecommons.org');
          if (!audioUrl || !licenciaUrl) return [];
          return [
            {
              id: pista['id'],
              titulo: pista['name'],
              artista: pista['artist_name'],
              duracion:
                typeof pista['duration'] === 'number' && Number.isFinite(pista['duration'])
                  ? Math.max(0, pista['duration'])
                  : 0,
              audioUrl,
              licenciaUrl,
              fuenteUrl: enlace(pista['shareurl'], 'jamendo.com') || `https://www.jamendo.com/track/${pista['id']}`,
            },
          ];
        });
      }),
    );
  }
}
