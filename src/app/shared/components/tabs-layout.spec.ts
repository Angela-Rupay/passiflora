import { beforeEach, describe, expect, it, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { IonButton } from '@ionic/angular';
import { TabHeaderComponent } from './tab-header.component';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Tab1Page } from '../../tab1/tab1.page';
import { Tab2Page } from '../../tab2/tab2.page';
import { Tab3Page } from '../../tab3/tab3.page';
import { AuthService } from '../../services/auth.service';

describe('Acciones disponibles en todas las pestañas', () => {
  const salir = vi.fn();
  beforeEach(() => { localStorage.clear(); localStorage.setItem('passiflora_modo_oscuro', 'false'); document.body.classList.remove('dark'); salir.mockReset().mockResolvedValue(undefined); });

  for (const pagina of [Tab1Page, Tab2Page, Tab3Page] as Type<unknown>[]) {
    it(`${pagina.name}: permite cambiar tema y salir`, async () => {
      await TestBed.configureTestingModule({ imports: [pagina], providers: [provideRouter([]),
        { provide: AuthService, useValue: { cerrarSesion: salir } },
        { provide: Auth, useValue: { currentUser: null, onAuthStateChanged: (next: (value: null) => void) => { queueMicrotask(() => next(null)); return () => undefined; } } },
        { provide: Firestore, useValue: {} }
      ] }).compileComponents();
      const fixture = TestBed.createComponent(pagina);
      const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      fixture.detectChanges();
      await fixture.whenStable();
      const cabecera = fixture.debugElement.query(By.directive(TabHeaderComponent));
      expect(cabecera).not.toBeNull();
      const botones = cabecera.queryAll(By.directive(IonButton));
      expect(botones.length).toBe(2);
      botones[0].triggerEventHandler('click');
      await fixture.whenStable();
      expect(document.body.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('passiflora_modo_oscuro')).toBe('true');
      botones[1].triggerEventHandler('click');
      await fixture.whenStable();
      expect(salir).toHaveBeenCalledOnce();
      expect(navegar).toHaveBeenCalledWith('/login', { replaceUrl: true });
      if (pagina === Tab1Page) {
        const enlaces = [...fixture.nativeElement.querySelectorAll('app-action-card a')] as HTMLAnchorElement[];
        expect(enlaces.map(a => a.getAttribute('href')?.split('?')[0])).toEqual(['/respiracion', '/gad7', '/tarjetas']);
      }
    });
  }
});
