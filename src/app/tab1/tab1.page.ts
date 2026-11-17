import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { TabHeaderComponent } from '../shared/components/tab-header.component';
import { ActionCardComponent } from '../shared/components/action-card.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, TabHeaderComponent, ActionCardComponent]
})
export class Tab1Page implements OnInit, OnDestroy {

  nombreUsuario = 'Usuario';
  private cancelarSesion?: () => void;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private cambios: ChangeDetectorRef,
    private injector: Injector
  ) {
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

}
