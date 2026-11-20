import { Component, Input, OnChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonInput, AlertController } from '@ionic/angular';
import { AuthService, Usuario } from '../../services/auth.service';
import { CamaraService } from '../../services/camara.service';
import { SoloLetrasDirective } from '../solo-letras.directive';
import { PATRON_NOMBRE } from '../auth-validation';

@Component({
  selector: 'app-perfil', standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonInput, SoloLetrasDirective],
  template: `
    <section class="perfil" *ngIf="uid" aria-labelledby="titulo-perfil">
      <div class="cabecera">
        <img [src]="avatar || 'assets/img/flor-passiflora.png'" alt="Tu foto de perfil" />
        <div><p class="eyebrow">MI PERFIL</p><h2 id="titulo-perfil">{{ perfil?.nombre || 'Tu espacio personal' }}</h2>
          <p class="correo">{{ perfil?.correo }}</p></div>
      </div>
      <p *ngIf="cargando" role="status">Cargando tu perfil…</p>
      <p *ngIf="error" role="alert">{{ error }}</p>
      <ion-button *ngIf="!perfil && !cargando" fill="clear" (click)="cargar()">Volver a cargar</ion-button>
      <ion-button *ngIf="perfil && !editando" fill="outline" (click)="editar()">Editar perfil</ion-button>
      <form *ngIf="editando" (ngSubmit)="guardar()">
        <ion-input label="Nombre" labelPlacement="stacked" name="nombrePerfil" [(ngModel)]="nombres" soloLetras [disabled]="guardando" autocomplete="given-name"></ion-input>
        <ion-input label="Apellido" labelPlacement="stacked" name="apellidoPerfil" [(ngModel)]="apellido" soloLetras [disabled]="guardando" autocomplete="family-name"></ion-input>
        <p class="nota">Nombre y apellido deben tener al menos 4 letras, sin números. Revisa ambos campos si tu cuenta es anterior.</p>
        <div class="acciones">
          <ion-button type="submit" [disabled]="!valido || guardando">{{ guardando ? 'Guardando…' : 'Guardar cambios' }}</ion-button>
          <ion-button fill="clear" (click)="editando = false" [disabled]="guardando">Cancelar</ion-button>
        </div>
      </form>
      <div class="acciones">
        <ion-button fill="clear" (click)="cambiarFoto(true)" [disabled]="ocupada">Tomar foto</ion-button>
        <ion-button fill="clear" (click)="cambiarFoto(false)" [disabled]="ocupada">Elegir foto</ion-button>
        <ion-button *ngIf="avatar" fill="clear" (click)="quitarFoto()" [disabled]="ocupada">Quitar foto</ion-button>
      </div>
      <p class="nota">Tu foto se guarda solo en este dispositivo y para esta cuenta. Puedes perderla si borras los datos de la app o la desinstalas.</p>
      <p *ngIf="mensaje" role="status">{{ mensaje }}</p>
    </section>`,
  styles: [`
    .perfil { background: var(--bg-tarjeta); color: var(--texto-principal); border-radius: 24px; padding: 20px; margin-bottom: 28px; }
    .cabecera { display: flex; align-items: center; gap: 16px; }
    .cabecera > div { min-width: 0; }
    img { width: 72px; height: 72px; flex-shrink: 0; border-radius: 50%; object-fit: cover; background: var(--bg-icono); }
    h2 { margin: 4px 0; overflow-wrap: anywhere; }
    p { color: var(--texto-secundario); }
    .correo { overflow-wrap: anywhere; } .nota { font-size: .85rem; }
    .eyebrow { font-size: .8rem; color: var(--color-primario); font-weight: 800; margin: 0; }
    .acciones { display: flex; flex-wrap: wrap; gap: 4px; }
    ion-button { --color: var(--color-primario); --border-color: var(--color-primario); min-height: 44px; }
    ion-button[type=submit] { --background: var(--color-primario); --color: var(--texto-sobre-primario); }
    ion-input { margin-top: 16px; --color: var(--texto-principal); }
  `],
})
export class PerfilComponent implements OnChanges, OnDestroy {
  @Input() uid: string | null = null;
  perfil: Usuario | null = null;
  avatar = ''; nombres = ''; apellido = ''; error = ''; mensaje = '';
  cargando = false; editando = false; guardando = false; ocupada = false;
  private version = 0;
  constructor(private auth: AuthService, private camara: CamaraService,
    private alertas: AlertController, private cambios: ChangeDetectorRef) {}
  ngOnChanges() { void this.cargar(); }
  ngOnDestroy() { this.version++; }
  private clave(uid: string) { return `passiflora:avatar:v1:${uid}`; }
  async cargar() {
    const version = ++this.version;
    const uid = this.uid;
    this.perfil = null; this.avatar = ''; this.error = ''; this.mensaje = '';
    this.editando = false; this.guardando = false; this.ocupada = false;
    if (!uid) return;
    this.cargando = true;
    try {
      const foto = localStorage.getItem(this.clave(uid));
      if (foto && /^data:image\/(jpeg|png|webp);base64,/.test(foto)) this.avatar = foto;
      const perfil = await this.auth.obtenerPerfil(uid);
      if (version !== this.version) return;
      this.perfil = perfil;
      if (!perfil) this.error = 'No encontramos tu perfil. Intenta cargar de nuevo.';
    } catch { if (version === this.version) this.error = 'No pudimos cargar tu perfil. Revisa tu conexión.'; }
    finally { if (version === this.version) { this.cargando = false; this.cambios.markForCheck(); } }
  }
  editar() {
    const partes = this.perfil!.nombre.trim().split(/\s+/);
    this.apellido = this.perfil!.apellido ?? (partes.length > 1 ? partes.pop()! : '');
    this.nombres = this.perfil!.nombres ?? partes.join(' ');
    this.editando = true; this.error = ''; this.mensaje = '';
  }
  get valido() {
    return [this.nombres, this.apellido].every(valor => PATRON_NOMBRE.test(valor.trim()) && (valor.match(/\p{L}/gu)?.length ?? 0) >= 4);
  }
  async guardar() {
    if (!this.uid || !this.valido || this.guardando) return;
    const uid = this.uid, version = this.version;
    const nombres = this.nombres.trim(), apellido = this.apellido.trim();
    this.guardando = true; this.error = ''; this.mensaje = '';
    try {
      await this.auth.actualizarPerfil(uid, nombres, apellido);
      if (version !== this.version) return;
      this.perfil = { ...this.perfil!, nombres, apellido, nombre: `${nombres} ${apellido}` };
      this.editando = false; this.mensaje = 'Tu perfil se actualizó.';
    } catch { if (version === this.version) this.error = 'No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.'; }
    finally { if (version === this.version) { this.guardando = false; this.cambios.markForCheck(); } }
  }
  async cambiarFoto(tomar: boolean) {
    if (!this.uid || this.ocupada) return;
    const uid = this.uid, version = this.version;
    this.ocupada = true; this.error = ''; this.mensaje = '';
    try {
      if (tomar) {
        const aviso = await this.alertas.create({ header: 'Tu foto de perfil',
          message: 'Para tomar tu foto necesitamos tu autorización para usar la cámara. Se guardará solo en este dispositivo.',
          cssClass: 'alerta-passiflora', buttons: [{ text: 'Ahora no', role: 'cancel' }, { text: 'Aceptar', role: 'confirm' }] });
        await aviso.present();
        if ((await aviso.onDidDismiss()).role !== 'confirm' || version !== this.version) return;
      }
      const foto = tomar ? await this.camara.capturar() : await this.camara.elegirAvatar();
      if (!foto || version !== this.version) return;
      if (foto.length > 2500000) throw new Error('La foto es demasiado grande. Elige otra imagen.');
      localStorage.setItem(this.clave(uid), foto);
      this.avatar = foto; this.mensaje = 'Foto guardada en este dispositivo.';
    } catch (error) { if (version === this.version) this.error = error instanceof Error ? error.message : 'No pudimos guardar la foto.'; }
    finally { if (version === this.version) { this.ocupada = false; this.cambios.markForCheck(); } }
  }
  quitarFoto() {
    if (!this.uid) return;
    try { localStorage.removeItem(this.clave(this.uid)); this.avatar = ''; this.mensaje = 'Foto eliminada de este dispositivo.'; }
    catch { this.error = 'No pudimos quitar la foto. Inténtalo de nuevo.'; }
  }
}
