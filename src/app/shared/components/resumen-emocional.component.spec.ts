import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ResumenEmocionalComponent } from './resumen-emocional.component';
import { RegistroEmocional } from '../../services/diario.service';

describe('Panel de emociones', () => {
  it('permite seleccionar una semana y elimina el resumen al vaciar los registros', async () => {
    await TestBed.configureTestingModule({ imports: [ResumenEmocionalComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ResumenEmocionalComponent);
    const registro: RegistroEmocional = { id: '1', fecha: '2026-11-17', emocionPrincipal: 'Felicidad',
      intensidad: 6, color: '#5E4B8B', emoji: '😊', subemocion: 'Optimista', pendiente: false, creadoEnMs: 0 };
    fixture.componentRef.setInput('registros', [registro]); fixture.detectChanges();
    const selector = fixture.nativeElement.querySelector('ion-select') as HTMLElement;
    selector.dispatchEvent(new CustomEvent('ionChange', { detail: { value: '2026-11-16' } })); fixture.detectChanges();
    expect(fixture.componentInstance.resumen.total).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Felicidad');
    fixture.componentRef.setInput('desdeCache', true); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sincronizando tu resumen');
    fixture.componentRef.setInput('registros', []); fixture.detectChanges();
    expect(fixture.componentInstance.resumen.total).toBe(0);
    expect(fixture.nativeElement.textContent).not.toContain('Felicidad');
    expect(fixture.nativeElement.textContent).toContain('Todavía no hay registros');
  });
});
