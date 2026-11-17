import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, timeout, catchError, throwError, switchMap, of } from 'rxjs';

export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  album_image: string;
  image: string;
  audio: string;
}

interface JamendoResponse {
  headers: {
    status: string;
    code: number;
    error_message: string;
    results_count: number;
  };
  results: JamendoTrack[];
}

@Injectable({
  providedIn: 'root',
})
export class JamendoService {
  private readonly API_URL = 'https://api.jamendo.com/v3.0/tracks/';
  private readonly CLIENT_ID = '9c38c796';

  constructor(private http: HttpClient) {}

  obtenerSonidosRelajacion(categoria: string = 'relaxation', limite: number = 12): Observable<JamendoTrack[]> {
    const filtrosPorCategoria: Record<string, Record<string, string>> = {
      relaxation: { tags: 'chillout', order: 'popularity_total' },
      nature: { search: 'nature', order: 'popularity_total' },
      meditation: { search: 'meditation', order: 'popularity_total' },
      ambient: { tags: 'ambient', order: 'popularity_total' },
    };

    const filtro = filtrosPorCategoria[categoria] || { search: categoria, order: 'popularity_total' };

    return this.consultarTracks(filtro, limite).pipe(
      switchMap((tracks) => {
        if (tracks.length > 0) {
          return of(tracks);
        }
        // Respaldo garantizado con música instrumental tranquila
        return this.consultarTracks({ tags: 'instrumental', order: 'popularity_total' }, limite);
      }),
      catchError((err) => {
        console.error('Error al conectar con Jamendo API:', err);
        return throwError(() => err);
      })
    );
  }

  private consultarTracks(filtros: Record<string, string>, limite: number): Observable<JamendoTrack[]> {
    let params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limite.toString())
      .set('audioformat', 'mp32')
      .set('imagesize', '400');

    Object.entries(filtros).forEach(([clave, valor]) => {
      params = params.set(clave, valor);
    });

    return this.http.get<JamendoResponse>(this.API_URL, { params }).pipe(
      timeout(8000),
      map((res) => {
        if (res.headers.code !== 0) {
          throw new Error(res.headers.error_message || 'Error en Jamendo API');
        }
        return res.results || [];
      })
    );
  }
}