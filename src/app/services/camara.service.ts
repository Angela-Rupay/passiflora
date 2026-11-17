import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraPlugin, CameraResultType, CameraSource } from '@capacitor/camera';

export const CAMARA = new InjectionToken<CameraPlugin>('CAMARA', { providedIn: 'root', factory: () => Camera });
export const CAMARA_NATIVA = new InjectionToken<boolean>('CAMARA_NATIVA', {
  providedIn: 'root',
  factory: () => Capacitor.isNativePlatform(),
});

@Injectable({ providedIn: 'root' })
export class CamaraService {
  constructor(
    @Inject(CAMARA) private camara: CameraPlugin,
    @Inject(CAMARA_NATIVA) private nativa: boolean,
  ) {}

  async capturar(): Promise<string | null> {
    if (this.nativa) {
      let permiso = await this.camara.checkPermissions();
      if (permiso.camera !== 'granted') permiso = await this.camara.requestPermissions({ permissions: ['camera'] });
      if (permiso.camera !== 'granted') {
        throw new Error(
          'No se abrió la cámara porque no autorizaste el permiso. Puedes habilitarlo en Ajustes → Aplicaciones → Passiflora → Permisos → Cámara.',
        );
      }
    }
    try {
      const foto = await this.camara.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.DataUrl,
        quality: 70,
        width: 1280,
        height: 1280,
        allowEditing: false,
        saveToGallery: false,
        webUseInput: true,
      });
      if (!foto.dataUrl?.startsWith('data:image/')) throw new Error('No pudimos cargar la foto. Inténtalo de nuevo.');
      return foto.dataUrl;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      if (/cancel/i.test(mensaje)) return null;
      throw error;
    }
  }
}
