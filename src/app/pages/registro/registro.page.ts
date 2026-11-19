import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton, IonIcon, IonCheckbox, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { SoloLetrasDirective } from '../../shared/solo-letras.directive';
import { AuthService } from '../../services/auth.service';
import { codigoAuth, mensajeAuth, nombreValido, PATRON_CLAVE, PATRON_CORREO } from '../../shared/auth-validation';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonCheckbox,
    SoloLetrasDirective,
  ],
})
export class RegistroPage {
  registrando = false;
  error = '';
  mostrarClave = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertas: AlertController,
    private cambios: ChangeDetectorRef,
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  registroForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, nombreValido]],
    apellido: ['', [Validators.required, nombreValido]],
    correo: ['', [Validators.required, Validators.pattern(PATRON_CORREO)]],
    contrasena: ['', [Validators.required, Validators.pattern(PATRON_CLAVE)]],
    terminos: [false, Validators.requiredTrue],
  });

  ionViewDidLeave() {
    this.mostrarClave = false;
  }

  get contrasena(): string {
    return this.registroForm.controls.contrasena.value;
  }
  get tieneLargo(): boolean {
    return this.contrasena.length >= 8;
  }
  get tieneMayuscula(): boolean {
    return /\p{Lu}/u.test(this.contrasena);
  }
  get tieneNumero(): boolean {
    return /[0-9]/.test(this.contrasena);
  }

  async registrar() {
    if (this.registrando) return;
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    this.registrando = true;
    this.error = '';
    const datos = this.registroForm.getRawValue();
    const nombre = `${datos.nombre.trim()} ${datos.apellido.trim()}`;
    try {
      await this.authService.registrar(nombre, datos.correo.trim(), datos.contrasena, datos.terminos);
      this.registroForm.reset();
      await this.router.navigate(['/gad7'], { queryParams: { nombre }, replaceUrl: true });
    } catch (error) {
      if (codigoAuth(error) === 'auth/email-already-in-use') {
        const alerta = await this.alertas.create({
          header: 'Correo ya registrado',
          message: 'El correo ingresado se encuentra vinculado a otra cuenta.',
          cssClass: 'alerta-passiflora',
          buttons: [
            {
              text: 'Ir a inicio de sesión',
              handler: () => {
                void this.router.navigateByUrl('/login');
              },
            },
            { text: 'Cambiar correo', role: 'cancel' },
          ],
        });
        await alerta.present();
      } else {
        this.error = mensajeAuth(error);
      }
    } finally {
      this.registrando = false;
      this.cambios.markForCheck();
    }
  }
}
