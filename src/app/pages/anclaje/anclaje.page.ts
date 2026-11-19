import { ChangeDetectorRef, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonProgressBar,
  IonToast,
  NavController,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  handLeftOutline,
  volumeHighOutline,
  restaurantOutline,
  roseOutline,
  checkmarkCircleOutline,
  micOutline,
  trashOutline,
} from 'ionicons/icons';
import { GrabacionService } from '../../services/grabacion.service';
import { CamaraService } from '../../services/camara.service';

@Component({
  selector: 'app-anclaje',
  templateUrl: './anclaje.page.html',
  styleUrls: ['./anclaje.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonProgressBar,
    IonToast,
  ],
})
export class AnclajePage implements OnDestroy {
  pasoActual: number = 5;
  fotosVista: string[] = [];
  abriendoCamara = false;
  private versionFoto = 0;
  private avisoCamaraAceptado = false;
  private avisoMicrofonoAceptado = false;
  private versionAudio = 0;
  solicitandoMicrofono = false;
  indiceGrabando: number | null = null;
  readonly opcionesSelector = { cssClass: 'selector-anclaje' };

  // 4 - TACTO
  objetosTacto = [
    { nombre: '', textura: '', temperatura: '' },
    { nombre: '', textura: '', temperatura: '' },
    { nombre: '', textura: '', temperatura: '' },
    { nombre: '', textura: '', temperatura: '' },
  ];

  // 3 - OÍDO
  sonidosOido = [
    { nombre: '', audioUrl: '', grabando: false },
    { nombre: '', audioUrl: '', grabando: false },
    { nombre: '', audioUrl: '', grabando: false },
  ];
  private abortarAudio?: AbortController;
  private flujoAudio?: MediaStream;
  tiempoRestanteGrabacion: number = 5;

  // 2 - GUSTO
  saboresGusto = [
    { objeto: '', sabor: '' },
    { objeto: '', sabor: '' },
  ];
  opcionesSabores = ['Dulce', 'Salado', 'Amargo', 'Ácido', 'Umami'];

  // 1 - OLFATO
  descripcionOlor: string = '';

  mostrarToast: boolean = false;
  mensajeToast: string = '';

  constructor(
    private navCtrl: NavController,
    private camara: CamaraService,
    private grabacion: GrabacionService,
    private alertas: AlertController,
    private cambios: ChangeDetectorRef,
  ) {
    addIcons({
      cameraOutline,
      handLeftOutline,
      volumeHighOutline,
      restaurantOutline,
      roseOutline,
      checkmarkCircleOutline,
      micOutline,
      trashOutline,
    });
  }

  ngOnDestroy() {
    this.limpiarRecursosTemporales();
  }

  async capturarFotoNativa() {
    if (this.abriendoCamara || this.fotosVista.length >= 5) return;
    this.abriendoCamara = true;
    const version = this.versionFoto;
    try {
      if (!this.avisoCamaraAceptado) {
        const aviso = await this.alertas.create({
          header: 'Permiso para usar la cámara',
          message:
            'Para fotografiar los objetos necesitamos tu autorización. Las fotos se usan solo durante este ejercicio y no se suben a tu cuenta.',
          cssClass: 'alerta-passiflora',
          buttons: [
            { text: 'Ahora no', role: 'cancel' },
            { text: 'Aceptar', role: 'confirm' },
          ],
        });
        await aviso.present();
        const resultado = await aviso.onDidDismiss();
        if (resultado.role !== 'confirm' || version !== this.versionFoto) return;
      }
      const foto = await this.camara.capturar();
      if (version === this.versionFoto && foto && this.fotosVista.length < 5) {
        this.fotosVista.push(foto);
        this.avisoCamaraAceptado = true;
      }
    } catch (error) {
      if (version === this.versionFoto)
        this.notificar(
          error instanceof Error
            ? error.message
            : 'No pudimos abrir la cámara. Revisa sus permisos e inténtalo de nuevo.',
        );
    } finally {
      if (version === this.versionFoto) {
        this.abriendoCamara = false;
        this.cambios.markForCheck();
      }
    }
  }

  ionViewWillLeave() {
    this.versionFoto++;
    this.abriendoCamara = false;
    this.avisoCamaraAceptado = false;
    this.avisoMicrofonoAceptado = false;
    this.cancelarGrabacion();
  }

  @HostListener('document:visibilitychange') alOcultar() {
    if (document.hidden) this.cancelarGrabacion();
  }

  eliminarFoto(index: number) {
    this.fotosVista.splice(index, 1);
  }

