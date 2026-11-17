# Ajustes de anclaje, respiración y permisos del micrófono

## Actualizar Android

```bash
git pull --ff-only origin feature/entrega-passiflora
npm run build
npx cap sync android
npx cap open android
```

Volver a ejecutar la app en el teléfono desde Android Studio. Este cambio agrega `RECORD_AUDIO` y `MODIFY_AUDIO_SETTINGS` al manifiesto. Capacitor ya gestiona el permiso de grabación de WebView al llamar a `getUserMedia({audio:true})`; no se reemplaza su WebChromeClient ni se conceden permisos automáticamente.

## Comprobar

1. Cámara: tomar la primera foto, aceptar el aviso y autorizar Android si lo solicita. Las fotos siguientes no deben repetir el aviso de Passiflora durante el ejercicio.
2. Respiración: comprobar que la instrucción de la fase y los mensajes finales aparecen por encima del dibujo. Solo el contador numérico queda dentro.
3. Tacto: abrir Textura y Temperatura. Debe aparecer un panel inferior con opciones grandes, colores del tema y **Cancelar**, sin el diálogo anterior con **CANCEL / OK**. Probar también el selector de sabor.
4. Oído: pulsar **Grabar 5 segundos** y cancelar el aviso. No debe solicitarse el dispositivo ni comenzar la grabación.
5. Aceptar el aviso y denegar el permiso Android: debe mostrar una explicación en español y permitir reintentar.
6. Autorizar y grabar: comprobar la cuenta atrás, que se termina a los cinco segundos y que se puede escuchar el resultado. El audio mantiene su formato real, sin etiquetarlo incorrectamente como MP3.
7. Grabar el segundo sonido: no debe repetir el aviso de Passiflora tras la primera grabación iniciada. Android puede recordar su permiso.
8. Cancelar una grabación: debe liberar el micrófono y permitir repetirla. **Grabar de nuevo** reemplaza el sonido anterior solo si se obtiene un audio válido.
9. Salir de la pantalla, retroceder un paso u ocultar la app mientras graba: el micrófono debe dejar de usarse. No se permiten grabaciones simultáneas.
10. Revisar los selectores y las etiquetas en ambos temas.

Las grabaciones se mantienen solo para el ejercicio, no se suben a Firestore. Al finalizar se liberan sus recursos temporales.

Validación en desarrollo: compilación, sincronización Android y 83 pruebas dirigidas con dispositivos simulados. Permisos reales, sonido y aspecto visual requieren la prueba en el teléfono.
