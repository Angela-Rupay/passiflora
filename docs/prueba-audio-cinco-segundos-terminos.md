# Audio de cinco segundos y aceptación de términos

## Actualizar Android

```bash
git pull --ff-only origin feature/entrega-passiflora
npm run build
npx cap sync android
npx cap open android
```

Ejecutar otra vez la app desde Android Studio para incluir el procesador de audio de `assets/audio/grabador.js`.

## Audio

1. En anclaje, grabar un sonido: al terminar, el reproductor debe indicar `0:05`.
2. Pulsar **Grabar de nuevo** tres veces: cada nuevo archivo debe seguir durando cinco segundos y contener solo el sonido de su propia captura.
3. Repetir en Sonido 2 y Sonido 3 y comprobar que cada uno tiene una grabación independiente.
4. Cancelar o salir durante la captura: debe detenerse el micrófono sin reemplazar la grabación anterior.

La duración se limita a cinco segundos de muestras PCM en un AudioWorklet y se genera un archivo WAV con duración explícita. No depende de las marcas temporales del contenedor MediaRecorder ni de que un temporizador de la interfaz se ejecute a tiempo. Cada captura crea un procesador y búfer nuevos. Requiere una versión actualizada de Android System WebView con AudioWorklet.

## Registro

1. Abrir **Términos de uso y privacidad** y comprobar que se puede leer sin abandonar el formulario.
2. Completar los datos sin marcar aceptación: el registro debe seguir deshabilitado.
3. Marcar aceptación: el registro se habilita si el resto del formulario es válido.
4. Crear una cuenta y comprobar en Firestore el campo `terminos` del perfil: `aceptados`, `version` y `fecha`.

La validación se aplica en el formulario y en el servicio de registro. El texto describe el uso académico y las funcionalidades actuales de la app; se puede adaptar antes de una publicación externa.

## Verificación técnica

- 87 pruebas dirigidas, incluidas duración WAV a 44,1/48 kHz, reemplazo independiente y aceptación obligatoria.
- `node scripts/test-audio-worklet.cjs` ejecuta el procesador real con entradas simuladas y verifica dos capturas consecutivas de exactamente cinco segundos.
- Compilación web y sincronización de Capacitor Android. Queda pendiente escuchar y comprobar los archivos en el teléfono.
