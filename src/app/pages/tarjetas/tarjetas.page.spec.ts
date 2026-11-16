import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { TarjetasPage } from './tarjetas.page';
import { TarjetasService } from '../../services/tarjetas.service';

describe('TarjetasPage: recuperación asíncrona de sesión', () => {
  let notificar: (usuario: { uid: string } | null) => void;
  let fallar: () => void;
  const cancelar = vi.fn();

  beforeEach(async () => {
    localStorage.clear();
    cancelar.mockClear();
    await TestBed.configureTestingModule({
      imports: [TarjetasPage],
      providers: [provideRouter([]), { provide: Auth, useValue: {
        onAuthStateChanged: (next: typeof notificar, error: typeof fallar) => {
          notificar = next; fallar = error; return cancelar;
        }
      } }]
    }).compileComponents();
  });

  it('actualiza la vista sin clics después de recuperar la sesión', async () => {
    TestBed.inject(TarjetasService).guardar('ana', 'Recordatorio personal de Ana.');
    const fixture = TestBed.createComponent(TarjetasPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando tus tarjetas');
    await Promise.resolve();
    notificar({ uid: 'ana' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Cargando tus tarjetas');
    expect(fixture.nativeElement.querySelector('ion-textarea')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Recordatorio personal de Ana.');
    notificar({ uid: 'bea' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Recordatorio personal de Ana.');
    fixture.destroy();
    expect(cancelar).toHaveBeenCalled();
  });

  it('termina la carga y muestra inicio de sesión si no hay usuario', async () => {
    const fixture = TestBed.createComponent(TarjetasPage);
    fixture.detectChanges();
    notificar(null);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Cargando tus tarjetas');
    expect(fixture.nativeElement.textContent).toContain('Inicia sesión');
    expect(fixture.nativeElement.querySelector('ion-textarea')).toBeNull();
  });

  it('muestra un error en lugar de quedar cargando si falla la sesión', async () => {
    const fixture = TestBed.createComponent(TarjetasPage);
    fixture.detectChanges();
    fallar();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Cargando tus tarjetas');
    expect(fixture.nativeElement.textContent).toContain('No pudimos recuperar tu sesión');
  });
});
