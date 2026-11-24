import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactoApoyoComponent } from './contacto-apoyo.component';
import { ContactoApoyoService, MENSAJE_APOYO } from '../../services/contacto-apoyo.service';

describe('Configurar contacto y abrir WhatsApp', () => {
  const create = vi.fn();
  beforeEach(() => {
    localStorage.clear();
    create.mockReset().mockResolvedValue({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }) });
    TestBed.configureTestingModule({ imports: [ContactoApoyoComponent], providers: [provideRouter([]), { provide: AlertController, useValue: { create } }] });
  });
  it('ofrece configurar si falta contacto y genera un enlace solo después de guardar', () => {
    const fixture = TestBed.createComponent(ContactoApoyoComponent);
    fixture.componentRef.setInput('uid', 'angela'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a.whatsapp')).toBeNull();
    const p = fixture.componentInstance;
    p.editar(); expect(p.mensaje).toBe(MENSAJE_APOYO);
    p.nombre = 'Valeria'; p.numero = '3001234567'; p.guardar(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a.whatsapp').href).toContain('https://wa.me/573001234567');
    fixture.componentRef.setInput('uid', 'valeria'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a.whatsapp')).toBeNull();
    expect(p.numero).toBe('');
  });
  it('respeta cancelar al eliminar y actualiza el contacto al regresar al pánico', async () => {
    const servicio = TestBed.inject(ContactoApoyoService);
    servicio.guardar('angela', { nombre: 'Valeria', numero: '3001234567', mensaje: MENSAJE_APOYO });
    const fixture = TestBed.createComponent(ContactoApoyoComponent);
    fixture.componentRef.setInput('uid', 'angela'); fixture.detectChanges();
    await fixture.componentInstance.eliminar();
    expect(servicio.leer('angela')).not.toBeNull();
    servicio.eliminar('angela');
    fixture.componentRef.setInput('revision', 1); fixture.detectChanges();
    expect(fixture.componentInstance.contacto).toBeNull();
  });
});
