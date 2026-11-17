# Nombres sin números y visibilidad de contraseña

## Comprobar en la app

1. En registro, intentar escribir números en Nombre y Apellido: no deben entrar.
2. Pegar `Ángela12 Muñoz３`: deben conservarse solo `Ángela Muñoz`. Las tildes, ñ y espacios siguen permitidos.
3. Probar el ojo de contraseña en registro e ingreso: permite alternar entre mostrar y ocultar sin cambiar el texto ni enviar el formulario.
4. Salir y volver a la pantalla: la contraseña debe volver a estar oculta.
5. Abrir respiración: ya no deben aparecer los iconos de hoja del encabezado ni de sus opciones.

## Capas de validación

- Los campos del formulario filtran caracteres no permitidos al escribir o pegar.
- El servicio `AuthService.registrar` valida nombre completo, correo y contraseña antes de llamar a Firebase, aunque se omita el formulario.
- Esta validación Angular no equivale a una regla de servidor. El repositorio no contiene las reglas de Firestore desplegadas. Falta revisar las reglas actuales para integrar la restricción del nombre en el backend sin sustituir permisos existentes. No se han desplegado cambios de reglas.
