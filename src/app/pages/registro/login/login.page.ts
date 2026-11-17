import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonInput, IonButton, IonIcon, ToastController } from '@ionic/angular';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';
import { codigoAuth, mensajeAuth, PATRON_CORREO } from '../../../shared/auth-validation';

@Component({
  selector: 'app-login', templateUrl: './login.page.html', styleUrls: ['./login.page.scss'],
  standalone: true, imports: [CommonModule, FormsModule, RouterLink, IonContent, IonInput, IonButton, IonIcon]
})
export class LoginPage implements OnInit, OnDestroy {
  correoIngreso = '';
  claveIngreso = '';
  mostrarClave = false;
  ingresando = false;
  errorCorreo = '';
  errorClave = '';
  errorGeneral = '';
  private cancelarSesion?: () => void;

  constructor(private auth: Auth, private authService: AuthService, private router: Router,
    private toastController: ToastController, private cambios: ChangeDetectorRef, private injector: Injector) { addIcons({ eyeOutline, eyeOffOutline }); }

  get correoValido(): boolean { return PATRON_CORREO.test(this.correoIngreso.trim()); }

  ngOnInit() {
    this.cancelarSesion = runInInjectionContext(this.injector, () => onAuthStateChanged(this.auth, usuario => {
      if (usuario && !this.ingresando && this.router.url.split(/[?#]/)[0] === '/login') {
        void this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      }
    }));
  }

  ionViewDidLeave() { this.mostrarClave = false; }

  ngOnDestroy() { this.cancelarSesion?.(); }

  limpiarErrores() { this.errorCorreo = ''; this.errorClave = ''; this.errorGeneral = ''; }

  async alIniciarSesion() {
    if (this.ingresando || !this.correoValido || !this.claveIngreso) return;
    this.limpiarErrores();
    this.ingresando = true;
    try {
      await this.authService.iniciarSesion(this.correoIngreso.trim(), this.claveIngreso);
      this.claveIngreso = '';
      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (error) {
      const codigo = codigoAuth(error);
      if (codigo === 'auth/user-not-found' || codigo === 'auth/invalid-email') {
        this.errorCorreo = mensajeAuth(error);
      } else if (codigo === 'auth/wrong-password') {
        this.errorClave = mensajeAuth(error);
        const toast = await this.toastController.create({ message: this.errorClave, duration: 3500, cssClass: 'toast-passiflora' });
        await toast.present();
      } else {
        this.errorGeneral = mensajeAuth(error);
      }
    } finally {
      this.ingresando = false;
      this.cambios.markForCheck();
    }
  }
}
