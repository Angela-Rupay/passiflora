import { Directive, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({ selector: 'ion-input[soloLetras]', standalone: true })
export class SoloLetrasDirective implements OnInit, OnDestroy {
  private cambios?: Subscription;
  constructor(private campo: NgControl) {}

  ngOnInit() {
    this.cambios = this.campo.valueChanges?.subscribe((valor: unknown) => {
      if (typeof valor !== 'string') return;
      const limpio = valor.replace(/[^\p{L}\p{M} ]/gu, '');
      if (limpio !== valor) this.campo.control?.setValue(limpio, { emitEvent: false });
    });
  }

  @HostListener('keydown', ['$event'])
  bloquearNumeros(evento: KeyboardEvent) {
    if (!evento.ctrlKey && !evento.metaKey && /^\p{N}$/u.test(evento.key)) evento.preventDefault();
  }

  ngOnDestroy() { this.cambios?.unsubscribe(); }
}
