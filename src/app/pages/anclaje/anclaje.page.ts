import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonIcon, IonInput, IonSelect, IonSelectOption,
  IonProgressBar, IonToast, NavController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  cameraOutline, handLeftOutline, volumeHighOutline, 
  restaurantOutline, roseOutline, checkmarkCircleOutline,
  micOutline, trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-anclaje',
  templateUrl: './anclaje.page.html',
  styleUrls: ['./anclaje.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, 
    IonButtons, IonBackButton, IonButton, IonIcon, IonInput, 
    IonSelect, IonSelectOption, IonProgressBar, IonToast
  ]
})
export class AnclajePage implements OnDestroy {

  pasoActual: number = 5;

  // 5 - VISTA: Fotos temporales en memoria
  fotosVista: string[] = [];

  // 4 - TACTO: Cuestionario de 4 objetos
  objetosTacto = [
    { nombre: '', textura: '', temperatura: '' },
    { nombre: '', textura: '', temperatura: '' },
    { nombre: '', textura: '', temperatura: '' },
    { nombre: '', textura: '', temperatura: '' }
  ];

  // 3 - OÍDO: 3 Sonidos de 5 segundos
  sonidosOido = [
    { nombre: '', audioUrl: '', grabando: false },
    { nombre: '', audioUrl: '', grabando: false },
    { nombre: '', audioUrl: '', grabando: false }
  ];
  mediaRecorder: any;
  audioChunks: any[] = [];
  tiempoRestanteGrabacion: number = 5;
  intervaloTimer: any;

  // 2 - GUSTO: 2 Sabores (Dulce, Salado, Amargo, Ácido, Umami)
  saboresGusto = [
    { objeto: '', sabor: '' },
    { objeto: '', sabor: '' }
  ];
  opcionesSabores = ['Dulce', 'Salado', 'Amargo', 'Ácido', 'Umami'];

  // 1 - OLFATO: 1 Olor
  descripcionOlor: string = '';

  // Toast Notificación
  mostrarToast: boolean = false;
  mensajeToast: string = '';

  constructor(private navCtrl: NavController) {
    addIcons({ 
      cameraOutline, handLeftOutline, volumeHighOutline, 
      restaurantOutline, roseOutline, checkmarkCircleOutline,
      micOutline, trashOutline
    });
  }

  ngOnDestroy() {
    this.limpiarRecursosTemporales();
  }

  // --- PASO 5: VISTA ---
  capturarFoto(event: any) {
    const archivo = event.target.files[0];
    if (archivo && this.fotosVista.length < 5) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotosVista.push(e.target.result);
      };
      reader.readAsDataURL(archivo);
    }
  }

  eliminarFoto(index: number) {
    this.fotosVista.splice(index, 1);
  }

  // --- PASO 3: OÍDO (Grabador 5 seg) ---
  async iniciarGrabacion(index: number) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.sonidosOido[index].grabando = true;
      this.tiempoRestanteGrabacion = 5;

      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
        this.sonidosOido[index].audioUrl = URL.createObjectURL(audioBlob);
        this.sonidosOido[index].grabando = false;
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();

      this.intervaloTimer = setInterval(() => {
        this.tiempoRestanteGrabacion--;
        if (this.tiempoRestanteGrabacion <= 0) {
          clearInterval(this.intervaloTimer);
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        }
      }, 1000);

    } catch (err) {
      this.notificar('No se pudo acceder al micrófono del dispositivo.');
    }
  }

  // --- NAVEGACIÓN ---
  siguientePaso() {
    if (this.pasoActual === 5 && this.fotosVista.length < 5) {
      this.notificar('Captura 5 fotos de objetos que veas a tu alrededor.');
      return;
    }
    if (this.pasoActual === 4) {
      const incomp = this.objetosTacto.some(o => !o.nombre || !o.textura || !o.temperatura);
      if (incomp) {
        this.notificar('Completa los detalles de los 4 objetos.');
        return;
      }
    }
    if (this.pasoActual === 3) {
      const incomp = this.sonidosOido.some(s => !s.nombre);
      if (incomp) {
        this.notificar('Asigna un nombre a los 3 sonidos.');
        return;
      }
    }
    if (this.pasoActual === 2) {
      const incomp = this.saboresGusto.some(s => !s.objeto || !s.sabor);
      if (incomp) {
        this.notificar('Selecciona el sabor de los 2 elementos.');
        return;
      }
    }
    if (this.pasoActual === 1 && !this.descripcionOlor.trim()) {
      this.notificar('Describe el olor que percibes.');
      return;
    }

    if (this.pasoActual > 1) {
      this.pasoActual--;
    } else {
      this.pasoActual = 0;
    }
  }

  anteriorPaso() {
    if (this.pasoActual < 5 && this.pasoActual > 0) {
      this.pasoActual++;
    }
  }

  finalizarEjercicio() {
    this.limpiarRecursosTemporales();
    this.navCtrl.navigateBack('/tabs/tab2');
  }

  limpiarRecursosTemporales() {
    this.fotosVista = [];
    this.sonidosOido.forEach(s => {
      if (s.audioUrl) URL.revokeObjectURL(s.audioUrl);
    });
  }

  notificar(msj: string) {
    this.mensajeToast = msj;
    this.mostrarToast = true;
  }
}