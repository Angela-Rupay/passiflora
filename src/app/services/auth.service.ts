import { VERSION_TERMINOS } from '../shared/terminos';
import { validarDatosRegistro } from '../shared/auth-validation';
import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

// Estructura de datos del usuario en la base de datos
export interface Usuario {
  uid?: string;
  nombre: string;
  correo: string;
  fechaRegistro: Date;
  terminos?: { aceptados: true; version: string; fecha: Date };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) {}

  // Registro de usuario en Firebase Auth y guardado de perfil en Firestore
  async registrar(nombre: string, correo: string, clave: string, aceptaTerminos = false): Promise<void> {
    validarDatosRegistro(nombre, correo, clave);
    if (!aceptaTerminos) throw Object.assign(new Error('Debes aceptar los términos.'), { code: 'app/terms-required' });
    const credenciales = await createUserWithEmailAndPassword(this.auth, correo.trim(), clave);
    const uid = credenciales.user.uid;

    // Crear el documento del usuario en la colección usuarios
    const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
    const datosUsuario: Usuario = {
      uid: uid,
      nombre: nombre.trim(),
      correo: correo.trim(),
      fechaRegistro: new Date(),
      terminos: { aceptados: true, version: VERSION_TERMINOS, fecha: new Date() },
    };

    await setDoc(usuarioRef, datosUsuario);
  }

  // Inicio de sesión con correo y contraseña
  async iniciarSesion(correo: string, clave: string) {
    return await signInWithEmailAndPassword(this.auth, correo, clave);
  }

  // Obtener datos del perfil guardado en Firestore
  async obtenerPerfil(uid: string): Promise<Usuario | null> {
    const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
    const snapshot = await getDoc(usuarioRef);
    if (snapshot.exists()) {
      return snapshot.data() as Usuario;
    }
    return null;
  }

  // Cerrar sesión
  async cerrarSesion() {
    return await signOut(this.auth);
  }
}
