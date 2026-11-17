import { beforeEach, describe, expect, it, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { IonInput } from '@ionic/angular';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { RegistroPage } from './registro.page';
import { AuthService } from '../../services/auth.service';

describe('Registro único con Firebase', () => {
  const registrar = vi.fn();
  const crearAlerta = vi.fn();
  beforeEach(async () => {
    registrar.mockReset().mockResolvedValue(undefined);
    crearAlerta.mockReset().mockResolvedValue({ present: vi.fn() });
    await TestBed.configureTestingModule({ imports: [RegistroPage], providers: [provideRouter([]),
      { provide: AuthService, useValue: { registrar } },
      { provide: AlertController, useValue: { create: crearAlerta } }
    ] }).compileComponents();
  });
  const completar = (pagina: RegistroPage) => pagina.registroForm.setValue({ nombre: ' Ángela ', apellido: ' Rupay ', correo: 'ana@example.com', contrasena: 'Segura123', terminos: true });

  it('no crea cuentas ni navega si el formulario es inválido', async () => {
    const pagina = TestBed.createComponent(RegistroPage).componentInstance;
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate');
    await pagina.registrar();
    expect(registrar).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });
  it('crea primero la cuenta y luego lleva al GAD-7 con el nombre', async () => {
    const pagina = TestBed.createComponent(RegistroPage).componentInstance;
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    completar(pagina);
    await pagina.registrar();
    expect(registrar).toHaveBeenCalledWith('Ángela Rupay', 'ana@example.com', 'Segura123', true);
    expect(navegar).toHaveBeenCalledWith(['/gad7'], { queryParams: { nombre: 'Ángela Rupay' }, replaceUrl: true });
    expect(pagina.registroForm.controls.contrasena.value).toBe('');
  });
  it('mantiene los datos y ofrece las dos opciones ante correo duplicado', async () => {
    registrar.mockRejectedValue({ code: 'auth/email-already-in-use' });
    const pagina = TestBed.createComponent(RegistroPage).componentInstance;
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate');
    completar(pagina);
    await pagina.registrar();
    expect(navegar).not.toHaveBeenCalled();
    expect(pagina.registroForm.controls.correo.value).toBe('ana@example.com');
    expect(crearAlerta.mock.calls[0][0].buttons.map((b: {text: string}) => b.text)).toEqual(['Ir a inicio de sesión', 'Cambiar correo']);
    expect(pagina.registrando).toBe(false);
  });
  it('bloquea envíos duplicados y permite reintentar tras un fallo de red', async () => {
    let rechazar!: (error: unknown) => void;
    registrar.mockImplementationOnce(() => new Promise((_resolve, reject) => { rechazar = reject; }));
    const pagina = TestBed.createComponent(RegistroPage).componentInstance;
    completar(pagina);
    const pendiente = pagina.registrar();
    await pagina.registrar();
    expect(registrar).toHaveBeenCalledTimes(1);
    rechazar({ code: 'auth/network-request-failed' });
    await pendiente;
    expect(pagina.error).toContain('conexión');
    expect(pagina.registrando).toBe(false);
    expect(pagina.registroForm.valid).toBe(true);
  });
  it('permite mostrar y ocultar la contraseña y la oculta al salir', () => {
    const fixture = TestBed.createComponent(RegistroPage);
    fixture.detectChanges();
    const campo = fixture.debugElement.queryAll(By.directive(IonInput)).find(elemento => elemento.componentInstance.autocomplete === 'new-password')!;
    const boton = fixture.debugElement.query(By.css('.ver-clave'));
    expect(campo.componentInstance.type).toBe('password');
    boton.triggerEventHandler('click');
    fixture.detectChanges();
    expect(campo.componentInstance.type).toBe('text');
    boton.triggerEventHandler('click');
    fixture.detectChanges();
    expect(campo.componentInstance.type).toBe('password');
    fixture.componentInstance.mostrarClave = true;
    fixture.componentInstance.ionViewDidLeave();
    expect(fixture.componentInstance.mostrarClave).toBe(false);
  });

  it('no registra hasta aceptar los términos y permite leerlos', () => {
    const fixture = TestBed.createComponent(RegistroPage);
    const pagina = fixture.componentInstance;
    completar(pagina); pagina.registroForm.controls.terminos.setValue(false);
    fixture.detectChanges();
    expect(pagina.registroForm.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('details.terminos summary').textContent).toContain('Términos');
    pagina.registroForm.controls.terminos.setValue(true);
    expect(pagina.registroForm.valid).toBe(true);
  });

});
