import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { IonContent, IonButton, IonTextarea, IonToast, AlertController } from '@ionic/angular';
import { TarjetaRealidad, TarjetasService } from '../../services/tarjetas.service';

@Component({
  selector: 'app-tarjetas',
  standalone: true,
  templateUrl: './tarjetas.page.html',
  styleUrls: ['./tarjetas.page.scss'],
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonButton, IonTextarea, IonToast]
})
export class TarjetasPage implements OnInit, OnDestroy {
  tarjetas: TarjetaRealidad[] = [];
  texto = '';
  editandoId?: string;
  uid: string | null = null;
  cargando = true;
  error = '';
  mensaje = '';
  mostrarToast = false;
  private cancelarSesion?: () => void;

  constructor(private auth: Auth, public servicio: TarjetasService, private alertas: AlertController, private cambios: ChangeDetectorRef, private injector: Injector) {}

  ngOnInit() {
    this.cancelarSesion = runInInjectionContext(this.injector, () => onAuthStateChanged(this.auth, usuario => {
      this.uid = usuario?.uid ?? null;
      this.tarjetas = [];
      this.cancelarEdicion();
      this.cargar();
      this.cambios.markForCheck();
    }, () => {
      this.uid = null;
      this.tarjetas = [];
      this.cancelarEdicion();
      this.cargando = false;
      this.error = 'No pudimos recuperar tu sesión. Vuelve a iniciar sesión para acceder a tus tarjetas.';
      this.cambios.markForCheck();
    }));
  }

  ngOnDestroy() { this.cancelarSesion?.(); }

  cargar() {
    this.error = '';
    this.cargando = false;
    if (!this.uid) return;
    try {
      this.tarjetas = this.servicio.listar(this.uid);
    } catch {
      this.error = 'No pudimos leer tus tarjetas. Intenta cargar de nuevo. No hemos borrado tus datos.';
    }
  }

  guardar() {
    if (!this.uid || this.error) return;
    try {
      const eraEdicion = !!this.editandoId;
      this.tarjetas = this.servicio.guardar(this.uid, this.texto, this.editandoId);
      this.cancelarEdicion();
      this.notificar(eraEdicion ? 'Tarjeta actualizada.' : 'Tarjeta guardada en este dispositivo.');
    } catch {
      this.notificar('No pudimos guardar la tarjeta. Tu texto sigue aquí para que lo intentes de nuevo.');
    }
  }

  editar(tarjeta: TarjetaRealidad) {
    this.editandoId = tarjeta.id;
    this.texto = tarjeta.texto;
  }

  cancelarEdicion() { this.editandoId = undefined; this.texto = ''; }

  async confirmarEliminar(tarjeta: TarjetaRealidad) {
    const propietario = this.uid;
    if (!propietario) return;
    const alerta = await this.alertas.create({
      header: '¿Eliminar esta tarjeta?',
      message: 'Esta acción no se puede deshacer.',
      cssClass: 'alerta-tarjetas',
      buttons: [
        { text: 'Conservar', role: 'cancel' },
        { text: 'Eliminar', handler: () => {
          if (this.uid !== propietario) return;
          try {
            this.tarjetas = this.servicio.eliminar(propietario, tarjeta.id);
            if (this.editandoId === tarjeta.id) this.cancelarEdicion();
            this.notificar('Tarjeta eliminada.');
          } catch { this.notificar('No pudimos eliminar la tarjeta. Inténtalo de nuevo.'); }
        } }
      ]
    });
    await alerta.present();
  }

  private notificar(mensaje: string) { this.mensaje = mensaje; this.mostrarToast = true; this.cambios.markForCheck(); }
}
