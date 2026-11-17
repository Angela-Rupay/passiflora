import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CAMARA, CAMARA_NATIVA, CamaraService } from './camara.service';

const foto = 'data:image/jpeg;base64,Zm90bw==';
describe('Cámara: autorización antes de capturar', () => {
  const dispositivo = { checkPermissions: vi.fn(), requestPermissions: vi.fn(), getPhoto: vi.fn() };
  beforeEach(() => {
    dispositivo.checkPermissions.mockReset().mockResolvedValue({ camera: 'prompt' });
    dispositivo.requestPermissions.mockReset().mockResolvedValue({ camera: 'granted' });
    dispositivo.getPhoto.mockReset().mockResolvedValue({ dataUrl: foto });
    TestBed.configureTestingModule({
      providers: [
        CamaraService,
        { provide: CAMARA, useValue: dispositivo },
        { provide: CAMARA_NATIVA, useValue: true },
      ],
    });
  });
  it('solicita permiso y solo después abre la cámara', async () => {
    expect(await TestBed.inject(CamaraService).capturar()).toBe(foto);
    expect(dispositivo.requestPermissions).toHaveBeenCalledWith({ permissions: ['camera'] });
    expect(dispositivo.getPhoto).toHaveBeenCalledOnce();
    expect(dispositivo.getPhoto.mock.calls[0][0]).toMatchObject({
      resultType: 'dataUrl',
      saveToGallery: false,
      width: 1280,
    });
  });
  it('no abre la cámara si se deniega el permiso', async () => {
    dispositivo.requestPermissions.mockResolvedValue({ camera: 'denied' });
    await expect(TestBed.inject(CamaraService).capturar()).rejects.toThrow('no autorizaste');
    expect(dispositivo.getPhoto).not.toHaveBeenCalled();
  });
  it('respeta el permiso ya concedido por Android', async () => {
    dispositivo.checkPermissions.mockResolvedValue({ camera: 'granted' });
    await TestBed.inject(CamaraService).capturar();
    expect(dispositivo.requestPermissions).not.toHaveBeenCalled();
  });
  it('cancelar la captura no se trata como un fallo ni devuelve una foto', async () => {
    dispositivo.getPhoto.mockRejectedValue(new Error('User cancelled photos app'));
    expect(await TestBed.inject(CamaraService).capturar()).toBeNull();
  });
});
