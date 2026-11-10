import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-respiracion',
  templateUrl: './respiracion.page.html',
  styleUrls: ['./respiracion.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class RespiracionPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
