import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, leafOutline, heartOutline, chatbubbleEllipsesOutline, handLeftOutline, musicalNotesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-action-card', standalone: true, imports: [RouterLink, IonIcon],
  template: `
    <a class="action-card" [routerLink]="ruta" [queryParams]="parametros">
      <span class="icon-box"><ion-icon [name]="icono" aria-hidden="true"></ion-icon></span>
      <span class="copy">
        <span class="eyebrow">{{ etiqueta }}</span>
        <span class="title">{{ titulo }}</span>
        <span class="description">{{ descripcion }}</span>
      </span>
      <span class="arrow"><ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon></span>
    </a>`,
  styles: [`
    :host { display: block; }
    .action-card { display: flex; align-items: center; gap: 16px; padding: 22px 20px; border-radius: var(--radio-tarjeta); background: var(--bg-tarjeta); color: var(--texto-principal); text-decoration: none; box-shadow: var(--sombra-tarjeta); transition: transform .2s ease; }
    .action-card:active { transform: scale(.99); }
    .action-card:focus-visible { outline: 3px solid var(--color-primario); outline-offset: 4px; }
    .icon-box { display: grid; place-items: center; flex: 0 0 48px; height: 48px; border-radius: 16px; background: var(--bg-icono); color: var(--color-primario); }
    .icon-box ion-icon { font-size: 26px; }
    .copy { display: flex; flex-direction: column; gap: 5px; min-width: 0; flex: 1; }
    .eyebrow { font-size: .75rem; line-height: 1.4; letter-spacing: .06em; font-weight: 800; color: var(--texto-secundario); }
    .title { font-size: var(--texto-subtitulo); font-weight: 800; line-height: 1.3; }
    .description { font-size: var(--texto-cuerpo); color: var(--texto-secundario); line-height: 1.5; }
    .arrow { display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px; border-radius: 50%; background: var(--color-primario); color: var(--texto-sobre-primario); }
    .arrow ion-icon { font-size: 23px; }
    @media (max-width: 400px) { .action-card { gap: 12px; padding: 18px 14px; } .arrow { width: 32px; height: 32px; flex-basis: 32px; } }
    @media (prefers-reduced-motion: reduce) { .action-card { transition: none; } }
  `]
})
export class ActionCardComponent {
  @Input() ruta = '';
  @Input() parametros: Record<string, string> = {};
  @Input() titulo = '';
  @Input() descripcion = '';
  @Input() etiqueta = '';
  @Input() icono = 'leaf-outline';
  constructor() { addIcons({ arrowForwardOutline, leafOutline, heartOutline, chatbubbleEllipsesOutline, handLeftOutline, musicalNotesOutline }); }
}
