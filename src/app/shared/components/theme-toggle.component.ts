import { Component, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [IonButton, IonIcon],
  template: `<ion-button fill="clear" (click)="theme.toggleTema()"
    [attr.aria-label]="theme.modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'">
    <ion-icon slot="icon-only" [name]="theme.modoOscuro ? 'sunny-outline' : 'moon-outline'"></ion-icon>
  </ion-button>`,
  styles: [`:host { display: flex; justify-content: flex-end; }
    ion-button { --color: var(--color-primario); --background-hover: var(--bg-icono); min-width: 48px; min-height: 48px; }
    ion-icon { font-size: 26px; }`],
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
  constructor() { addIcons({ moonOutline, sunnyOutline }); }
}
