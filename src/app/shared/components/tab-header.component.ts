import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-tab-header', standalone: true, imports: [IonButton, IonIcon],
  template: `
    <header class="tab-header">
      <img src="assets/img/flor-passiflora.png" alt="Passiflora" width="52" height="52">
      <div class="actions">
        <ion-button fill="clear" (click)="theme.toggleTema()" [attr.aria-label]="theme.modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'">
          <ion-icon slot="icon-only" [name]="theme.modoOscuro ? 'sunny-outline' : 'moon-outline'"></ion-icon>
        </ion-button>
        <ion-button fill="clear" class="logout" (click)="salir()" [disabled]="saliendo" aria-label="Cerrar sesión">
          <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
        </ion-button>
      </div>
    </header>`,
  styles: [`
    :host { display: block; }
    .tab-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 28px; }
    img { width: 52px; height: 52px; object-fit: contain; padding: 5px; border-radius: 50%; background: var(--bg-tarjeta); }
    .actions { display: flex; gap: 4px; }
    ion-button { --color: var(--color-primario); --background-hover: var(--bg-icono); --background-activated: var(--bg-icono); min-width: 48px; min-height: 48px; margin: 0; }
    ion-icon { font-size: 26px; }
    .logout { --color: var(--ion-color-danger); }
  `]
})
export class TabHeaderComponent {
  saliendo = false;
  constructor(public theme: ThemeService, private auth: AuthService, private router: Router,
    private toast: ToastController, private cambios: ChangeDetectorRef) {
    addIcons({ logOutOutline, moonOutline, sunnyOutline });
  }

  async salir() {
    if (this.saliendo) return;
    this.saliendo = true;
    try {
      await this.auth.cerrarSesion();
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch {
      const aviso = await this.toast.create({ message: 'No pudimos cerrar la sesión. Inténtalo de nuevo.', duration: 3500, cssClass: 'toast-passiflora' });
      await aviso.present();
    } finally { this.saliendo = false; this.cambios.markForCheck(); }
  }
}
