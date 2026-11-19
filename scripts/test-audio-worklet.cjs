const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
let Grabador;
class Procesador { constructor() { this.mensajes = []; this.port = { postMessage: mensaje => this.mensajes.push(mensaje) }; } }
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/assets/audio/grabador.js'), 'utf8'), {
  AudioWorkletProcessor: Procesador, sampleRate: 48000, Float32Array,
  registerProcessor: (_nombre, tipo) => { Grabador = tipo; }
});
for (const valor of [.5, -.5]) {
  const grabador = new Grabador();
  let continuar = true;
  let bloques = 0;
  while (continuar && bloques < 10000) { continuar = grabador.process([[new Float32Array(128).fill(valor)]]); bloques++; }
  assert.equal(continuar, false);
  const finales = grabador.mensajes.filter(m => m.tipo === 'fin');
  assert.equal(finales.length, 1);
  assert.equal(finales[0].muestras.length / finales[0].frecuencia, 5);
  assert.equal(finales[0].muestras[0], valor);
  assert.equal(finales[0].muestras.at(-1), valor);
}
console.log('PASS: dos capturas independientes de exactamente cinco segundos en el procesador de audio.');
