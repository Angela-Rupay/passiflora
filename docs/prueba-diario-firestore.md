# Diario emocional: sincronización con Firestore

## Actualizar

```bash
git pull --ff-only origin feature/entrega-passiflora
npm start
```

## Comprobar con Firebase real

1. Iniciar sesión y abrir **Mi espacio**. Esperar a que termine la carga del historial.
2. Seleccionar fecha, emoción, matiz e intensidad. Guardar una sola vez: el botón muestra **Guardando…** y se bloquea para evitar duplicados.
3. Esperar la confirmación de guardado. Debe aparecer una sola entrada en el historial y limpiarse la selección de emoción.
4. Recargar la app e iniciar con la misma cuenta: debe recuperar la entrada.
5. En Firebase Console → Firestore → Datos, revisar `usuarios/{UID}/registrosEmocionales`. El documento contiene fecha, emoción, matiz, intensidad, emoji, color y `creadoEn` (marca de tiempo del servidor).
6. Abrir la misma cuenta en otra ventana o dispositivo. Guardar allí una emoción y comprobar que aparece en la primera ventana sin recargar.
7. Cerrar sesión y entrar con otra cuenta: no debe mostrar ni escribir registros de la cuenta anterior. Volver a la cuenta original y comprobar que conserva su historial.
8. Desconectar internet antes de guardar: debe mantener la selección, indicar falta de conexión y bloquear el botón hasta reconectar.
9. Si se pierde la conexión durante un guardado, puede aparecer **Pendiente de sincronizar**. No se anuncia éxito hasta que Firestore confirma. Mantener la app abierta y reconectar para completar la operación.
10. Ante un fallo de lectura, usar **Volver a intentar**. Ante un fallo de escritura, la selección debe conservarse en la pantalla para reintentar.

## Implementación

- Suscripción de sesión y escucha `onSnapshot` por UID, con actualizaciones de metadatos de sincronización.
- Guardado mediante `setDoc`; la confirmación de la promesa corresponde al servidor.
- El historial procede de la escucha, evitando agregar una segunda copia al terminar el guardado.
- Orden por fecha y, dentro del mismo día, por la marca de creación disponible. Los documentos antiguos sin `creadoEn` siguen siendo compatibles.
- Se conserva la ruta y el formato de los campos anteriores. Las reglas que limitan el diario al propietario siguen siendo aplicables; no se modificaron ni desplegaron reglas desde este entorno.
- No se añadió otro almacén local del diario. Las tarjetas de realidad mantienen su almacenamiento local separado.

Las pruebas automatizadas usan datos y servicios simulados; validan el comportamiento de la app, no la conectividad o los permisos del proyecto real. El guardado real y la sincronización entre dispositivos requieren la comprobación anterior con tu sesión.
