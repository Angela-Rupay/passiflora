import { ContactoApoyoComponent } from '../../shared/components/contacto-apoyo.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { IonContent, IonIcon, IonModal, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heartOutline, handLeftOutline, chatbubbleEllipsesOutline, homeOutline } from 'ionicons/icons';
import { TarjetasService } from '../../services/tarjetas.service';

@Component({
  selector: 'app-panico',
  standalone: true,
  templateUrl: './panico.page.html',
  styleUrls: ['./panico.page.scss'],
  imports: [ContactoApoyoComponent, CommonModule, RouterLink, IonContent, IonIcon, IonModal, IonButton],
})
export class PanicoPage {
  revisionContacto = 0;
  get uidContacto() { return this.auth.currentUser?.uid ?? null; }
  ionViewWillEnter() { this.revisionContacto++; }
  tarjetaAbierta = false;
  textoTarjeta = '';
  tarjetaPersonal = false;
  private readonly recordatorio =
    'Puedes ir paso a paso. No tienes que resolver todo ahora. Puedes pedir compañía si la necesitas.';

  constructor(
    private auth: Auth,
    private tarjetas: TarjetasService,
  ) {
    addIcons({ heartOutline, handLeftOutline, chatbubbleEllipsesOutline, homeOutline });
  }

  abrirTarjeta() {
    this.textoTarjeta = this.recordatorio;
    this.tarjetaPersonal = false;
    const usuario = this.auth.currentUser;
    if (usuario) {
      try {
        const disponibles = this.tarjetas.listar(usuario.uid).filter((tarjeta) => tarjeta.texto.trim());
        if (disponibles.length) {
          this.textoTarjeta = disponibles[Math.floor(Math.random() * disponibles.length)].texto;
          this.tarjetaPersonal = true;
        }
      } catch {
        /* Mantener un recordatorio disponible si falla el almacenamiento. */
      }
    }
    this.tarjetaAbierta = true;
  }

  cerrarTarjeta() {
    this.tarjetaAbierta = false;
    this.textoTarjeta = '';
    this.tarjetaPersonal = false;
  }
  ionViewWillLeave() {
    this.cerrarTarjeta();
  }
}
