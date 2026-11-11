import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Módulos de Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Credenciales del proyecto Passiflora en Firebase
const configuracionFirebase = {
  apiKey: "AIzaSyDA3ZPQ_s9Qs4jrt3xB8IkM75a-uHo0WTQ",
  authDomain: "passiflora-64b5b.firebaseapp.com",
  projectId: "passiflora-64b5b",
  storageBucket: "passiflora-64b5b.firebasestorage.app",
  messagingSenderId: "6678641790",
  appId: "1:6678641790:web:e4e6633fdae82ba2bd2c2f",
  measurementId: "G-Z4E23E67M8"
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    // Inicialización de Firebase
    provideFirebaseApp(() => initializeApp(configuracionFirebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
});