# Tipografía, tarjetas y cabecera compartidas

Actualizar la rama e instalar la fuente incluida con la aplicación:

```bash
git pull --ff-only origin feature/entrega-passiflora
npm ci --legacy-peer-deps
npm start
```

## Comprobar

- Inicio, Ejercicios y Mi espacio muestran la misma cabecera con el logo PNG, cambio de tema y cierre de sesión.
- Cambiar el tema en cada pestaña y pasar a las otras: colores, calendario y barra inferior deben conservar el tema activo.
- Cerrar sesión desde cada pestaña y comprobar que vuelve al login.
- En Inicio, las tres opciones usan la misma tarjeta con icono, título, descripción y flecha. Probar respiración, GAD-7 y tarjetas de realidad.
- Revisar las tres pestañas en móvil y escritorio: el contenido tiene márgenes y ancho de lectura comunes, sin tarjetas estiradas a todo el monitor.
- Revisar login, registro, GAD-7, tarjetas, respiración y anclaje: usan Nunito, los mismos pesos de títulos y colores del tema.
- Nunito se incluye en el paquete de la app; no requiere una descarga de Google Fonts al abrirla.

Validación automática: compilación de producción y 27 pruebas dirigidas de acciones de las pestañas, cabecera, navegación, autenticación y tarjetas. La revisión visual en el dispositivo queda pendiente.
