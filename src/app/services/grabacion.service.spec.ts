import { describe, expect, it } from 'vitest';
import { audioWav } from './grabacion.service';

describe('Duración real de los audios del anclaje', () => {
  it('genera WAV de cinco segundos y limita cualquier exceso de muestras', async () => {
    for (const frecuencia of [44100, 48000]) {
      const blob = audioWav(new Float32Array(frecuencia * 26), frecuencia);
      const vista = new DataView(await blob.arrayBuffer());
      expect(blob.type).toBe('audio/wav');
      const segundos = vista.getUint32(40, true) / vista.getUint32(28, true);
      expect(segundos).toBe(5);
      expect(blob.size).toBe(44 + frecuencia * 5 * 2);
    }
  });
  it('cada nueva grabación tiene su propio contenido y duración', async () => {
    const frecuencia = 48000;
    const primero = audioWav(new Float32Array(frecuencia * 5).fill(0.5), frecuencia);
    const segundo = audioWav(new Float32Array(frecuencia * 5).fill(-0.5), frecuencia);
    const a = new DataView(await primero.arrayBuffer());
    const b = new DataView(await segundo.arrayBuffer());
    expect(primero.size).toBe(segundo.size);
    expect(a.getInt16(44, true)).toBeGreaterThan(0);
    expect(b.getInt16(44, true)).toBeLessThan(0);
    expect(b.getUint32(40, true) / b.getUint32(28, true)).toBe(5);
  });
});
