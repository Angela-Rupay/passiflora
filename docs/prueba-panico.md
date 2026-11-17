# Espacio del botón de pánico

## Actualizar

```bash
git pull --ff-only origin feature/entrega-passiflora
npm start
```

## Comprobar

1. En Inicio, Ejercicios y Mi espacio, comprobar que hay un botón rojo de pánico en la cabecera, junto a tema y cierre de sesión.
2. Pulsarlo y elegir **Seguir aquí**: debe conservar la pestaña sin navegar.
3. Pulsarlo y elegir **Entrar**: debe abrir el espacio de calma, con fondo nocturno, poco texto y cuatro botones grandes. Al volver al resto de la app se conserva el tema anterior.
4. **Respirar** abre la selección de ejercicios. El botón **Volver** de respiración debe regresar al espacio de calma.
5. **Ejercicio de anclaje** abre la técnica 5-4-3-2-1. El regreso y el botón final llevan al espacio de calma. No se cambiaron cámara, micrófono ni permisos en este bloque.
6. **Tarjetas de realidad** abre un modal con un mensaje de la cuenta actual. Si no hay tarjetas, usa un recordatorio de Passiflora. Cerrar el modal conserva la página.
7. **Volver a mi espacio** lleva a Inicio.
8. En Ejercicios ya no aparece la tarjeta de anclaje. Su ruta es `/panico/anclaje`; la ruta anterior `/anclaje` redirige al espacio de pánico.
9. Revisar la confirmación, las cuatro opciones y la tarjeta en una pantalla móvil y en ambos temas.

Las tarjetas se leen del almacenamiento local ya implementado; no se copian a Firestore. No se cambiaron el diario ni la integración Android.
