import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { musicalNotesOutline } from 'ionicons/icons';
import { TabHeaderComponent } from '../shared/components/tab-header.component';
import { ActionCardComponent } from '../shared/components/action-card.component';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [IonContent, TabHeaderComponent, ActionCardComponent]
})
export class Tab2Page {
  constructor() {
    addIcons({ musicalNotesOutline });
  }
}