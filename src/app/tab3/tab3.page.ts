import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonDatetime, IonButton, IonRange, IonToast, IonLabel } from '@ionic/angular';
import { TabHeaderComponent } from '../shared/components/tab-header.component';
import { Subscription } from 'rxjs';
import { DiarioService, RegistroEmocional, registroValido } from '../services/diario.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

interface EmocionBase {
  nombre: string;
  emoji: string;
  color: string;
  colorFondo: string;
  subemociones: string[];
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    TabHeaderComponent,
    CommonModule,
    FormsModule,
    IonContent,
    IonDatetime,
    IonButton,
    IonRange,
    IonToast,
    IonLabel,
  ],
})
export class Tab3Page implements OnInit, OnDestroy {
  fechaSeleccionada = this.fechaLocal();
  uid: string | null = null;
  cargando = true;
  guardando = false;
  desdeCache = false;
  enLinea = navigator.onLine;
  errorHistorial = '';
  private versionSesion = 0;
  private cancelarSesion?: () => void;
  private historial?: Subscription;
  emocionSeleccionada: EmocionBase | null = null;
  subemocionSeleccionada: string = '';
  nivelIntensidad: number = 5;

  historialRegistros: RegistroEmocional[] = [];
  mensajeToast: string = '';
  mostrarToast: boolean = false;

  ruedaEmociones: EmocionBase[] = [
    {
      nombre: 'Felicidad',
      emoji: '😊',
      color: '#E09F3E',
      colorFondo: '#FFF3BF',
      subemociones: ['Optimista', 'Orgulloso', 'Esperanzado', 'Valiente', 'Pacífico', 'Inspirado'],
    },
    {
      nombre: 'Tristeza',
      emoji: '🥺',
      color: '#3A86FF',
      colorFondo: '#D0E1FD',
      subemociones: ['Solitario', 'Deprimido', 'Vulnerable', 'Apático', 'Apenado', 'Aislado'],
    },
    {
      nombre: 'Ira',
      emoji: '😤',
      color: '#E63946',
      colorFondo: '#FFCDD2',
      subemociones: ['Frustrado', 'Irritado', 'Enfurecido', 'Resentido', 'Celoso', 'Crítico'],
    },
    {
      nombre: 'Miedo',
      emoji: '😨',
      color: '#8338EC',
      colorFondo: '#E2D4F8',
      subemociones: ['Ansioso', 'Inseguro', 'Asustado', 'Humillado', 'Rechazado', 'Aterrado'],
    },
    {
      nombre: 'Sorpresa',
      emoji: '😲',
      color: '#00B4D8',
      colorFondo: '#CAF0F8',
      subemociones: ['Confundido', 'Asombrado', 'Entusiasmado', 'Atónito', 'Conmovido'],
    },
    {
      nombre: 'Asco',
      emoji: '🥴',
      color: '#38B000',
      colorFondo: '#D8F3DC',
      subemociones: ['Decepcionado', 'Evasivo', 'Sentencioso', 'Aborrecido', 'Indigno'],
    },
  ];

  constructor(
    private auth: Auth,
    private diario: DiarioService,
    private cambios: ChangeDetectorRef,
    private injector: Injector,
  ) {}

  ngOnInit() {
    this.cancelarSesion = runInInjectionContext(this.injector, () =>
      onAuthStateChanged(
        this.auth,
        (usuario) => {
          const nuevoUid = usuario?.uid ?? null;
          if (nuevoUid === this.uid && !this.cargando) return;
          this.versionSesion++;
          this.historial?.unsubscribe();
          this.uid = nuevoUid;
          this.historialRegistros = [];
          this.guardando = false;
          this.mostrarToast = false;
          this.limpiarFormulario();
          this.fechaSeleccionada = this.fechaLocal();
          this.cargarHistorial();
          this.cambios.markForCheck();
        },
        () => {
          this.versionSesion++;
          this.historial?.unsubscribe();
          this.uid = null;
          this.historialRegistros = [];
          this.guardando = false;
          this.cargando = false;
          this.limpiarFormulario();
          this.errorHistorial = 'No pudimos recuperar tu sesión. Vuelve a iniciar sesión.';
          this.cambios.markForCheck();
        },
      ),
    );
  }

