import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

// Estructura de datos del usuario en la base de datos
export interface Usuario {
  uid?: string;
  nombre: string;
  correo: string;
  fechaRegistro: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) { }

  // Registro de usuario en Firebase Auth y guardado de perfil en Firestore
  async registrar(nombre: string, correo: string, clave: string): Promise<void> {
    const credenciales = await createUserWithEmailAndPassword(this.auth, correo, clave);
    const uid = credenciales.user.uid;

    // Crear el documento del usuario en la colección usuarios
    const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
    const datosUsuario: Usuario = {
      uid: uid,
      nombre: nombre,
      correo: correo,
      fechaRegistro: new Date()
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