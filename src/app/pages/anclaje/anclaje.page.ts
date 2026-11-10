import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-anclaje',
  templateUrl: './anclaje.page.html',
  styleUrls: ['./anclaje.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class AnclajePage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
