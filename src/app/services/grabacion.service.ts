import { Injectable } from '@angular/core';

export function audioWav(muestras: Float32Array, frecuencia: number): Blob {
  const limite = Math.min(muestras.length, Math.round(frecuencia * 5));
  const buffer = new ArrayBuffer(44 + limite * 2);
  const vista = new DataView(buffer);
  const texto = (posicion: number, valor: string) => {
    for (let i = 0; i < valor.length; i++) vista.setUint8(posicion + i, valor.charCodeAt(i));
  };
  texto(0, 'RIFF');
  vista.setUint32(4, 36 + limite * 2, true);
  texto(8, 'WAVE');
  texto(12, 'fmt ');
  vista.setUint32(16, 16, true);
  vista.setUint16(20, 1, true);
  vista.setUint16(22, 1, true);
  vista.setUint32(24, frecuencia, true);
  vista.setUint32(28, frecuencia * 2, true);
  vista.setUint16(32, 2, true);
  vista.setUint16(34, 16, true);
  texto(36, 'data');
  vista.setUint32(40, limite * 2, true);
  for (let i = 0; i < limite; i++) {
    const valor = Math.max(-1, Math.min(1, muestras[i]));
    vista.setInt16(44 + i * 2, Math.round(valor * (valor < 0 ? 32768 : 32767)), true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

@Injectable({ providedIn: 'root' })
export class GrabacionService {
  async iniciar(
    flujo: MediaStream,
    signal: AbortSignal,
    progreso: (segundos: number) => void,
    fin: (audio: Blob) => void,
    fallo: () => void,
  ): Promise<void> {
    const contexto = new AudioContext();
    let fuente: MediaStreamAudioSourceNode | undefined;
    let nodo: AudioWorkletNode | undefined;
    let cerrado = false;
    const limpiar = () => {
      if (cerrado) return;
      cerrado = true;
      if (nodo) {
        nodo.port.onmessage = null;
        nodo.onprocessorerror = null;
        nodo.disconnect();
      }
      fuente?.disconnect();
      flujo.getTracks().forEach((pista) => pista.stop());
      void contexto.close().catch(() => undefined);
      signal.removeEventListener('abort', limpiar);
    };
    signal.addEventListener('abort', limpiar, { once: true });
    try {
      if (signal.aborted) {
        limpiar();
        return;
      }
      if (!contexto.audioWorklet) throw new Error('Actualiza Android System WebView para grabar sonidos en esta app.');
      await contexto.audioWorklet.addModule(new URL('assets/audio/grabador.js', document.baseURI).href);
      if (signal.aborted) return;
      nodo = new AudioWorkletNode(contexto, 'grabador-cinco-segundos');
      nodo.port.onmessage = (evento) => {
        if (cerrado || signal.aborted) return;
        const datos = evento.data;
        if (datos.tipo === 'progreso') progreso(datos.segundos);
        else if (datos.tipo === 'fin') {
          const audio = audioWav(datos.muestras, datos.frecuencia);
          limpiar();
          fin(audio);
        }
      };
      nodo.onprocessorerror = () => {
        if (!cerrado) {
          limpiar();
          fallo();
        }
      };
      fuente = contexto.createMediaStreamSource(flujo);
      fuente.connect(nodo);
      nodo.connect(contexto.destination);
      await contexto.resume();
      if (signal.aborted) return;
      if (contexto.state !== 'running') throw new Error('No pudimos iniciar el audio. Pulsa Grabar de nuevo.');
    } catch (error) {
      limpiar();
      if (!signal.aborted) throw error;
    }
  }
}
