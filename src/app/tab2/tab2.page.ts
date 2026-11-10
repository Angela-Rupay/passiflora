import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonButton
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  eyeOutline,
  arrowForwardOutline,
  heartOutline,
  leafOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonButton
  ]
})
export class Tab2Page {

  constructor(private router: Router) {
    addIcons({leafOutline,arrowForwardOutline,eyeOutline,heartOutline});
  }

  abrirRespiracion() {
    this.router.navigate(['/tabs/tab2/respiracion']);
  }

  abrirAnclaje() {
    this.router.navigate(['/tabs/tab2/anclaje']);
  }

}
