import { Component, Input, OnChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonInput, IonTextarea, AlertController } from '@ionic/angular';
import { ContactoApoyo, ContactoApoyoService, MENSAJE_APOYO, contactoValido, enlaceWhatsApp } from '../../services/contacto-apoyo.service';

@Component({
  selector: 'app-contacto-apoyo', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonButton, IonInput, IonTextarea],
  template: `
    <section *ngIf="uid" class="contacto" [class.calma]="panico" aria-labelledby="titulo-contacto">
      <h2 id="titulo-contacto">Tu contacto de apoyo</h2>
      <p *ngIf="error" role="alert">{{ error }}</p>
      <ng-container *ngIf="!editando">
        <ng-container *ngIf="contacto">
          <p><strong>{{ contacto.nombre }}</strong> · {{ contacto.numero }}</p>
          <p class="mensaje">{{ contacto.mensaje }}</p>
          <a class="whatsapp" [href]="enlace" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
          <p class="nota">Se abrirá el chat con este mensaje preparado. Tú decides si lo envías. Necesitas conexión y una cuenta de WhatsApp.</p>
        </ng-container>
        <p *ngIf="!contacto">Elige a alguien de confianza y prepara un mensaje para pedir compañía cuando lo necesites.</p>
        <ion-button *ngIf="!panico" fill="clear" (click)="editar()">{{ contacto ? 'Editar contacto' : 'Configurar contacto' }}</ion-button>
        <ion-button *ngIf="!panico && contacto" fill="clear" (click)="eliminar()">Eliminar contacto</ion-button>
        <a *ngIf="panico" class="configurar" routerLink="/tabs/tab3">{{ contacto ? 'Editar en Mi espacio' : 'Configurar en Mi espacio' }}</a>
      </ng-container>
      <form *ngIf="editando && !panico" (ngSubmit)="guardar()">
        <ion-input label="Nombre del contacto" labelPlacement="stacked" name="nombreContacto" [(ngModel)]="nombre" [maxlength]="80"></ion-input>
        <ion-input label="Celular colombiano" labelPlacement="stacked" name="numeroContacto" type="tel" inputmode="numeric" [(ngModel)]="numero" [maxlength]="10" placeholder="3001234567"></ion-input>
        <p class="nota">10 dígitos, comenzando por 3. Escribe el número sin +57 ni espacios.</p>
        <ion-textarea label="Tu mensaje" labelPlacement="stacked" name="mensajeContacto" [(ngModel)]="mensaje" [maxlength]="500" [autoGrow]="true" rows="3"></ion-textarea>
        <ion-button type="submit" [disabled]="!valido">Guardar contacto</ion-button>
        <ion-button fill="clear" (click)="editando = false">Cancelar</ion-button>
      </form>
      <p *ngIf="!panico" class="nota">El contacto y el mensaje se guardan solo en este dispositivo y para esta cuenta. No se accede a tu agenda ni se envían mensajes automáticamente.</p>
      <p *ngIf="aviso" role="status">{{ aviso }}</p>
    </section>`,
  styles: [`
    .contacto { padding: 20px; margin: 24px 0; border-radius: 24px; background: var(--bg-tarjeta); color: var(--texto-principal); }
    h2 { font-size: 1.2rem; margin-top: 0; } p { line-height: 1.6; overflow-wrap: anywhere; }
    .nota { font-size: .85rem; color: var(--texto-secundario); }
    .mensaje { white-space: pre-wrap; }
    ion-input, ion-textarea { margin: 16px 0; --color: var(--texto-principal); }
    ion-button { --color: var(--color-primario); min-height: 44px; }
    ion-button[type=submit] { --background: var(--color-primario); --color: var(--texto-sobre-primario); }
    .whatsapp { display: inline-flex; padding: 12px 20px; border-radius: 16px; background: var(--color-primario); color: var(--texto-sobre-primario); font-weight: 800; text-decoration: none; min-height: 44px; align-items: center; }
    .configurar { display: inline-block; color: var(--color-primario); min-height: 44px; padding-block: 10px; font-weight: 800; }
    a:focus-visible { outline: 3px solid var(--color-primario); outline-offset: 4px; }
    .calma { --bg-tarjeta: #221c38; --texto-principal: #fff; --texto-secundario: #b4a7d6; --color-primario: #a594f9; --texto-sobre-primario: #121020; }
  `],
})
export class ContactoApoyoComponent implements OnChanges, OnDestroy {
  @Input() uid: string | null = null;
  @Input() panico = false;
  @Input() revision = 0;
  contacto: ContactoApoyo | null = null;
  nombre = ''; numero = ''; mensaje = MENSAJE_APOYO;
  error = ''; aviso = ''; editando = false;
  private version = 0;
  constructor(private servicio: ContactoApoyoService, private alertas: AlertController, private cambios: ChangeDetectorRef) {}
  ngOnDestroy() { this.version++; }
  ngOnChanges() {
    this.version++; this.contacto = null; this.editando = false; this.error = ''; this.aviso = '';
    this.nombre = ''; this.numero = ''; this.mensaje = MENSAJE_APOYO;
    if (!this.uid) return;
    try { this.contacto = this.servicio.leer(this.uid); }
    catch { this.error = 'No pudimos cargar el contacto. Puedes configurarlo de nuevo en Mi espacio.'; }
  }
  get enlace() { return this.contacto ? enlaceWhatsApp(this.contacto) : ''; }
  get valido() { return contactoValido({ nombre: this.nombre, numero: this.numero, mensaje: this.mensaje }); }
  editar() {
    this.nombre = this.contacto?.nombre ?? ''; this.numero = this.contacto?.numero ?? '';
    this.mensaje = this.contacto?.mensaje ?? MENSAJE_APOYO;
    this.editando = true; this.error = ''; this.aviso = '';
  }
  guardar() {
    if (!this.uid || !this.valido) return;
    try {
      this.contacto = this.servicio.guardar(this.uid, { nombre: this.nombre, numero: this.numero, mensaje: this.mensaje });
      this.editando = false; this.error = ''; this.aviso = 'Contacto guardado en este dispositivo.';
    } catch { this.error = 'No pudimos guardar el contacto. Revisa los datos y el almacenamiento disponible.'; }
    this.cambios.markForCheck();
  }
  async eliminar() {
    const uid = this.uid, version = this.version;
    if (!uid) return;
    const alerta = await this.alertas.create({ header: '¿Eliminar el contacto de apoyo?', cssClass: 'alerta-passiflora',
      buttons: [{ text: 'Conservar', role: 'cancel' }, { text: 'Eliminar', role: 'confirm' }] });
    await alerta.present();
    if ((await alerta.onDidDismiss()).role !== 'confirm' || version !== this.version) return;
    try { this.servicio.eliminar(uid); this.contacto = null; this.error = ''; this.aviso = 'Contacto eliminado.'; }
    catch { this.error = 'No pudimos eliminarlo. Inténtalo de nuevo.'; }
    this.cambios.markForCheck();
  }
}
