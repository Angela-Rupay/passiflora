import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JamendoService, JAMENDO_CLIENT_ID } from './jamendo.service';

const pista = {
  id: '123',
  name: 'Calma',
  artist_name: 'Artista',
  duration: 120,
  audio: 'https://prod-1.storage.jamendo.com/?trackid=123',
  shareurl: 'https://www.jamendo.com/track/123',
  license_ccurl: 'http://creativecommons.org/licenses/by/4.0/',
};

describe('Jamendo: HTTP REST y procesamiento de JSON', () => {
  let http: HttpTestingController;
  let servicio: JamendoService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    servicio = TestBed.inject(JamendoService);
  });
  afterEach(() => http.verify());

  it('consulta música instrumental con el Client ID y devuelve metadatos y licencia', () => {
    servicio.listar().subscribe((pistas) => {
      expect(pistas[0]).toMatchObject({
        id: '123',
        titulo: 'Calma',
        artista: 'Artista',
        duracion: 120,
        licenciaUrl: 'https://creativecommons.org/licenses/by/4.0/',
      });
    });
    const solicitud = http.expectOne((req) => req.url === 'https://api.jamendo.com/v3.0/tracks/');
    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('client_id')).toBe(JAMENDO_CLIENT_ID);
    expect(solicitud.request.params.get('fuzzytags')).toBe('ambient+relaxation');
    expect(solicitud.request.params.get('vocalinstrumental')).toBe('instrumental');
    expect(solicitud.request.params.has('client_secret')).toBe(false);
    solicitud.flush({ headers: { status: 'success', code: 0 }, results: [pista] });
  });

  it('acepta un catálogo vacío y descarta pistas sin audio o licencia seguros', () => {
    servicio.listar().subscribe((pistas) => expect(pistas).toEqual([]));
    http
      .expectOne(() => true)
      .flush({
        headers: { status: 'success', code: 0 },
        results: [
          { ...pista, audio: '' },
          { ...pista, license_ccurl: '' },
          { ...pista, audio: 'javascript:alert(1)' },
        ],
      });
  });

  it('detecta errores de API incluso si HTTP devuelve 200', () => {
    let fallo = false;
    servicio.listar().subscribe({
      error: () => {
        fallo = true;
      },
    });
    http.expectOne(() => true).flush({ headers: { status: 'failed', code: 5 }, results: [] });
    expect(fallo).toBe(true);
  });

  it('propaga un fallo HTTP para permitir reintentar desde la pantalla', () => {
    let fallo = false;
    servicio.listar().subscribe({
      error: () => {
        fallo = true;
      },
    });
    http.expectOne(() => true).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(fallo).toBe(true);
  });
});
