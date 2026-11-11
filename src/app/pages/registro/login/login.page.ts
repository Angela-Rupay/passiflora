import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonItem, IonInput, IonButton, 
  IonIcon, IonSegment, IonSegmentButton, IonLabel,
  ToastController, LoadingController 
} from '@ionic/angular';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { AuthService } from '../../../services/auth.service';
import { addIcons } from 'ionicons';
import { flowerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonItem, 
    IonInput, IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel
  ]
})
export class LoginPage implements OnInit {

  seccionActual: string = 'ingreso';
  correoIngreso: string = '';
  claveIngreso: string = '';
  nombreRegistro: string = '';
  correoRegistro: string = '';
  claveRegistro: string = '';
  confirmarClaveRegistro: string = '';

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ flowerOutline });
  }

  ngOnInit() {
    // Mantiene la sesión persistente: si ya hay sesión iniciada, entra directo a la app
    onAuthStateChanged(this.auth, (usuario) => {
      if (usuario) {
        this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      }
    });
  }

  async alIniciarSesion() {
    if (!this.correoIngreso || !this.claveIngreso) {
      this.mostrarMensaje('Por favor, completa todos los campos.');
      return;
    }

    const cargando = await this.loadingController.create({ message: 'Ingresando...' });
    await cargando.present();

    try {
      await this.authService.iniciarSesion(this.correoIngreso, this.claveIngreso);
      await cargando.dismiss();
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (error) {
      await cargando.dismiss();
      this.mostrarMensaje('Error al ingresar: Verifique sus credenciales.');
    }
  }

  async alRegistrar() {
    if (!this.nombreRegistro || !this.correoRegistro || !this.claveRegistro) {
      this.mostrarMensaje('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (this.claveRegistro !== this.confirmarClaveRegistro) {
      this.mostrarMensaje('Las contraseñas no coinciden.');
      return;
    }

    const cargando = await this.loadingController.create({ message: 'Creando cuenta...' });
    await cargando.present();

    try {
      await this.authService.registrar(
        this.nombreRegistro,
        this.correoRegistro,
        this.claveRegistro
      );
      await cargando.dismiss();
      this.mostrarMensaje('¡Cuenta creada con éxito!');
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (error) {
      await cargando.dismiss();
      this.mostrarMensaje('Error al registrar cuenta.');
    }
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}