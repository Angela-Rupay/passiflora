import { ChangeDetectorRef, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, playOutline, pauseOutline, refreshOutline } from 'ionicons/icons';

type TipoFase = 'inhala' | 'segunda-inhalacion' | 'mantener' | 'exhala';
interface Fase {
  nombre: string;
  duracion: number;
  tipo: TipoFase;
}
export interface Ejercicio {
  id: 'caja' | '478' | 'suspiro' | 'diafragmatica';
  nombre: string;
  descripcion: string;
  instrucciones: string;
  ciclos: number;
  fases: Fase[];
}

@Component({
  selector: 'app-respiracion',
  templateUrl: './respiracion.page.html',
  styleUrls: ['./respiracion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
})
export class RespiracionPage implements OnDestroy {
  readonly ejercicios: Ejercicio[] = [
    {
      id: 'caja',
      nombre: 'Respiración en caja',
      descripcion: 'Para recuperar el control en momentos de alta exigencia.',
      instrucciones:
        'Inhala, mantén, exhala y mantén de nuevo. Cada lado del cuadrado acompaña una fase de 4 segundos.',
      ciclos: 4,
      fases: [
        { nombre: 'Inhala', duracion: 4, tipo: 'inhala' },
        { nombre: 'Mantén', duracion: 4, tipo: 'mantener' },
        { nombre: 'Exhala', duracion: 4, tipo: 'exhala' },
        { nombre: 'Mantén', duracion: 4, tipo: 'mantener' },
      ],
    },
    {
      id: '478',
      nombre: 'Respiración 4-7-8',
      descripcion: 'Un método guiado para calmar el sistema nervioso.',
      instrucciones:
        'Inhala suavemente por la nariz durante 4 segundos, mantén 7 y exhala despacio por la boca durante 8. Puedes parar si este ritmo no te resulta cómodo.',
      ciclos: 4,
      fases: [
        { nombre: 'Inhala', duracion: 4, tipo: 'inhala' },
        { nombre: 'Mantén', duracion: 7, tipo: 'mantener' },
        { nombre: 'Exhala', duracion: 8, tipo: 'exhala' },
      ],
    },
    {
      id: 'suspiro',
      nombre: 'Suspiro fisiológico',
      descripcion: 'Una pausa breve para soltar tensión en hombros y mandíbula.',
      instrucciones:
        'Inhala por la nariz y añade una segunda inhalación corta. Después exhala larga y suavemente por la boca. Relaja hombros y mandíbula. Puedes terminar tras 3 a 5 repeticiones; esta guía propone 5.',
      ciclos: 5,
      fases: [
        { nombre: 'Inhala', duracion: 3, tipo: 'inhala' },
        { nombre: 'Inhala un poco más', duracion: 1, tipo: 'segunda-inhalacion' },
        { nombre: 'Exhala suave', duracion: 6, tipo: 'exhala' },
      ],
    },
    {
      id: 'diafragmatica',
      nombre: 'Respiración diafragmática',
      descripcion: 'Para acompañarte si sientes tensión u opresión en el pecho.',
      instrucciones:
        'Siéntate o acuéstate cómodamente. Coloca una mano en el abdomen y otra en el pecho. Inhala despacio por la nariz sintiendo cómo se eleva el abdomen y exhala suavemente por la boca. El pecho se mueve lo menos posible. Duración: 2 minutos.',
      ciclos: 12,
      fases: [
        { nombre: 'Eleva el abdomen', duracion: 4, tipo: 'inhala' },
        { nombre: 'Suelta el aire', duracion: 6, tipo: 'exhala' },
      ],
    },
  ];
  ejercicioSeleccionado: Ejercicio | null = null;
  faseActual = 0;
  tiempoRestante = 0;
  ciclos = 0;
  ejecutando = false;
  pausado = false;
  finalizado = false;
  terminadoAntes = false;
  progresoFase = 0;
  transcurridoMs = 0;
  private ultimoTick = 0;
  private temporizador: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private cambios: ChangeDetectorRef,
  ) {
    addIcons({ arrowBackOutline, playOutline, pauseOutline, refreshOutline });
  }

  seleccionarEjercicio(ejercicio: Ejercicio) {
    this.reiniciar();
    this.ejercicioSeleccionado = ejercicio;
    this.actualizarEstado();
  }
  get totalCiclos(): number {
    return this.ejercicioSeleccionado?.ciclos ?? 0;
  }
  get duracionCicloMs(): number {
    return (this.ejercicioSeleccionado?.fases.reduce((s, f) => s + f.duracion, 0) ?? 0) * 1000;
  }
  get duracionTotalMs(): number {
    return this.duracionCicloMs * this.totalCiclos;
  }
  get faseNombre(): string {
    return this.ejercicioSeleccionado?.fases[this.faseActual]?.nombre ?? '';
  }
  get progreso(): number {
    return this.duracionTotalMs ? this.transcurridoMs / this.duracionTotalMs : 0;
  }
  get segundosRestantes(): number {
    return Math.max(0, Math.ceil((this.duracionTotalMs - this.transcurridoMs) / 1000));
  }
  get progresoCuadrado(): number {
    return (this.faseActual + this.progresoFase) / 4;
  }
  get puntoCuadrado(): { x: number; y: number } {
    const p = this.progresoFase * 160;
    return (
      [
        { x: 20 + p, y: 20 },
        { x: 180, y: 20 + p },
        { x: 180 - p, y: 180 },
        { x: 20, y: 180 - p },
      ][this.faseActual] ?? { x: 20, y: 20 }
    );
  }
  get escala(): number {
    const tipo = this.ejercicioSeleccionado?.fases[this.faseActual]?.tipo;
    if (tipo === 'inhala')
      return 0.72 + (this.ejercicioSeleccionado?.id === 'suspiro' ? 0.18 : 0.28) * this.progresoFase;
    if (tipo === 'segunda-inhalacion') return 0.9 + 0.1 * this.progresoFase;
    if (tipo === 'exhala') return 1 - 0.28 * this.progresoFase;
    return 1;
  }

  iniciar() {
    if (!this.ejercicioSeleccionado || this.ejecutando) return;
    if (this.finalizado) this.reiniciar();
    this.pausado = false;
    this.ejecutando = true;
    this.ultimoTick = Date.now();
    this.actualizarEstado();
    this.temporizador = setInterval(() => {
      this.sincronizar();
      this.cambios.markForCheck();
    }, 50);
  }

  private sincronizar() {
    if (!this.ejecutando) return;
    const ahora = Date.now();
    this.transcurridoMs = Math.min(this.duracionTotalMs, this.transcurridoMs + Math.max(0, ahora - this.ultimoTick));
    this.ultimoTick = ahora;
    this.actualizarEstado();
    if (this.transcurridoMs >= this.duracionTotalMs) {
      this.detenerTemporizador();
      this.ejecutando = false;
      this.pausado = false;
      this.finalizado = true;
    }
  }

  private actualizarEstado() {
    const ejercicio = this.ejercicioSeleccionado;
    if (!ejercicio) return;
    this.ciclos = Math.min(ejercicio.ciclos, Math.floor(this.transcurridoMs / this.duracionCicloMs));
    if (this.transcurridoMs >= this.duracionTotalMs) {
      this.faseActual = ejercicio.fases.length - 1;
      this.progresoFase = 1;
      this.tiempoRestante = 0;
      return;
    }
    let dentro = this.transcurridoMs % this.duracionCicloMs;
    for (let i = 0; i < ejercicio.fases.length; i++) {
      const duracion = ejercicio.fases[i].duracion * 1000;
      if (dentro < duracion) {
        this.faseActual = i;
        this.progresoFase = dentro / duracion;
        this.tiempoRestante = Math.ceil((duracion - dentro) / 1000);
        return;
      }
      dentro -= duracion;
    }
  }

  pausar() {
    if (!this.ejecutando) return;
    this.sincronizar();
    this.detenerTemporizador();
    if (!this.finalizado) {
      this.ejecutando = false;
      this.pausado = true;
    }
    this.cambios.markForCheck();
  }
  finalizar() {
    this.pausar();
    if (!this.finalizado) {
      this.finalizado = true;
      this.terminadoAntes = true;
      this.pausado = false;
    }
  }
  reiniciar() {
    this.detenerTemporizador();
    this.transcurridoMs = 0;
    this.faseActual = 0;
    this.tiempoRestante = 0;
    this.ciclos = 0;
    this.progresoFase = 0;
    this.ejecutando = false;
    this.pausado = false;
    this.finalizado = false;
    this.terminadoAntes = false;
    this.actualizarEstado();
  }
  elegirOtroEjercicio() {
    this.reiniciar();
    this.ejercicioSeleccionado = null;
  }
  volver() {
    this.pausar();
    void this.router.navigate(['/tabs/tab2']);
  }
  ionViewWillLeave() {
    this.pausar();
  }
  @HostListener('document:visibilitychange') alCambiarVisibilidad() {
    if (document.hidden) this.pausar();
  }
  private detenerTemporizador() {
    if (this.temporizador !== null) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }
  ngOnDestroy() {
    this.detenerTemporizador();
  }
}
