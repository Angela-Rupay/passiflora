import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RespiracionPage } from './respiracion.page';

describe('Respiración: tiempos, guía visual y controles', () => {
  let pagina: RespiracionPage;
  beforeEach(() => {
    vi.useFakeTimers();
    pagina = new RespiracionPage(
      { navigate: vi.fn() } as unknown as Router,
      { markForCheck: vi.fn() } as unknown as ChangeDetectorRef,
      { snapshot: { queryParamMap: { get: () => null } } } as unknown as ActivatedRoute,
    );
  });
  afterEach(() => {
    pagina.ngOnDestroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('define 4-7-8, doble inhalación y una práctica diafragmática de dos minutos', () => {
    expect(pagina.ejercicios.map((e) => e.id)).toEqual(['caja', '478', 'suspiro', 'diafragmatica']);
    expect(pagina.ejercicios[1].fases.map((f) => f.duracion)).toEqual([4, 7, 8]);
    expect(pagina.ejercicios[2].fases.map((f) => f.tipo)).toEqual(['inhala', 'segunda-inhalacion', 'exhala']);
    pagina.seleccionarEjercicio(pagina.ejercicios[3]);
    expect(pagina.duracionTotalMs).toBe(120000);
  });

  it('recorre los cuatro lados de la caja con el mismo tiempo del contador', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[0]);
    pagina.iniciar();
    vi.advanceTimersByTime(2000);
    expect(pagina.tiempoRestante).toBe(2);
    expect(pagina.puntoCuadrado).toEqual({ x: 100, y: 20 });
    vi.advanceTimersByTime(2000);
    expect(pagina.faseActual).toBe(1);
    expect(pagina.puntoCuadrado).toEqual({ x: 180, y: 20 });
    vi.advanceTimersByTime(4000);
    expect(pagina.puntoCuadrado).toEqual({ x: 180, y: 180 });
    vi.advanceTimersByTime(4000);
    expect(pagina.puntoCuadrado).toEqual({ x: 20, y: 180 });
    vi.advanceTimersByTime(4000);
    expect(pagina.ciclos).toBe(1);
    expect(pagina.puntoCuadrado).toEqual({ x: 20, y: 20 });
  });

  it('respeta las transiciones 4, 7 y 8 segundos y termina tras cuatro ciclos', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[1]);
    pagina.iniciar();
    vi.advanceTimersByTime(4000);
    expect(pagina.faseNombre).toBe('Mantén');
    expect(pagina.tiempoRestante).toBe(7);
    vi.advanceTimersByTime(7000);
    expect(pagina.faseNombre).toBe('Exhala');
    expect(pagina.tiempoRestante).toBe(8);
    vi.advanceTimersByTime(8000);
    expect(pagina.ciclos).toBe(1);
    vi.advanceTimersByTime(57000);
    expect(pagina.finalizado).toBe(true);
    expect(pagina.ciclos).toBe(4);
    expect(pagina.progreso).toBe(1);
    expect(pagina.tiempoRestante).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('pausa sin reiniciar la fase, el contador ni el punto de la animación', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[0]);
    pagina.iniciar();
    vi.advanceTimersByTime(1250);
    pagina.pausar();
    const punto = pagina.puntoCuadrado;
    vi.advanceTimersByTime(10000);
    expect(pagina.transcurridoMs).toBe(1250);
    expect(pagina.puntoCuadrado).toEqual(punto);
    pagina.iniciar();
    vi.advanceTimersByTime(2750);
    expect(pagina.faseActual).toBe(1);
    expect(pagina.tiempoRestante).toBe(4);
  });

  it('guía las dos inhalaciones del suspiro sin saltos de escala', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[2]);
    pagina.iniciar();
    vi.advanceTimersByTime(3000);
    expect(pagina.faseNombre).toBe('Inhala un poco más');
    expect(pagina.escala).toBeCloseTo(0.9);
    vi.advanceTimersByTime(1000);
    expect(pagina.faseNombre).toBe('Exhala suave');
    expect(pagina.escala).toBe(1);
    vi.advanceTimersByTime(46000);
    expect(pagina.finalizado).toBe(true);
    expect(pagina.ciclos).toBe(5);
  });

  it('completa exactamente dos minutos de respiración diafragmática', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[3]);
    pagina.iniciar();
    vi.advanceTimersByTime(119950);
    expect(pagina.finalizado).toBe(false);
    vi.advanceTimersByTime(50);
    expect(pagina.finalizado).toBe(true);
    expect(pagina.ciclos).toBe(12);
  });

  it('distingue terminar antes de completar y permite repetir desde cero', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[1]);
    pagina.iniciar();
    vi.advanceTimersByTime(2500);
    pagina.finalizar();
    expect(pagina.terminadoAntes).toBe(true);
    expect(pagina.progreso).toBeLessThan(1);
    pagina.iniciar();
    expect(pagina.transcurridoMs).toBe(0);
    expect(pagina.terminadoAntes).toBe(false);
    expect(pagina.tiempoRestante).toBe(4);
  });

  it('no duplica temporizadores y los elimina al cambiar, salir o destruir', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[0]);
    pagina.iniciar();
    pagina.iniciar();
    expect(vi.getTimerCount()).toBe(1);
    pagina.elegirOtroEjercicio();
    expect(vi.getTimerCount()).toBe(0);
    expect(pagina.ejercicioSeleccionado).toBeNull();
    pagina.seleccionarEjercicio(pagina.ejercicios[1]);
    pagina.iniciar();
    pagina.ionViewWillLeave();
    expect(pagina.pausado).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    pagina.iniciar();
    pagina.ngOnDestroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('se pausa al ocultar la app', () => {
    pagina.seleccionarEjercicio(pagina.ejercicios[0]);
    pagina.iniciar();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    pagina.alCambiarVisibilidad();
    expect(pagina.pausado).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('vuelve al espacio de pánico cuando la práctica se abrió desde allí', () => {
    const navegar = vi.fn();
    const practica = new RespiracionPage(
      { navigate: navegar } as unknown as Router,
      { markForCheck: vi.fn() } as unknown as ChangeDetectorRef,
      { snapshot: { queryParamMap: { get: () => 'panico' } } } as unknown as ActivatedRoute,
    );
    practica.volver();
    expect(navegar).toHaveBeenCalledWith(['/panico']);
    practica.ngOnDestroy();
  });
});
