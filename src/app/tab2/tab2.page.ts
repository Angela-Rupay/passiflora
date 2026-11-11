import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonButton, IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flowerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
    IonCardContent, IonButton, IonIcon
  ],
})
export class Tab2Page {
  constructor(private router: Router) {
    addIcons({ flowerOutline });
  }

  irARespiracion() {
    this.router.navigate(['/respiracion']);
  }

  irAAnclaje() {
    this.router.navigate(['/anclaje']);
  }
}