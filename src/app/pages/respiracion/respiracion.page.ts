import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  playOutline,
  pauseOutline,
  refreshOutline,
  leafOutline
} from 'ionicons/icons';

interface Fase {
  nombre: string;
  duracion: number;
  tipo: string;
}

interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  fases: Fase[];
}

@Component({
  selector: 'app-respiracion',
  templateUrl: './respiracion.page.html',
  styleUrls: ['./respiracion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon]
})
export class RespiracionPage implements OnDestroy {

  ejercicios: Ejercicio[] = [
    {
      id: 1,
      nombre: 'Respiración en caja',
      descripcion: 'Cuatro momentos para acompañar tu respiración.',
      fases: [
        { nombre: 'Inhala', duracion: 4, tipo: 'inhala' },
        { nombre: 'Mantén', duracion: 4, tipo: 'mantener-arriba' },
        { nombre: 'Exhala', duracion: 4, tipo: 'exhala' },
        { nombre: 'Mantén', duracion: 4, tipo: 'mantener-abajo' }
      ]
    },
    {
      id: 2,
      nombre: 'Respiración 6-4-8',
      descripcion: 'Un ritmo pausado de inhalación, pausa y exhalación.',
      fases: [
        { nombre: 'Inhala', duracion: 6, tipo: 'inhala' },
        { nombre: 'Mantén', duracion: 4, tipo: 'mantener-arriba' },
        { nombre: 'Exhala', duracion: 8, tipo: 'exhala' }
      ]
    }
  ];

  ejercicioSeleccionado: Ejercicio | null = null;

  faseActual = 0;
  tiempoRestante = 0;
  ciclos = 0;
  totalCiclos = 5;

  ejecutando = false;
  pausado = false;
  finalizado = false;

  private temporizador: ReturnType<typeof setInterval> | null = null;

constructor(
  private router: Router,
  private cdr: ChangeDetectorRef
) {
    addIcons({
      arrowBackOutline,
      playOutline,
      pauseOutline,
      refreshOutline,
      leafOutline
    });
  }

  seleccionarEjercicio(ejercicio: Ejercicio) {
    this.detenerTemporizador();

    this.ejercicioSeleccionado = ejercicio;
    this.reiniciar();
  }

 
iniciar() {
  if (!this.ejercicioSeleccionado || this.ejecutando) {
    return;
  }

  if (this.finalizado) {
    this.reiniciar();
  }

  if (!this.pausado) {
    this.tiempoRestante =
      this.ejercicioSeleccionado.fases[this.faseActual].duracion;
  }

  this.pausado = false;
  this.ejecutando = true;

  this.cdr.detectChanges();

  this.temporizador = setInterval(() => {

    this.avanzarTiempo();

    // Fuerza a Angular a actualizar la pantalla
    this.cdr.detectChanges();

  }, 1000);
}

 
private avanzarTiempo() {

  if (!this.ejercicioSeleccionado || !this.ejecutando) {
    return;
  }

  console.log('Tiempo restante:', this.tiempoRestante);

  if (this.tiempoRestante > 1) {

    this.tiempoRestante--;

  } else {

    this.cambiarFase();

  }
}


private cambiarFase() {

  if (!this.ejercicioSeleccionado) return;

  const fases = this.ejercicioSeleccionado.fases;

  if (this.faseActual === fases.length - 1) {

    this.ciclos++;

    if (this.ciclos >= this.totalCiclos) {

      this.detenerTemporizador();
      this.ejecutando = false;
      this.finalizado = true;

      return;
    }

    this.faseActual = 0;

  } else {

    this.faseActual++;

  }

  this.tiempoRestante = fases[this.faseActual].duracion;
}


  pausar() {
    this.detenerTemporizador();
    this.ejecutando = false;
    this.pausado = true;
  }

  finalizar() {
    this.detenerTemporizador();
    this.ejecutando = false;
    this.pausado = false;
    this.finalizado = true;
  }

  reiniciar() {
    this.detenerTemporizador();

    this.faseActual = 0;
    this.tiempoRestante = 0;
    this.ciclos = 0;

    this.ejecutando = false;
    this.pausado = false;
    this.finalizado = false;
  }

  elegirOtroEjercicio() {
    this.reiniciar();
    this.ejercicioSeleccionado = null;
  }

  volver() {
    this.detenerTemporizador();
    this.router.navigate(['/tabs/tab2']);
  }

  get faseNombre(): string {
    if (!this.ejercicioSeleccionado) return '';

    return this.ejercicioSeleccionado.fases[this.faseActual].nombre;
  }

  get claseAnimacion(): string {
    if (!this.ejercicioSeleccionado) return '';

    return this.ejercicioSeleccionado.fases[this.faseActual].tipo;
  }

  get duracionFase(): number {
    if (!this.ejercicioSeleccionado) return 4;

    return this.ejercicioSeleccionado.fases[this.faseActual].duracion;
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
