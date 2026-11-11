import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private ES_MODO_OSCURO_KEY = 'passiflora_modo_oscuro';
  modoOscuro: boolean = false;

  constructor() {
    // Cargar preferencia guardada o verificar preferencia del sistema
    const guardado = localStorage.getItem(this.ES_MODO_OSCURO_KEY);
    if (guardado !== null) {
      this.modoOscuro = JSON.parse(guardado);
    } else {
      this.modoOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.aplicarTema();
  }

  toggleTema() {
    this.modoOscuro = !this.modoOscuro;
    localStorage.setItem(this.ES_MODO_OSCURO_KEY, JSON.stringify(this.modoOscuro));
    this.aplicarTema();
  }

  aplicarTema() {
    document.body.classList.toggle('dark', this.modoOscuro);
  }
}