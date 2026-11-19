
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
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

constructor(
  private route: ActivatedRoute,
  private router: Router
) {
  this.nombreUsuario =
    this.route.snapshot.queryParamMap.get('nombre') || 'Usuario';
}
  ionViewWillEnter() {
    this.nombreUsuario = this.route.snapshot.queryParamMap.get('nombre') || 'Usuario';
    this.volverAResponder();
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
      this.nivel = 'Ansiedad mínima';
      this.mensaje =
        'Tus niveles de ansiedad son bajos en este momento. Para mantener este equilibrio, te recomendamos practicar respiraciones breves de 2 minutos al día, cuidar tus horarios de sueño y hacer pausas de descanso como hábito preventivo.';
    } 
    else if (this.puntajeTotal <= 9) {
      this.nivel = 'Ansiedad leve';
      this.mensaje =
        'Presentas señales leves de ansiedad que puedes manejar con práctica constante. Te sugerimos realizar ejercicios de respiración guiada a diario, anotar qué situaciones detonan tu malestar y aplicar técnicas de relajación antes de dormir.';
    } 
    else if (this.puntajeTotal <= 14) {
      this.nivel = 'Ansiedad moderada';
      this.mensaje =
        'Tu nivel de ansiedad está teniendo un impacto significativo en tu día a día. Apóyate en el ejercicio de anclaje 5-4-3-2-1 y en el botón de pánico cuando te sientas abrumado, y considera consultar a un profesional de la salud mental para recibir orientación personalizada.';
    } 
    else {
      this.nivel = 'Ansiedad severa';
      this.mensaje =
        'Estás atravesando un nivel alto de ansiedad y no tienes que cargarlo solo. Prioriza herramientas de calma inmediata como los audios guía y el contacto con tu red de apoyo, y busca atención psicológica o médica a la brevedad.';
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

  irAlInicio() {
  this.router.navigate(['/tabs/tab1']);
}
}
