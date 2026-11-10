
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
  IonContent,
  IonButton
} from '@ionic/angular';

@Component({
  selector: 'app-gad7',
  templateUrl: './gad7.page.html',
  styleUrls: ['./gad7.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton
  ]
})
export class Gad7Page {

  nombreUsuario = 'Usuario';

  preguntas = [
    'Sentirse nervioso, ansioso o con los nervios de punta.',
    'No poder dejar de preocuparse o controlar la preocupación.',
    'Preocuparse demasiado por diferentes cosas.',
    'Dificultad para relajarse.',
    'Estar tan inquieto que es difícil mantenerse sentado.',
    'Sentirse fácilmente molesto o irritable.',
    'Sentir miedo como si algo terrible fuera a pasar.'
  ];

  opciones = [
    { valor: 0, texto: 'Nunca / Para nada' },
    { valor: 1, texto: 'Varios días' },
    { valor: 2, texto: 'Más de la mitad de los días' },
    { valor: 3, texto: 'Casi todos los días' }
  ];

  respuestas: (number | null)[] = Array(7).fill(null);

  resultadoVisible = false;
  puntajeTotal = 0;
  nivel = '';
  mensaje = '';

  constructor(private route: ActivatedRoute) {
    this.nombreUsuario =
      this.route.snapshot.queryParamMap.get('nombre') || 'Usuario';
  }

  seleccionarRespuesta(pregunta: number, valor: number) {
    this.respuestas[pregunta] = valor;
  }

  get todasRespondidas(): boolean {
    return this.respuestas.every(r => r !== null);
  }

   get cantidadRespondidas(): number {
   return this.respuestas.filter(r => r !== null).length;
  }

  calcularResultado() {

    if (!this.todasRespondidas) return;

    this.puntajeTotal = this.respuestas.reduce<number>(
   (total, respuesta) => total + (respuesta === null ? 0 : respuesta),
   0);

    if (this.puntajeTotal <= 4) {
      this.nivel = 'Mínimo o ausente';
      this.mensaje =
        'Tus respuestas indican pocos síntomas de ansiedad. Continúa cultivando hábitos de autocuidado y prestando atención a tu bienestar emocional.';
    } 
    else if (this.puntajeTotal <= 9) {
      this.nivel = 'Leve';
      this.mensaje =
        'Tus respuestas indican síntomas leves de ansiedad. Reconocer cómo te sientes es un primer paso importante para cuidar tu bienestar.';
    } 
    else if (this.puntajeTotal <= 14) {
      this.nivel = 'Moderado';
      this.mensaje =
        'Tus respuestas sugieren síntomas moderados de ansiedad. Te recomendamos consultar con un profesional de salud mental para recibir una valoración integral.';
    } 
    else {
      this.nivel = 'Severo';
      this.mensaje =
        'Tus respuestas sugieren síntomas elevados de ansiedad. Es importante buscar acompañamiento profesional de salud mental para recibir el apoyo adecuado.';
    }

    this.resultadoVisible = true;

  }

  volverAResponder() {
    this.respuestas = Array(7).fill(null);
    this.resultadoVisible = false;
    this.puntajeTotal = 0;
    this.nivel = '';
    this.mensaje = '';
  }
}