  async iniciarGrabacion(index: number) {
    if (this.solicitandoMicrofono || this.indiceGrabando !== null || !this.sonidosOido[index]) return;
    this.solicitandoMicrofono = true;
    const version = this.versionAudio;
    let flujo: MediaStream | undefined;
    try {
      if (!this.avisoMicrofonoAceptado) {
        const aviso = await this.alertas.create({
          header: 'Permiso para usar el micrófono',
          message:
            'Para grabar los sonidos necesitamos tu autorización. Las grabaciones se usan solo en este ejercicio y no se suben a tu cuenta.',
          cssClass: 'alerta-passiflora',
          buttons: [
            { text: 'Ahora no', role: 'cancel' },
            { text: 'Aceptar', role: 'confirm' },
          ],
        });
        await aviso.present();
        const respuesta = await aviso.onDidDismiss();
        if (respuesta.role !== 'confirm' || version !== this.versionAudio) return;
      }
      if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === 'undefined') {
        throw new Error(
          'La grabación no está disponible aquí. Prueba la app instalada o un navegador actualizado con HTTPS.',
        );
      }
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (version !== this.versionAudio) {
        flujo.getTracks().forEach((pista) => pista.stop());
        return;
      }
      this.flujoAudio = flujo;
      this.abortarAudio = new AbortController();
      this.indiceGrabando = index;
      this.sonidosOido[index].grabando = true;
      this.tiempoRestanteGrabacion = 5;
      await this.grabacion.iniciar(
        flujo,
        this.abortarAudio.signal,
        (segundos) => {
          if (version !== this.versionAudio) return;
          this.tiempoRestanteGrabacion = Math.max(0, Math.ceil(5 - segundos));
          this.cambios.markForCheck();
        },
        (audio) => {
          if (version !== this.versionAudio) return;
          if (this.sonidosOido[index].audioUrl) URL.revokeObjectURL(this.sonidosOido[index].audioUrl);
          this.sonidosOido[index].audioUrl = URL.createObjectURL(audio);
          this.cancelarGrabacion();
          this.cambios.markForCheck();
        },
        () => {
          if (version === this.versionAudio) {
            this.cancelarGrabacion();
            this.notificar('No pudimos completar la grabación. Inténtalo de nuevo.');
          }
        },
      );
      if (version === this.versionAudio) this.avisoMicrofonoAceptado = true;
    } catch (error) {
      flujo?.getTracks().forEach((pista) => pista.stop());
      if (version !== this.versionAudio) return;
      this.cancelarGrabacion();
      const nombre = typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : '';
      this.notificar(
        nombre === 'NotAllowedError' || nombre === 'SecurityError'
          ? 'No se autorizó el micrófono. Puedes habilitarlo en Ajustes → Aplicaciones → Passiflora → Permisos → Micrófono.'
          : error instanceof Error
            ? error.message
            : 'No pudimos acceder al micrófono.',
      );
    } finally {
      if (version === this.versionAudio) this.solicitandoMicrofono = false;
      this.cambios.markForCheck();
    }
  }

  cancelarGrabacion() {
    this.versionAudio++;
    this.abortarAudio?.abort();
    this.abortarAudio = undefined;
    this.flujoAudio?.getTracks().forEach((pista) => pista.stop());
    this.flujoAudio = undefined;
    this.sonidosOido.forEach((sonido) => (sonido.grabando = false));
    this.solicitandoMicrofono = false;
    this.indiceGrabando = null;
  }

  // --- NAVEGACIÓN ---
  siguientePaso() {
    if (this.solicitandoMicrofono || this.indiceGrabando !== null) {
      this.notificar('Espera a que termine la grabación o cancélala.');
      return;
    }
    if (this.pasoActual === 5 && this.fotosVista.length < 5) {
      this.notificar('Captura 5 fotos de objetos que veas a tu alrededor.');
      return;
    }
    if (this.pasoActual === 4) {
      const incomp = this.objetosTacto.some((o) => !o.nombre || !o.textura || !o.temperatura);
      if (incomp) {
        this.notificar('Completa los detalles de los 4 objetos.');
        return;
      }
    }
    if (this.pasoActual === 3) {
      const incomp = this.sonidosOido.some((s) => !s.nombre);
      if (incomp) {
        this.notificar('Asigna un nombre a los 3 sonidos.');
        return;
      }
    }
    if (this.pasoActual === 2) {
      const incomp = this.saboresGusto.some((s) => !s.objeto || !s.sabor);
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
    this.cancelarGrabacion();
    if (this.pasoActual < 5 && this.pasoActual > 0) {
      this.pasoActual++;
    }
  }

  finalizarEjercicio() {
    this.limpiarRecursosTemporales();
    this.navCtrl.navigateBack('/panico');
  }

  limpiarRecursosTemporales() {
    this.versionFoto++;
    this.abriendoCamara = false;
    this.fotosVista = [];
    this.avisoCamaraAceptado = false;
    this.avisoMicrofonoAceptado = false;
    this.cancelarGrabacion();
    this.sonidosOido.forEach((s) => {
      if (s.audioUrl) URL.revokeObjectURL(s.audioUrl);
      s.audioUrl = '';
    });
  }

  notificar(msj: string) {
    this.mensajeToast = msj;
    this.mostrarToast = true;
    this.cambios.markForCheck();
  }
}
