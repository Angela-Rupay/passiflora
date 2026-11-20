import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, vi } from 'vitest';
import { Gad7Page } from './gad7.page';

describe('GAD-7 opcional', () => {
  it('permite omitir sin responder ni generar un resultado', async () => {
    const navigate = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Gad7Page],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => 'Ángela' } } } },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Gad7Page);
    fixture.detectChanges();
    const boton = Array.from(fixture.nativeElement.querySelectorAll('ion-button') as NodeListOf<HTMLElement>)
      .find(elemento => elemento.textContent?.includes('Omitir por ahora'));
    expect(boton).toBeTruthy();
    boton!.click();
    expect(navigate).toHaveBeenCalledWith(['/tabs/tab1']);
    expect(fixture.componentInstance.resultadoVisible).toBe(false);
    expect(fixture.componentInstance.cantidadRespondidas).toBe(0);
  });
});
