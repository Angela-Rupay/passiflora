import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon, ToastController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, moonOutline, sunnyOutline, alertCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-tab-header',
  standalone: true,
  imports: [IonButton, IonIcon],
  template: ` <header class="tab-header">
    <img src="assets/img/flor-passiflora.png" alt="Passiflora" width="52" height="52" />
    <div class="actions">
      <ion-button
        class="panico"
        fill="solid"
        (click)="abrirPanico()"
        [disabled]="abriendoPanico"
        aria-label="Botón de pánico: abrir espacio de calma"
      >
        <ion-icon slot="icon-only" name="alert-circle-outline"></ion-icon>
      </ion-button>
      <ion-button
        fill="clear"
        (click)="theme.toggleTema()"
        [attr.aria-label]="theme.modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'"
      >
        <ion-icon slot="icon-only" [name]="theme.modoOscuro ? 'sunny-outline' : 'moon-outline'"></ion-icon>
      </ion-button>
      <ion-button fill="clear" class="logout" (click)="salir()" [disabled]="saliendo" aria-label="Cerrar sesión">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </div>
  </header>`,
  styles: [
    `
      :host {
        display: block;
      }
      .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;
      }
      img {
        width: 52px;
        height: 52px;
        object-fit: contain;
        padding: 5px;
        border-radius: 50%;
        background: var(--bg-tarjeta);
      }
      .actions {
        display: flex;
        gap: 4px;
      }
      ion-button {
        --color: var(--color-primario);
        --background-hover: var(--bg-icono);
        --background-activated: var(--bg-icono);
        min-width: 48px;
        min-height: 48px;
        margin: 0;
      }
      ion-icon {
        font-size: 26px;
      }
      .panico {
        --background: var(--ion-color-danger);
        --background-hover: var(--ion-color-danger);
        --background-activated: var(--ion-color-danger);
        --color: #ffffff;
        --border-radius: 50%;
      }
      .logout {
        --color: var(--ion-color-danger);
      }
    `,
  ],
})
export class TabHeaderComponent {
  saliendo = false;
  abriendoPanico = false;
  constructor(
    public theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastController,
    private cambios: ChangeDetectorRef,
    private alertas: AlertController,
  ) {
    addIcons({ logOutOutline, moonOutline, sunnyOutline, alertCircleOutline });
  }

  async abrirPanico() {
    if (this.abriendoPanico) return;
    this.abriendoPanico = true;
    try {
      const alerta = await this.alertas.create({
        header: '¿Entrar a tu espacio de calma?',
        message: 'Elige una herramienta para acompañarte en este momento.',
        cssClass: 'alerta-passiflora',
        buttons: [
          { text: 'Seguir aquí', role: 'cancel' },
          {
            text: 'Entrar',
            handler: () => {
              void this.router.navigateByUrl('/panico');
            },
          },
        ],
      });
      await alerta.present();
      await alerta.onDidDismiss();
    } finally {
      this.abriendoPanico = false;
      this.cambios.markForCheck();
    }
  }

  async salir() {
    if (this.saliendo) return;
    this.saliendo = true;
    try {
      await this.auth.cerrarSesion();
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch {
      const aviso = await this.toast.create({
        message: 'No pudimos cerrar la sesión. Inténtalo de nuevo.',
        duration: 3500,
        cssClass: 'toast-passiflora',
      });
      await aviso.present();
    } finally {
      this.saliendo = false;
      this.cambios.markForCheck();
    }
  }
}
