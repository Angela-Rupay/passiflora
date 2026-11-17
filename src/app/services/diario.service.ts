import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface NuevoRegistroEmocional {
  fecha: string;
  emocionPrincipal: string;
  emoji: string;
  subemocion: string;
  intensidad: number;
  color: string;
}
export interface RegistroEmocional extends NuevoRegistroEmocional {
  id: string;
  pendiente: boolean;
  creadoEnMs: number;
}
export interface HistorialEmocional {
  registros: RegistroEmocional[];
  desdeCache: boolean;
}

export function registroValido(datos: NuevoRegistroEmocional): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) return false;
  const fecha = new Date(`${datos.fecha}T12:00:00Z`);
  return (
    Number.isFinite(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === datos.fecha &&
    typeof datos.emocionPrincipal === 'string' &&
    !!datos.emocionPrincipal.trim() &&
    typeof datos.subemocion === 'string' &&
    !!datos.subemocion.trim() &&
    typeof datos.emoji === 'string' &&
    typeof datos.color === 'string' &&
    /^#[a-f\d]{6}$/i.test(datos.color) &&
    Number.isInteger(datos.intensidad) &&
    datos.intensidad >= 1 &&
    datos.intensidad <= 10
  );
}

@Injectable({ providedIn: 'root' })
export class DiarioService {
  constructor(
    private firestore: Firestore,
    private injector: Injector,
  ) {}
  private ruta(uid: string): string {
    if (!uid.trim() || uid.includes('/')) throw new Error('Sesión inválida.');
    return `usuarios/${uid}/registrosEmocionales`;
  }

  observar(uid: string): Observable<HistorialEmocional> {
    return new Observable((observador) =>
      runInInjectionContext(this.injector, () => {
        const consulta = query(collection(this.firestore, this.ruta(uid)), orderBy('fecha', 'desc'));
        return onSnapshot(
          consulta,
          { includeMetadataChanges: true },
          (snapshot) => {
            const registros: RegistroEmocional[] = [];
            for (const documento of snapshot.docs) {
              const datos = documento.data();
              const registro = datos as NuevoRegistroEmocional;
              if (!registroValido(registro)) continue;
              const creado = datos['creadoEn'];
              registros.push({
                ...registro,
                id: documento.id,
                pendiente: documento.metadata.hasPendingWrites,
                creadoEnMs: creado && typeof creado.toMillis === 'function' ? creado.toMillis() : 0,
              });
            }
            registros.sort(
              (a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEnMs - a.creadoEnMs || a.id.localeCompare(b.id),
            );
            observador.next({ registros, desdeCache: snapshot.metadata.fromCache });
          },
          (error) => observador.error(error),
        );
      }),
    );
  }

  guardar(uid: string, datos: NuevoRegistroEmocional): Promise<void> {
    if (!registroValido(datos)) return Promise.reject(new Error('Revisa la fecha, emoción e intensidad del registro.'));
    return runInInjectionContext(this.injector, () => {
      const destino = doc(collection(this.firestore, this.ruta(uid)));
      return setDoc(destino, {
        fecha: datos.fecha,
        emocionPrincipal: datos.emocionPrincipal,
        emoji: datos.emoji,
        subemocion: datos.subemocion,
        intensidad: datos.intensidad,
        color: datos.color,
        creadoEn: serverTimestamp(),
      });
    });
  }
}
