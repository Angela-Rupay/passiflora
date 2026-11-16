import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TarjetasService } from './tarjetas.service';

describe('TarjetasService: persistencia local por cuenta', () => {
  let servicio: TarjetasService;
  beforeEach(() => { localStorage.clear(); servicio = new TarjetasService(); vi.restoreAllMocks(); });

  it('recupera el contenido con una nueva instancia y permite editar y eliminar', () => {
    const [tarjeta] = servicio.guardar('ana', '  Puedo pedir compañía.  ');
    const recargado = new TarjetasService();
    expect(recargado.listar('ana')).toEqual([{ id: tarjeta.id, texto: 'Puedo pedir compañía.' }]);
    expect(recargado.guardar('ana', 'Paso a paso.', tarjeta.id)).toEqual([{ id: tarjeta.id, texto: 'Paso a paso.' }]);
    expect(recargado.eliminar('ana', tarjeta.id)).toEqual([]);
    expect(new TarjetasService().listar('ana')).toEqual([]);
  });

  it('separa usuarios incluso al editar o eliminar un id de otra cuenta', () => {
    const [tarjeta] = servicio.guardar('ana', 'Mi tarjeta');
    expect(servicio.listar('bea')).toEqual([]);
    expect(() => servicio.guardar('bea', 'Otro texto', tarjeta.id)).toThrow();
    servicio.eliminar('bea', tarjeta.id);
    expect(servicio.listar('ana')[0].texto).toBe('Mi tarjeta');
  });

  it('rechaza usuarios vacíos, texto vacío y texto demasiado largo', () => {
    expect(() => servicio.guardar('', 'Texto')).toThrow();
    expect(() => servicio.guardar('ana', '   ')).toThrow();
    expect(() => servicio.guardar('ana', 'a'.repeat(501))).toThrow();
    expect(servicio.listar('ana')).toEqual([]);
  });

  it('no reemplaza datos dañados con una lista vacía', () => {
    localStorage.setItem('passiflora:tarjetas:v1:ana', '{malformado');
    expect(() => servicio.guardar('ana', 'Texto nuevo')).toThrow();
    expect(localStorage.getItem('passiflora:tarjetas:v1:ana')).toBe('{malformado');
    localStorage.setItem('passiflora:tarjetas:v1:ana', '[{"id":5}]');
    expect(() => servicio.listar('ana')).toThrow();
  });

  it('propaga fallos de escritura sin modificar la versión persistida', () => {
    servicio.guardar('ana', 'Texto original');
    const guardado = localStorage.getItem('passiflora:tarjetas:v1:ana');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Sin espacio'); });
    expect(() => servicio.guardar('ana', 'Texto nuevo')).toThrow('Sin espacio');
    expect(localStorage.getItem('passiflora:tarjetas:v1:ana')).toBe(guardado);
  });
});
