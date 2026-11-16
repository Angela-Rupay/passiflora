import { AbstractControl, ValidationErrors } from '@angular/forms';

export const PATRON_NOMBRE = /^(?=.*\p{L})[\p{L}\p{M} ]+$/u;
export const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.(?:com|co)$/i;
export const PATRON_CLAVE = /^(?=.*\p{Lu})(?=.*[0-9]).{8,}$/u;

export function nombreValido(control: AbstractControl): ValidationErrors | null {
  return PATRON_NOMBRE.test(String(control.value ?? '').trim()) ? null : { nombre: true };
}

export function codigoAuth(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code) : '';
}

export function mensajeAuth(error: unknown): string {
  switch (codigoAuth(error)) {
    case 'auth/user-not-found': return 'No se encuentra una cuenta vinculada a ese correo, por favor verifica.';
    case 'auth/wrong-password': return 'Contraseña incorrecta.';
    case 'auth/invalid-credential': return 'El correo o la contraseña no coinciden. Verifica tus datos.';
    case 'auth/invalid-email': return 'Correo inválido.';
    case 'auth/weak-password': return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
    case 'auth/network-request-failed': return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
    case 'auth/too-many-requests': return 'Hubo demasiados intentos. Espera un momento y vuelve a intentarlo.';
    case 'auth/user-disabled': return 'Esta cuenta está deshabilitada. Contacta al administrador.';
    default: return 'No pudimos completar la solicitud. Inténtalo de nuevo.';
  }
}
