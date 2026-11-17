import { ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, musicalNotesOutline, playOutline, pauseOutline, closeOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { JamendoService, PistaAmbiental } from '../../services/jamendo.service';

@Component({
  selector: 'app-ambientacion',
  standalone: true,
  templateUrl: './ambientacion.page.html',
  styleUrls: ['./ambientacion.page.scss'],
  imports: [CommonModule, RouterLink, IonContent, IonButton, IonIcon],
})
export class AmbientacionPage implements OnDestroy {
  @ViewChild('audio', { static: true }) reproductor?: ElementRef<HTMLAudioElement>;
  pistas: PistaAmbiental[] = [];
  activa: PistaAmbiental | null = null;
  cargando = false;
  reproduciendo = false;
  preparando = false;
  error = '';
  errorAudio = '';
  tiempo = 0;
  duracion = 0;
  private solicitud?: Subscription;
  private operacion = 0;

  constructor(
    private jamendo: JamendoService,
    private cambios: ChangeDetectorRef,
  ) {
    addIcons({ arrowBackOutline, musicalNotesOutline, playOutline, pauseOutline, closeOutline });
  }

  ionViewWillEnter() {
    this.cargar();
  }

  cargar() {
    this.solicitud?.unsubscribe();
    this.detener();
    this.cargando = true;
    this.error = '';
    this.pistas = [];
    this.solicitud = this.jamendo.listar().subscribe({
      next: (pistas) => {
        this.pistas = pistas;
        this.cargando = false;
        this.cambios.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.error = 'No pudimos cargar la música. Revisa tu conexión y vuelve a intentarlo.';
        this.cambios.markForCheck();
      },
    });
  }

  async alternar(pista: PistaAmbiental) {
    const audio = this.reproductor?.nativeElement;
    if (!audio) return;
    if (this.activa?.id === pista.id && (this.reproduciendo || this.preparando)) {
      this.operacion++;
      audio.pause();
      this.reproduciendo = false;
      this.preparando = false;
      return;
    }
    const turno = ++this.operacion;
    audio.pause();
    if (this.activa?.id !== pista.id || this.errorAudio) {
      this.activa = pista;
      this.tiempo = 0;
      this.duracion = pista.duracion;
      audio.src = pista.audioUrl;
      audio.load();
    }
    this.errorAudio = '';
    this.preparando = true;
    this.reproduciendo = false;
    try {
      await audio.play();
      if (turno !== this.operacion) return;
      this.reproduciendo = true;
      this.preparando = false;
    } catch {
      if (turno !== this.operacion) return;
      this.errorReproduccion();
    } finally {
      if (turno === this.operacion) this.cambios.markForCheck();
    }
  }

  actualizarTiempo() {
    const audio = this.reproductor?.nativeElement;
    if (!audio || !this.activa) return;
    this.tiempo = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    if (Number.isFinite(audio.duration) && audio.duration > 0) this.duracion = audio.duration;
    this.cambios.markForCheck();
  }

  alReproducir() {
    if (this.activa && this.reproductor?.nativeElement.paused === false) {
      this.reproduciendo = true;
      this.preparando = false;
      this.cambios.markForCheck();
    }
  }
  alPausar() {
    if (this.reproductor?.nativeElement.paused) {
      this.reproduciendo = false;
      this.preparando = false;
      this.cambios.markForCheck();
    }
  }
  alEsperar() {
    if (this.activa && this.reproductor?.nativeElement.paused === false) {
      this.preparando = true;
      this.cambios.markForCheck();
    }
  }
  alTerminar() {
    this.reproduciendo = false;
    this.preparando = false;
    this.cambios.markForCheck();
  }
  errorReproduccion() {
    if (!this.activa) return;
    this.reproduciendo = false;
    this.preparando = false;
    this.errorAudio = 'No pudimos reproducir esta pista. Revisa tu conexión o elige otra.';
    this.cambios.markForCheck();
  }

  formatoTiempo(segundos: number): string {
    const total = Math.max(0, Math.floor(Number.isFinite(segundos) ? segundos : 0));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  detener() {
    this.operacion++;
    this.activa = null;
    this.reproduciendo = false;
    this.preparando = false;
    this.errorAudio = '';
    this.tiempo = 0;
    this.duracion = 0;
    const audio = this.reproductor?.nativeElement;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }

  ionViewWillLeave() {
    this.solicitud?.unsubscribe();
    this.detener();
  }
  ngOnDestroy() {
    this.solicitud?.unsubscribe();
    this.detener();
  }
}
