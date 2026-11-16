# Bloque 1: tarjetas de realidad

Rama: `feature/entrega-passiflora`.

## Actualizar y ejecutar

```bash
git switch feature/entrega-passiflora
git pull --ff-only origin feature/entrega-passiflora
npm ci --legacy-peer-deps
npm start
```

## Prueba manual

1. Iniciar sesión y abrir **Mis tarjetas de realidad** desde Inicio.
2. Comprobar la explicación y el estado vacío.
3. Escribir una tarjeta, guardarla y verificar el mensaje de confirmación.
4. Recargar la página: la tarjeta debe conservarse.
5. Editarla y guardar; repetir recarga para comprobar el cambio.
6. Editarla otra vez, cambiar el texto y cancelar: debe conservarse el texto guardado.
7. Intentar eliminarla, elegir **Conservar** y comprobar que sigue ahí.
8. Eliminarla y confirmar: debe desaparecer incluso tras recargar.
9. Crear otra tarjeta, cerrar sesión e iniciar con otra cuenta: no debe mostrar la tarjeta de la primera cuenta. Volver a la cuenta original: debe seguir disponible.
10. Revisar en los temas claro y oscuro y en una pantalla móvil; los botones deben respetar la paleta.
11. Con una sesión ya iniciada, desconectar la red e intentar crear y editar: el guardado de tarjetas no necesita conexión.

Los datos usan `localStorage`, con una clave por UID. Se conservan entre aperturas en la misma instalación/origen, sin sincronización remota. Borrar datos de la aplicación, del navegador o desinstalar puede eliminarlos. La prueba del navegador y la instalación Android tienen almacenes independientes.

## Comprobaciones automatizadas

```bash
npm run test:unit -- --include='src/app/services/tarjetas.service.spec.ts'
npm run build
```

Las pruebas verifican persistencia con nueva instancia del servicio, edición y borrado, separación entre cuentas, validación de texto, datos dañados y fallo de escritura. La validación en el teléfono queda pendiente.
