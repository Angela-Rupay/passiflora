import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonDatetime, IonButton, IonRange, IonIcon,
  IonToast, IonCard, IonCardContent, IonItem, IonLabel 
} from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, getDocs, orderBy } from '@angular/fire/firestore';

interface EmocionBase {
  nombre: string;
  emoji: string;
  color: string;
  colorFondo: string;
  subemociones: string[];
}

interface RegistroEmocional {
  fecha: string;
  emocionPrincipal: string;
  emoji: string;
  subemocion: string;
  intensidad: number;
  color: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, 
    IonToolbar, IonTitle, IonDatetime, IonButton, 
    IonRange, IonIcon, IonToast, IonCard, IonCardContent, IonItem, IonLabel
  ]
})
export class Tab3Page implements OnInit {

  fechaSeleccionada: string = new Date().toISOString();
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
      subemociones: ['Optimista', 'Orgulloso', 'Esperanzado', 'Valiente', 'Pacífico', 'Inspirado']
    },
    {
      nombre: 'Tristeza',
      emoji: '🥺',
      color: '#3A86FF',
      colorFondo: '#D0E1FD',
      subemociones: ['Solitario', 'Deprimido', 'Vulnerable', 'Apático', 'Apenado', 'Aislado']
    },
    {
      nombre: 'Ira',
      emoji: '😤',
      color: '#E63946',
      colorFondo: '#FFCDD2',
      subemociones: ['Frustrado', 'Irritado', 'Enfurecido', 'Resentido', 'Celoso', 'Crítico']
    },
    {
      nombre: 'Miedo',
      emoji: '😨',
      color: '#8338EC',
      colorFondo: '#E2D4F8',
      subemociones: ['Ansioso', 'Inseguro', 'Asustado', 'Humillado', 'Rechazado', 'Aterrado']
    },
    {
      nombre: 'Sorpresa',
      emoji: '😲',
      color: '#00B4D8',
      colorFondo: '#CAF0F8',
      subemociones: ['Confundido', 'Asombrado', 'Entusiasmado', 'Atónito', 'Conmovido']
    },
    {
      nombre: 'Asco',
      emoji: '🥴',
      color: '#38B000',
      colorFondo: '#D8F3DC',
      subemociones: ['Decepcionado', 'Evasivo', 'Sentencioso', 'Aborrecido', 'Indigno']
    }
  ];

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    await this.cargarHistorial();
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
    if (!this.emocionSeleccionada || !this.subemocionSeleccionada) {
      this.mostrarNotificacion('Por favor, selecciona una emoción y su detalle.');
      return;
    }

    const usuario = this.auth.currentUser;
    const nuevoRegistro: RegistroEmocional = {
      fecha: this.fechaSeleccionada.split('T')[0],
      emocionPrincipal: this.emocionSeleccionada.nombre,
      emoji: this.emocionSeleccionada.emoji,
      subemocion: this.subemocionSeleccionada,
      intensidad: this.nivelIntensidad,
      color: this.emocionSeleccionada.color
    };

    try {
      if (usuario) {
        const coleccionRef = collection(this.firestore, `usuarios/${usuario.uid}/registrosEmocionales`);
        await addDoc(coleccionRef, nuevoRegistro);
      }
      
      this.historialRegistros.unshift(nuevoRegistro);
      this.mostrarNotificacion('¡Tu estado emocional ha sido registrado con éxito! 💜');
      this.limpiarFormulario();
    } catch (error) {
      console.error('Error al guardar el registro:', error);
      this.mostrarNotificacion('No se pudo guardar el registro.');
    }
  }

  async cargarHistorial() {
    const usuario = this.auth.currentUser;
    if (usuario) {
      try {
        const coleccionRef = collection(this.firestore, `usuarios/${usuario.uid}/registrosEmocionales`);
        const q = query(coleccionRef, orderBy('fecha', 'desc'));
        const snapshot = await getDocs(q);
        
        this.historialRegistros = snapshot.docs.map(doc => doc.data() as RegistroEmocional);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    }
  }

  limpiarFormulario() {
    this.emocionSeleccionada = null;
    this.subemocionSeleccionada = '';
    this.nivelIntensidad = 5;
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;
  }
}