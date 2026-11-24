import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroEmocional } from '../../services/diario.service';
import { etiquetaSemana, lunesDeSemana, resumirSemana } from '../resumen-emocional';

@Component({
  selector: 'app-resumen-emocional', standalone: true, imports: [CommonModule],
  template: `
    <section aria-labelledby="titulo-resumen" class="resumen">
      <p class="eyebrow">UN MOMENTO PARA CONOCERTE</p>
      <h2 id="titulo-resumen">Tu semana en emociones</h2>
      <label for="semana-resumen">Semana que quieres consultar</label>
      <select id="semana-resumen" [value]="seleccionada" (change)="elegir($event)">
        <option *ngFor="let semana of semanas" [value]="semana.clave">{{ semana.etiqueta }}</option>
      </select>
      <p *ngIf="desdeCache" class="nota">Resumen de los registros disponibles en este dispositivo. Puede cambiar al sincronizar.</p>
      <div aria-live="polite">
        <p *ngIf="!resumen.total" class="vacio">Todavía no hay registros en esta semana. Cuando registres cómo te sientes, verás aquí tu resumen. 💜</p>
        <ng-container *ngIf="resumen.total">
          <dl class="cifras">
            <div><dt>Registros</dt><dd>{{ resumen.total }}</dd></div>
            <div><dt>Días registrados</dt><dd>{{ resumen.dias }} de 7</dd></div>
            <div><dt>Intensidad promedio</dt><dd>{{ resumen.promedio | number:'1.1-1' }} / 10</dd></div>
          </dl>
          <p><strong>Emociones más frecuentes:</strong> {{ resumen.frecuentes }}</p>
          <h3>Emociones que registraste</h3>
          <ul>
            <li *ngFor="let emocion of resumen.emociones">
              <div class="fila"><span>{{ emocion.nombre }}</span><strong>{{ emocion.cantidad }} de {{ resumen.total }}</strong></div>
              <div class="pista" aria-hidden="true"><div class="barra" [style.width.%]="emocion.porcentaje"></div></div>
            </li>
          </ul>
        </ng-container>
      </div>
      <p class="nota">Cada registro cuenta por igual. Este resumen describe lo que anotaste; no es un diagnóstico ni una evaluación de tu progreso.</p>
    </section>`,
  styles: [`
    .resumen { background: var(--bg-tarjeta); color: var(--texto-principal); border-radius: 24px; padding: 20px; margin-top: 24px; }
    .eyebrow { color: var(--color-primario); font-size: .8rem; font-weight: 800; }
    h2 { margin: 8px 0 20px; } h3 { font-size: 1rem; margin-top: 24px; }
    label { display: block; font-weight: 700; margin-bottom: 8px; }
    select { width: 100%; max-width: 100%; min-height: 48px; border: 1px solid var(--color-primario); border-radius: 14px; padding: 12px; background: var(--bg-icono); color: var(--texto-principal); font-size: .9rem; }
    select:focus-visible { outline: 3px solid var(--color-primario); outline-offset: 3px; }
    .cifras { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin: 20px 0; }
    .cifras div { background: var(--bg-icono); padding: 16px; border-radius: 16px; }
    dt { font-size: .85rem; } dd { margin: 8px 0 0; color: var(--color-primario); font-weight: 800; font-size: 1.3rem; }
    ul { list-style: none; padding: 0; } li { margin: 18px 0; }
    .fila { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .pista { height: 10px; border-radius: 8px; background: var(--bg-icono); margin-top: 8px; overflow: hidden; }
    .barra { height: 100%; background: var(--color-primario); border-radius: inherit; }
    .nota, .vacio { color: var(--texto-secundario); line-height: 1.6; } .nota { font-size: .85rem; }
  `],
})
export class ResumenEmocionalComponent implements OnChanges {
  @Input() registros: RegistroEmocional[] = [];
  @Input() desdeCache = false;
  semanas: { clave: string; etiqueta: string }[] = [];
  seleccionada = '';
  resumen = resumirSemana([], '');
  ngOnChanges() {
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const actual = lunesDeSemana(fecha);
    const claves = [...new Set([actual, ...this.registros.map(r => lunesDeSemana(r.fecha))])].sort().reverse();
    this.semanas = claves.map(clave => ({ clave, etiqueta: etiquetaSemana(clave) }));
    if (!claves.includes(this.seleccionada)) this.seleccionada = actual;
    this.actualizar();
  }
  elegir(evento: Event) {
    const clave = (evento.target as HTMLSelectElement).value;
    if (!this.semanas.some(s => s.clave === clave)) return;
    this.seleccionada = clave;
    this.actualizar();
  }
  private actualizar() { this.resumen = resumirSemana(this.registros, this.seleccionada); }
}
