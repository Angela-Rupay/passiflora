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
          <div class="persona"><span class="avatar-contacto" aria-hidden="true">{{ contacto.nombre.charAt(0).toUpperCase() }}</span><div><strong>{{ contacto.nombre }}</strong><span class="telefono">{{ contacto.numero }}</span></div></div>
          <p class="etiqueta-mensaje">TU MENSAJE DE APOYO</p>
          <p class="mensaje">{{ contacto.mensaje }}</p>
          <a class="whatsapp" [href]="enlace" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
          <p class="nota">Tú decides cuándo enviar el mensaje en WhatsApp.</p>
        </ng-container>
        <p *ngIf="!contacto">Elige a alguien de confianza y prepara un mensaje para pedir compañía cuando lo necesites.</p>
        <div class="acciones-contacto">
        <ion-button *ngIf="!panico" fill="outline" (click)="editar()">{{ contacto ? 'Editar contacto' : 'Configurar contacto' }}</ion-button>
        <ion-button *ngIf="!panico && contacto" fill="clear" (click)="eliminar()">Eliminar contacto</ion-button>
        <a *ngIf="panico" class="configurar" routerLink="/tabs/tab3">{{ contacto ? 'Editar en Mi espacio' : 'Configurar en Mi espacio' }}</a>
        </div>
      </ng-container>
      <form *ngIf="editando && !panico" (ngSubmit)="guardar()">
        <ion-input label="Nombre del contacto" labelPlacement="stacked" fill="outline" name="nombreContacto" [(ngModel)]="nombre" [maxlength]="80"></ion-input>
        <ion-input label="Celular colombiano" labelPlacement="stacked" fill="outline" name="numeroContacto" type="tel" inputmode="numeric" [ngModel]="numero" (ngModelChange)="cambiarNumero($event)" (ionBlur)="telefonoTocado = true" [attr.aria-invalid]="telefonoTocado && !numeroValido" aria-describedby="ayuda-telefono error-telefono" placeholder="3001234567"></ion-input>
        <p id="ayuda-telefono" class="nota">10 dígitos, comenzando por 3. Escribe el número sin +57 ni espacios.</p>
        <p id="error-telefono" *ngIf="telefonoTocado && !numeroValido" class="error-campo" role="alert">{{ errorNumero }}</p>
        <ion-textarea label="Tu mensaje" labelPlacement="stacked" fill="outline" name="mensajeContacto" [(ngModel)]="mensaje" [maxlength]="500" [autoGrow]="true" rows="3"></ion-textarea>
        <div class="acciones-contacto">
        <ion-button type="submit" [disabled]="!valido">Guardar contacto</ion-button>
        <ion-button fill="clear" (click)="editando = false">Cancelar</ion-button>
        </div>
      </form>
      <p *ngIf="aviso" role="status">{{ aviso }}</p>
    </section>`,
  styles: [`
    .contacto { padding: 20px; margin: 24px 0; border-radius: 24px; background: var(--bg-tarjeta); color: var(--texto-principal); }
    h2 { font-size: 1.2rem; margin-top: 0; } p { line-height: 1.6; overflow-wrap: anywhere; }
    .nota { font-size: .85rem; color: var(--texto-secundario); }
    .persona { display: flex; align-items: center; gap: 14px; margin: 20px 0; }
    .avatar-contacto { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 16px; background: var(--bg-icono); color: var(--color-primario); font-weight: 800; flex-shrink: 0; }
    .telefono { display: block; color: var(--texto-secundario); font-size: .9rem; margin-top: 4px; }
    .etiqueta-mensaje { font-size: .75rem; font-weight: 800; color: var(--color-primario); letter-spacing: .04em; margin: 24px 0 8px; }
    .mensaje { white-space: pre-wrap; background: var(--bg-icono); border-radius: 16px; padding: 16px; margin-top: 0; }
    .acciones-contacto { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
    .error-campo { color: var(--ion-color-danger); font-size: .85rem; }
    [role=status] { font-size: .85rem; color: var(--color-primario); }
    .whatsapp { width: 100%; justify-content: center; }
    ion-button { --border-radius: 14px; --border-color: var(--color-primario); text-transform: none; font-weight: 800; }
    ion-input, ion-textarea { margin: 20px 0 8px; --color: var(--texto-principal); --border-color: var(--texto-secundario); --border-radius: 14px; --highlight-color-focused: var(--color-primario); --padding-start: 14px; --padding-end: 14px; }
    ion-button { --color: var(--color-primario); min-height: 44px; }
    ion-button[type=submit] { --background: var(--color-primario); --color: var(--texto-sobre-primario); }
    .whatsapp { display: inline-flex; padding: 12px 20px; border-radius: 16px; background: var(--color-primario); color: var(--texto-sobre-primario); font-weight: 800; text-decoration: none; min-height: 44px; align-items: center; }
    .configurar { display: inline-block; color: var(--color-primario); min-height: 44px; padding-block: 10px; font-weight: 800; }
    a:focus-visible { outline: 3px solid var(--color-primario); outline-offset: 4px; }
    .calma { --bg-tarjeta: #221c38; --bg-icono: #332952; --texto-principal: #fff; --texto-secundario: #b4a7d6; --color-primario: #a594f9; --texto-sobre-primario: #121020; }
  `],
})
export class ContactoApoyoComponent implements OnChanges, OnDestroy {
  @Input() uid: string | null = null;
  @Input() panico = false;
  @Input() revision = 0;
  contacto: ContactoApoyo | null = null;
  nombre = ''; numero = ''; mensaje = MENSAJE_APOYO;
  error = ''; aviso = ''; editando = false;
  telefonoTocado = false;
  get numeroValido() { return /^3\d{9}$/.test(this.numero); }
  get errorNumero() {
    if (!this.numero) return 'Escribe el celular de tu contacto.';
    if (!/^\d+$/.test(this.numero)) return 'Usa solo números, sin espacios ni +57.';
    if (this.numero.length !== 10) return 'El celular debe tener exactamente 10 dígitos.';
    return 'El celular colombiano debe comenzar por 3.';
  }
  cambiarNumero(valor: string) { this.numero = valor; this.telefonoTocado = true; }
  private version = 0;
  constructor(private servicio: ContactoApoyoService, private alertas: AlertController, private cambios: ChangeDetectorRef) {}
  ngOnDestroy() { this.version++; }
  ngOnChanges() {
    this.telefonoTocado = false;
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
    this.telefonoTocado = false;
    this.editando = true; this.error = ''; this.aviso = '';
  }
  guardar() {
    if (!this.uid || !this.valido) return;
    try {
      this.contacto = this.servicio.guardar(this.uid, { nombre: this.nombre, numero: this.numero, mensaje: this.mensaje });
      this.editando = false; this.error = ''; this.aviso = 'Contacto guardado.';
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
