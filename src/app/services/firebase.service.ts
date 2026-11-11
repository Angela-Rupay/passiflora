import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDA3ZPQ_s9Qs4jrt3xB8IkM75a-uHo0WTQ",
  authDomain: "passiflora-64b5b.firebaseapp.com",
  projectId: "passiflora-64b5b",
  storageBucket: "passiflora-64b5b.firebasestorage.app",
  messagingSenderId: "6678641790",
  appId: "1:6678641790:web:e4e6633fdae82ba2bd2c2f",
  measurementId: "G-Z4E23E67M8"
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public app = initializeApp(firebaseConfig);
  public auth = getAuth(this.app);
  public db = getFirestore(this.app);

  constructor() { }
}