  private fechaLocal(): string {
    const ahora = new Date();
    return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  ngOnDestroy() {
    this.versionSesion++;
    this.cancelarSesion?.();
    this.historial?.unsubscribe();
  }

  @HostListener('window:online') alConectar() {
    this.enLinea = true;
    this.cambios.markForCheck();
  }
  @HostListener('window:offline') alDesconectar() {
    this.enLinea = false;
    this.cambios.markForCheck();
  }

  seleccionarEmocion(emocion: EmocionBase) {
    this.emocionSeleccionada = emocion;
    this.subemocionSeleccionada = '';
  }

  seleccionarSubemocion(sub: string) {
    this.subemocionSeleccionada = sub;
  }

  obtenerEmojiIntensidad(): string {
    if (this.nivelIntensidad <= 3) return '🌱 Leve';
    if (this.nivelIntensidad <= 7) return '✨ Moderada';
    return '🔥 Intensa';
  }

  async guardarRegistro() {
    if (this.guardando) return;
    const uid = this.uid;
    if (!uid) {
      this.mostrarNotificacion('Inicia sesión para guardar tu registro.');
      return;
    }
    if (!this.enLinea) {
      this.mostrarNotificacion('Sin conexión. Conservamos tu selección para guardarla cuando vuelvas a conectarte.');
      return;
    }
    if (!this.emocionSeleccionada || !this.emocionSeleccionada.subemociones.includes(this.subemocionSeleccionada)) {
      this.mostrarNotificacion('Por favor, selecciona una emoción y su detalle.');
      return;
    }
    const datos = {
      fecha: typeof this.fechaSeleccionada === 'string' ? this.fechaSeleccionada.split('T')[0] : '',
      emocionPrincipal: this.emocionSeleccionada.nombre,
      emoji: this.emocionSeleccionada.emoji,
      subemocion: this.subemocionSeleccionada,
      intensidad: this.nivelIntensidad,
      color: this.emocionSeleccionada.color,
    };
    if (!registroValido(datos)) {
      this.mostrarNotificacion('Revisa la fecha y la intensidad, entre 1 y 10.');
      return;
    }
    const version = this.versionSesion;
    this.guardando = true;
    try {
      await this.diario.guardar(uid, datos);
      if (version !== this.versionSesion || uid !== this.uid) return;
      this.mostrarNotificacion('Tu registro se guardó en tu cuenta. 💜');
      this.limpiarFormulario();
    } catch {
      if (version !== this.versionSesion || uid !== this.uid) return;
      this.mostrarNotificacion('No pudimos guardar. Tu selección sigue aquí para que lo intentes de nuevo.');
    } finally {
      if (version === this.versionSesion) {
        this.guardando = false;
        this.cambios.markForCheck();
      }
    }
  }

  cargarHistorial() {
    this.historial?.unsubscribe();
    this.errorHistorial = '';
    this.desdeCache = false;
    if (!this.uid) {
      this.cargando = false;
      return;
    }
    const uid = this.uid;
    const version = this.versionSesion;
    this.cargando = true;
    this.historial = this.diario.observar(uid).subscribe({
      next: (estado) => {
        if (version !== this.versionSesion || uid !== this.uid) return;
        this.historialRegistros = estado.registros;
        this.desdeCache = estado.desdeCache;
        this.cargando = false;
        this.cambios.markForCheck();
      },
      error: () => {
        if (version !== this.versionSesion || uid !== this.uid) return;
        this.cargando = false;
        this.errorHistorial = 'No pudimos sincronizar tu historial. Revisa tu conexión o vuelve a intentarlo.';
        this.cambios.markForCheck();
      },
    });
  }

  limpiarFormulario() {
    this.emocionSeleccionada = null;
    this.subemocionSeleccionada = '';
    this.nivelIntensidad = 5;
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;
    this.cambios.markForCheck();
  }
}
