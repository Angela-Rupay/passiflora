import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { flowerOutline, leafOutline, eyeOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class Tab2Page {

  constructor(private router: Router) {
    addIcons({ flowerOutline, leafOutline, eyeOutline, arrowForwardOutline });
  }

  irARespiracion() {
    this.router.navigateByUrl('/pages/respiracion');
  }

  irAAnclaje() {
    this.router.navigateByUrl('/pages/anclaje');
  }

}