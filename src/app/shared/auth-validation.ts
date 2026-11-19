import { AbstractControl, ValidationErrors } from '@angular/forms';

export const PATRON_NOMBRE = /^(?=.*\p{L})[\p{L}\p{M} ]+$/u;
export const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.(?:com|co)$/i;
export const PATRON_CLAVE = /^(?=.*\p{Lu})(?=.*[0-9]).{8,}$/u;

export function nombreValido(control: AbstractControl): ValidationErrors | null {
  const nombre = String(control.value ?? '').normalize('NFC').trim();
  if (!PATRON_NOMBRE.test(nombre)) return { nombre: true };
  return (nombre.match(/\p{L}/gu)?.length ?? 0) >= 4 ? null : { nombreCorto: true };
}

export function codigoAuth(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code) : '';
}

export function mensajeAuth(error: unknown): string {
  switch (codigoAuth(error)) {
    case 'app/terms-required': return 'Debes aceptar los términos para crear tu cuenta.';
    case 'app/invalid-name': return 'El nombre y apellido deben contener solo letras y espacios.';
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

export function validarDatosRegistro(nombre: string, correo: string, clave: string): void {
  if (!PATRON_NOMBRE.test(nombre.trim())) {
    throw Object.assign(new Error('Nombre inválido: solo letras y espacios.'), { code: 'app/invalid-name' });
  }
  if (!PATRON_CORREO.test(correo.trim())) {
    throw Object.assign(new Error('Correo inválido.'), { code: 'auth/invalid-email' });
  }
  if (!PATRON_CLAVE.test(clave)) {
    throw Object.assign(new Error('Contraseña inválida.'), { code: 'auth/weak-password' });
  }
}
