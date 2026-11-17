import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { describe, expect, it } from 'vitest';
import { SoloLetrasDirective } from './solo-letras.directive';

@Component({ standalone: true, imports: [IonInput, ReactiveFormsModule, SoloLetrasDirective], template: '<ion-input soloLetras [formControl]="nombre"></ion-input>' })
class CampoPrueba { nombre = new FormControl(''); }

describe('Campos de nombre y apellido', () => {
  it('bloquea números de teclado y permite las letras y atajos', () => {
    const fixture = TestBed.createComponent(CampoPrueba);
    fixture.detectChanges();
    const campo = fixture.nativeElement.querySelector('ion-input');
    const numero = new KeyboardEvent('keydown', { key: '5', cancelable: true });
    campo.dispatchEvent(numero);
    expect(numero.defaultPrevented).toBe(true);
    const letra = new KeyboardEvent('keydown', { key: 'Á', cancelable: true });
    campo.dispatchEvent(letra);
    expect(letra.defaultPrevented).toBe(false);
    const atajo = new KeyboardEvent('keydown', { key: '1', ctrlKey: true, cancelable: true });
    campo.dispatchEvent(atajo);
    expect(atajo.defaultPrevented).toBe(false);
  });

  it('limpia texto pegado y conserva tildes, espacios y ñ', () => {
    const fixture = TestBed.createComponent(CampoPrueba);
    fixture.detectChanges();
    const campo = fixture.nativeElement.querySelector('ion-input');
    campo.value = 'Ángela12 Muñoz３';
    campo.dispatchEvent(new CustomEvent('ionInput', { detail: { value: campo.value } }));
    expect(fixture.componentInstance.nombre.value).toBe('Ángela Muñoz');
    expect(campo.value).toBe('Ángela Muñoz');
  });
});
