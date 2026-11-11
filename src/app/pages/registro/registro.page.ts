
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import {
  IonContent,
  IonInput,
  IonButton,
  IonCheckbox,
  IonText,
  IonItem,
  IonIcon
} from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonCheckbox,
    IonText,
    IonItem,
    IonIcon
  ]
})
export class RegistroPage {

  constructor(private fb: FormBuilder,
    private router: Router
  ) {}

  registroForm = this.fb.group({
    nombre: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
    ]],

    apellido: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
    ]],

    correo: ['', [
      Validators.required,
      Validators.email
    ]],

    contrasena: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).+$/)
    ]],

    terminos: [false, Validators.requiredTrue]
  });

  get contrasena() {
    return this.registroForm.get('contrasena')?.value || '';
  }

  get tieneLargo(): boolean {
    return this.contrasena.length >= 8;
  }

  get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.contrasena);
  }

  get tieneNumero(): boolean {
    return /[0-9]/.test(this.contrasena);
  }

 registrar() {

  if (this.registroForm.invalid) {
    this.registroForm.markAllAsTouched();
    return;
  }

  const datos = this.registroForm.getRawValue();

  const nombreCompleto =
    `${datos.nombre} ${datos.apellido}`;

  this.router.navigate(['/gad7'], {
    queryParams: {
      nombre: nombreCompleto
    }
  });

}
}
