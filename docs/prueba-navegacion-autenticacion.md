# Correcciones: navegación y autenticación

## Actualización

```bash
git switch feature/entrega-passiflora
git pull --ff-only origin feature/entrega-passiflora
npm start
```

## Prueba manual

1. Sin sesión, abrir la aplicación: debe mostrar el login. Acceder directamente a `/tabs/tab1`, `/gad7` o `/tarjetas` debe redirigir a `/login`.
2. En login, pulsar **Regístrate aquí**: debe abrir el único formulario de registro.
3. Comprobar nombres con tildes y apellidos. Solo espacios y números no deben ser válidos.
4. Probar un correo inválido y una contraseña sin mayúscula, número o menos de ocho caracteres. El botón debe seguir deshabilitado y el checklist debe actualizarse.
5. Crear una cuenta nueva con correo .com o .co y datos válidos. Debe crearse en Firebase y abrir el GAD-7; no debe saltar directamente a Inicio.
6. Completar el GAD-7 y entrar a Inicio: comprobar el nombre de la cuenta y abrir **Respira conmigo**.
7. Cerrar sesión y registrar el mismo correo: el aviso debe ofrecer **Ir a inicio de sesión** y **Cambiar correo**, uno debajo de otro. Cancelar debe conservar el formulario.
8. Probar credenciales incorrectas y comprobar que aparece un error y se puede reintentar. Firebase puede devolver `auth/invalid-credential` sin distinguir correo inexistente de contraseña incorrecta; en ese caso se muestra un mensaje conjunto.
9. Iniciar sesión con credenciales correctas y recargar la app: debe recuperar la sesión y abrir Inicio.
10. Comprobar registro, login y aviso de correo duplicado en ambos temas. Los textos, fondos, botones y logo deben respetar la paleta.
11. Volver a las tarjetas y comprobar que siguen guardadas.

Las pruebas automatizadas usan servicios simulados y cubren validaciones, registro exitoso, correo duplicado, bloqueo de doble envío, fallo de red, ingreso y guardia de sesión. La creación real de la cuenta y los permisos de Firestore deben comprobarse con la configuración Firebase del proyecto.
