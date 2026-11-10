
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  leafOutline,
  arrowForwardOutline,
  flowerOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon
  ]
})

export class Tab1Page {

  nombreUsuario = '';

  constructor(private router: Router) {

    addIcons({
      leafOutline,
      arrowForwardOutline,
      flowerOutline
    });

  }

  iniciarRespiracion() {
    this.router.navigate(['/respiracion']);
  }

}
