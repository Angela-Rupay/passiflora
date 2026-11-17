import { describe, beforeEach, expect, it } from 'vitest';
import { Auth } from '@angular/fire/auth';
import { PanicoPage } from './panico.page';
import { TarjetasService } from '../../services/tarjetas.service';

describe('Espacio de pánico y tarjetas de realidad', () => {
  let pagina: PanicoPage;
  let tarjetas: TarjetasService;
  beforeEach(() => {
    localStorage.clear();
    tarjetas = new TarjetasService();
    pagina = new PanicoPage({ currentUser: { uid: 'ana' } } as Auth, tarjetas);
  });

  it('muestra un recordatorio aunque no haya tarjetas', () => {
    pagina.abrirTarjeta();
    expect(pagina.tarjetaAbierta).toBe(true);
    expect(pagina.tarjetaPersonal).toBe(false);
    expect(pagina.textoTarjeta).toContain('paso a paso');
  });

  it('solo lee las tarjetas de la cuenta actual', () => {
    tarjetas.guardar('bea', 'Mensaje de otra cuenta');
    tarjetas.guardar('ana', 'Mi recordatorio');
    pagina.abrirTarjeta();
    expect(pagina.textoTarjeta).toBe('Mi recordatorio');
    expect(pagina.tarjetaPersonal).toBe(true);
  });

  it('mantiene un mensaje de apoyo si falla el almacenamiento', () => {
    localStorage.setItem('passiflora:tarjetas:v1:ana', 'datos dañados');
    pagina.abrirTarjeta();
    expect(pagina.textoTarjeta).toContain('paso a paso');
    expect(pagina.tarjetaPersonal).toBe(false);
  });

  it('limpia el mensaje al salir para no dejar datos de la cuenta anterior', () => {
    tarjetas.guardar('ana', 'Mi recordatorio');
    pagina.abrirTarjeta();
    pagina.ionViewWillLeave();
    expect(pagina.tarjetaAbierta).toBe(false);
    expect(pagina.textoTarjeta).toBe('');
  });
});
