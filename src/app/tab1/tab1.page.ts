import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, IonContent, IonIcon, IonButton, RouterLink]
})
export class Tab1Page implements OnInit, OnDestroy {

  nombreUsuario = 'Usuario';
  private cancelarSesion?: () => void;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    public themeService: ThemeService,
    private cambios: ChangeDetectorRef,
    private injector: Injector
  ) {
    addIcons({ moonOutline, sunnyOutline, logOutOutline, flowerOutline, arrowForwardOutline, leafOutline });
  }

  ngOnInit() {
    this.obtenerNombreUsuario();
  }

  ngOnDestroy() { this.cancelarSesion?.(); }

  obtenerNombreUsuario() {
    this.cancelarSesion?.();
    this.cancelarSesion = runInInjectionContext(this.injector, () => onAuthStateChanged(this.auth, async usuario => {
      this.nombreUsuario = 'Usuario';
      this.cambios.markForCheck();
      if (!usuario) return;
      try {
        const snapshot = await getDoc(doc(this.firestore, `usuarios/${usuario.uid}`));
        if (this.auth.currentUser?.uid !== usuario.uid) return;
        const nombre: unknown = snapshot.data()?.['nombre'];
        if (typeof nombre === 'string' && nombre.trim()) this.nombreUsuario = nombre.trim().split(/\s+/)[0];
      } catch (error) { console.error('Error al obtener usuario:', error); }
      finally { this.cambios.markForCheck(); }
    }));
  }

  async cerrarSesion() {
    try {
      await signOut(this.auth);
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  irAGad7() {
    this.router.navigate(['/gad7'], {
      queryParams: { nombre: this.nombreUsuario }
    });
  }

  irARespiracion() {
    this.router.navigateByUrl('/respiracion');
  }
}