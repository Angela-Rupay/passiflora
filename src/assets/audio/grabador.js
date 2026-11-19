/* Captura mono de cinco segundos, limitada por muestras en el hilo de audio. */
class GrabadorCincoSegundos extends AudioWorkletProcessor {
  constructor() {
    super();
    this.muestras = new Float32Array(Math.round(sampleRate * 5));
    this.posicion = 0;
    this.ultimoAviso = 0;
  }
  process(entradas) {
    const canal = entradas[0]?.[0];
    if (!canal) return true;
    const cantidad = Math.min(canal.length, this.muestras.length - this.posicion);
    this.muestras.set(canal.subarray(0, cantidad), this.posicion);
    this.posicion += cantidad;
    if (this.posicion >= this.muestras.length) {
      this.port.postMessage({ tipo: 'fin', frecuencia: sampleRate, muestras: this.muestras }, [this.muestras.buffer]);
      return false;
    }
    if (this.posicion - this.ultimoAviso >= sampleRate / 5) {
      this.ultimoAviso = this.posicion;
      this.port.postMessage({ tipo: 'progreso', segundos: this.posicion / sampleRate });
    }
    return true;
  }
}
registerProcessor('grabador-cinco-segundos', GrabadorCincoSegundos);
