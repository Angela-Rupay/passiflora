# Entrega y validación

## Relación con la rúbrica

| Criterio | Peso | Implementación que se puede mostrar |
| --- | --- | --- |
| Arquitectura y código | 20 % | Componentes standalone, páginas por función, servicios inyectables, modelos TypeScript y validaciones compartidas |
| APIs y datos | 20 % | Petición REST a Jamendo, transformación de JSON, Firebase y persistencia local de tarjetas |
| Hardware y permisos | 25 % | Cámara y micrófono en el anclaje, autorización durante el uso y declaraciones en AndroidManifest |
| Diseño UI/UX | 15 % | Paleta compartida, Nunito, tarjetas, temas, controles accesibles y mensajes de estado/error |
| Despliegue APK | 20 % | Proyecto Android sincronizable y APK instalado y probado por el equipo en teléfono físico |

Esta tabla relaciona características con criterios; la calificación depende de la evaluación y de la demostración de la versión entregada.

## Preparar la demostración

1. Actualiza `master`, instala dependencias con `npm ci --legacy-peer-deps` y sigue la compilación del [README](../README.md).
2. Sincroniza con Capacitor y genera un APK desde Android Studio. Comprueba el APK que realmente vas a entregar.
3. Usa una cuenta y registros de demostración; evita proyectar información emocional o números personales que no quieras compartir.
4. Revisa permisos de cámara y micrófono: aceptación, denegación y posibilidad de omitir el paso.
5. Comprueba las barras del sistema, los selectores y los temas en el teléfono de la demostración.
6. Prueba el diario con conexión y al desconectar la red. El catálogo de Jamendo necesita internet.
7. Comprueba el enlace de WhatsApp con un contacto de demostración. Abrir el chat no obliga a enviar el mensaje.
8. Verifica las reglas de Firestore con dos cuentas; el aislamiento del cliente no es prueba de autorización del servidor.

## Comprobaciones automatizadas por funcionalidad

```bash
npm run build
node scripts/test-audio-worklet.cjs
npm run test:unit -- --include='src/app/services/*.service.spec.ts' --include='src/app/shared/**/*.spec.ts' --include='src/app/guards/sesion.guard.spec.ts' --include='src/app/pages/registro/**/*.spec.ts' --include='src/app/pages/gad7/gad7.page.spec.ts' --include='src/app/pages/anclaje/anclaje.page.spec.ts' --include='src/app/pages/panico/panico.page.spec.ts' --include='src/app/pages/respiracion/respiracion.page.spec.ts' --include='src/app/pages/ambientacion/ambientacion.page.spec.ts' --include='src/app/pages/tarjetas/tarjetas.page.spec.ts' --include='src/app/tab3/tab3.page.spec.ts'
```

Estas pruebas cubren las áreas funcionales enumeradas; no reemplazan el ensayo del APK en un dispositivo físico. Algunas pruebas heredadas del proyecto inicial requieren preparar sus proveedores o entorno antes de ejecutar toda la suite. `npm run lint` también incluye formato y comprobación de tipos E2E; no debe confundirse con la compilación de producción.

## Recorrido sugerido para la sustentación

| Momento | Acción | Qué permite explicar |
| --- | --- | --- |
| Entrada | Registro, términos y GAD-7 opcional | Validación, sesión y orientación |
| Inicio | Tema y tarjetas de realidad | Identidad visual y persistencia local |
| Calma | Anclaje, cámara y micrófono | Permisos y uso de hardware |
| Ejercicios | Respiración y música | Estado, temporización y API REST |
| Mi espacio | Perfil, diario, historial y resumen | Datos por cuenta, sincronización y cálculo de estadísticas |
| Apoyo | Contacto y acceso a WhatsApp | Enlace externo y decisión del usuario |

Para profundizar en las decisiones técnicas durante la exposición, utiliza los diagramas de [arquitectura](arquitectura.md), [navegación](flujo-aplicacion.md) y [flujo de datos](datos-y-seguridad.md).
