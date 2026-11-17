import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonSpinner,
  IonRange,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  musicalNotesOutline,
  play,
  pause,
  playSkipBackOutline,
  playSkipForwardOutline,
  volumeHighOutline,
  volumeMuteOutline,
  leafOutline,
  sparklesOutline,
  waterOutline,
  moonOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { JamendoService, JamendoTrack } from '../../services/jamendo.service';

@Component({
  selector: 'app-sonidos-relajacion',
  templateUrl: './sonidos-relajacion.page.html',
  styleUrls: ['./sonidos-relajacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    IonSpinner,
    IonRange,
  ],
})
export class SonidosRelajacionPage implements OnInit, OnDestroy {
  pistas: JamendoTrack[] = [];
  pistaActual: JamendoTrack | null = null;
  indiceActual: number = -1;

  cargando: boolean = true;
  errorCarga: string = '';
  categoriaSeleccionada: string = 'relaxation';

  categorias = [
    { id: 'relaxation', nombre: 'Calma', icono: 'leaf-outline' },
    { id: 'nature', nombre: 'Naturaleza', icono: 'water-outline' },
    { id: 'meditation', nombre: 'Meditación', icono: 'sparkles-outline' },
    { id: 'ambient', nombre: 'Ambiente', icono: 'moon-outline' },
  ];

  // Control de audio HTML5
  private audio = new Audio();
  reproduciendo: boolean = false;
  silenciado: boolean = false;
  tiempoActual: number = 0;
  duracionTotal: number = 0;

  // Guía suave de respiración y anclaje
  faseRespiracion: 'Inhala suave...' | 'Sostén un instante...' | 'Exhala lento...' = 'Inhala suave...';
  estadoPulso: 'inhale' | 'hold' | 'exhale' = 'inhale';
  private cicloTimer: any;

  constructor(
    private jamendoService: JamendoService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      musicalNotesOutline,
      play,
      pause,
      playSkipBackOutline,
      playSkipForwardOutline,
      volumeHighOutline,
      volumeMuteOutline,
      leafOutline,
      sparklesOutline,
      waterOutline,
      moonOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {
    this.configurarEventosAudio();
    this.cargarPistas(this.categoriaSeleccionada);
    this.iniciarGuiaRespiracion();
  }

  ngOnDestroy() {
    this.detenerAudio();
    if (this.cicloTimer) {
      clearTimeout(this.cicloTimer);
    }
  }

  cargarPistas(tag: string) {
    this.categoriaSeleccionada = tag;
    this.cargando = true;
    this.errorCarga = '';
    this.cdr.detectChanges();

    this.jamendoService.obtenerSonidosRelajacion(tag).subscribe({
      next: (tracks) => {
        this.pistas = tracks;
        this.cargando = false;
        if (tracks.length > 0 && !this.pistaActual) {
          this.prepararPista(0, false);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.errorCarga =
          'No pudimos conectar con Jamendo en este momento. Verifica tu conexión o tu Client ID.';
        this.cdr.detectChanges();
      },
    });
  }

  private configurarEventosAudio() {
    this.audio.addEventListener('timeupdate', () => {
      this.tiempoActual = this.audio.currentTime;
      this.cdr.detectChanges();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duracionTotal = this.audio.duration || (this.pistaActual?.duration ?? 0);
      this.cdr.detectChanges();
    });

    this.audio.addEventListener('ended', () => {
      this.siguientePista();
    });
  }

  prepararPista(indice: number, autoPlay: boolean = true) {
    if (indice < 0 || indice >= this.pistas.length) return;

    this.indiceActual = indice;
    this.pistaActual = this.pistas[indice];
    this.audio.src = this.pistaActual.audio;
    this.audio.load();
    this.tiempoActual = 0;
    this.duracionTotal = this.pistaActual.duration;

    if (autoPlay) {
      this.audio
        .play()
        .then(() => {
          this.reproduciendo = true;
          this.cdr.detectChanges();
        })
        .catch(() => {
          this.reproduciendo = false;
          this.cdr.detectChanges();
        });
    } else {
      this.reproduciendo = false;
      this.cdr.detectChanges();
    }
  }

  alternarReproduccion() {
    if (!this.pistaActual && this.pistas.length > 0) {
      this.prepararPista(0, true);
      return;
    }

    if (this.reproduciendo) {
      this.audio.pause();
      this.reproduciendo = false;
      this.cdr.detectChanges();
    } else {
      this.audio
        .play()
        .then(() => {
          this.reproduciendo = true;
          this.cdr.detectChanges();
        })
        .catch(() => {
          this.reproduciendo = false;
          this.cdr.detectChanges();
        });
    }
  }

  siguientePista() {
    if (this.pistas.length === 0) return;
    const siguiente = (this.indiceActual + 1) % this.pistas.length;
    this.prepararPista(siguiente, true);
  }

  anteriorPista() {
    if (this.pistas.length === 0) return;
    const anterior = (this.indiceActual - 1 + this.pistas.length) % this.pistas.length;
    this.prepararPista(anterior, true);
  }

  cambiarProgreso(event: any) {
    const nuevoTiempo = event.detail.value;
    if (!isNaN(nuevoTiempo)) {
      this.audio.currentTime = nuevoTiempo;
      this.tiempoActual = nuevoTiempo;
      this.cdr.detectChanges();
    }
  }

  alternarSilencio() {
    this.silenciado = !this.silenciado;
    this.audio.muted = this.silenciado;
    this.cdr.detectChanges();
  }

  private detenerAudio() {
    this.audio.pause();
    this.audio.src = '';
    this.reproduciendo = false;
  }

  formatearTiempo(segundos: number): string {
    if (!segundos || isNaN(segundos)) return '0:00';
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  // Ciclo suave 4s inhalar - 2s sostener - 6s exhalar para acompañar el audio
  private iniciarGuiaRespiracion() {
    const ejecutarCiclo = () => {
      this.faseRespiracion = 'Inhala suave...';
      this.estadoPulso = 'inhale';
      this.cdr.detectChanges();

      this.cicloTimer = setTimeout(() => {
        this.faseRespiracion = 'Sostén un instante...';
        this.estadoPulso = 'hold';
        this.cdr.detectChanges();

        this.cicloTimer = setTimeout(() => {
          this.faseRespiracion = 'Exhala lento...';
          this.estadoPulso = 'exhale';
          this.cdr.detectChanges();

          this.cicloTimer = setTimeout(() => {
            ejecutarCiclo();
          }, 6000);
        }, 2000);
      }, 4000);
    };

    ejecutarCiclo();
  }
}