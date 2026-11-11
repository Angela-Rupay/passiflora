import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline, logOutOutline, flowerOutline, arrowForwardOutline, leafOutline } from 'ionicons/icons';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton]
})
export class Tab1Page implements OnInit {

  nombreUsuario: string = 'Valeria';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    public themeService: ThemeService
  ) {
    addIcons({ moonOutline, sunnyOutline, logOutOutline, flowerOutline, arrowForwardOutline, leafOutline });
  }

  ngOnInit() {
    this.obtenerNombreUsuario();
  }

  ionViewWillEnter() {
    this.obtenerNombreUsuario();
  }

  obtenerNombreUsuario() {
    onAuthStateChanged(this.auth, async (usuarioActual) => {
      if (usuarioActual) {
        try {
          const usuarioRef = doc(this.firestore, `usuarios/${usuarioActual.uid}`);
          const snapshot = await getDoc(usuarioRef);
          if (snapshot.exists() && snapshot.data()['nombre']) {
            this.nombreUsuario = snapshot.data()['nombre'].split(' ')[0];
          }
        } catch (error) {
          console.error('Error al obtener usuario:', error);
        }
      }
    });
  }

  async cerrarSesion() {
    try {
      await signOut(this.auth);
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  irARespiracion() {
    this.router.navigateByUrl('/pages/respiracion');
  }
}