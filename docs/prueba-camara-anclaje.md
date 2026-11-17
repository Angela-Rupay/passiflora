# Fotos del anclaje: permiso y captura

## Actualizar el teléfono

```bash
git pull --ff-only origin feature/entrega-passiflora
npm run build
npx cap sync android
npx cap open android
```

En Android Studio, ejecutar de nuevo la app en el teléfono para instalar el manifiesto actualizado. Recargar solamente el navegador no actualiza los permisos de Android.

## Comprobar

1. Abrir el anclaje desde el espacio de pánico: no debe abrir la cámara ni pedir permiso al entrar.
2. Pulsar **Tomar foto**: debe aparecer el aviso de Passiflora. Elegir **Ahora no** no debe abrir la cámara ni solicitar el permiso del sistema.
3. Pulsar de nuevo y aceptar. Si no está concedido, Android debe solicitar el permiso de cámara. Rechazarlo no debe abrir la cámara y debe mostrar cómo habilitar el permiso en Ajustes.
4. Conceder el permiso y tomar una foto: la vista debe mostrar la miniatura y aumentar el contador sin otro clic.
5. Cancelar la cámara: el botón debe volver a estar disponible sin agregar una foto.
6. Tomar cinco fotos: no debe permitir una sexta. Eliminar una debe permitir reemplazarla.
7. Los toques repetidos mientras se abre no deben lanzar varias cámaras o selectores.

El aviso de Passiflora se presenta antes de la primera foto de cada sesión del ejercicio; después de capturarla no se repite para las siguientes. Si se cancela o deniega antes de obtener esa primera foto, se puede volver a intentar. El diálogo de Android depende del estado del permiso y no se puede forzar si el sistema ya lo recuerda. Si se deniega de forma permanente, habilitarlo en Ajustes → Aplicaciones → Passiflora → Permisos → Cámara.

En navegador se utiliza el selector de imágenes/captura gestionado por el navegador; la comprobación del permiso nativo corresponde a la instalación Android.

Las imágenes se mantienen en la sesión del ejercicio como datos de imagen reducidos, sin subirlas a Firebase ni guardarlas en la galería. Este cambio no modifica la grabación ni el permiso del micrófono.

Validación en desarrollo: compilación web, sincronización de Capacitor Android y 77 pruebas dirigidas, con cámara simulada. La concesión/denegación real y la captura requieren la comprobación en el teléfono.
