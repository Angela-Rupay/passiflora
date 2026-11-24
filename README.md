# Passiflora 🌸

Aplicación móvil de bienestar emocional desarrollada por **Ángela Rupay y Valeria Vargas**. Ofrece herramientas para acompañar momentos de ansiedad y registrar cómo nos sentimos. Su nombre conecta con la flor de la pasiflora y con la identidad del Huila.

Passiflora es un proyecto académico con vocación de acceso gratuito. Sus herramientas y el cuestionario GAD-7 son orientativos y no sustituyen la atención profesional.

## Qué puedes hacer

- Crear una cuenta e iniciar sesión con correo y contraseña.
- Responder u omitir el GAD-7 al registrarte y volver a consultarlo desde Inicio.
- Practicar respiración guiada con animaciones, pausas y temporizadores.
- Acceder al espacio de calma desde el botón de pánico de los tres tabs.
- Realizar el anclaje 5-4-3-2-1 con fotos, grabaciones de cinco segundos y descripciones; omitir pasos o salir con confirmación.
- Escuchar música instrumental en línea desde Jamendo, con créditos y licencia de cada pista.
- Crear, editar y eliminar tarjetas de realidad.
- Registrar emociones, subemociones e intensidad en un diario sincronizado con Firestore.
- Consultar el historial por semanas y un resumen de registros, días, intensidad promedio y emociones más frecuentes.
- Editar nombre y apellido, y elegir o tomar una foto de perfil desde Mi espacio.
- Configurar un celular colombiano y un mensaje de apoyo para abrir WhatsApp; el envío lo realiza el usuario.
- Cambiar entre modo claro y oscuro, también en login y registro.

## Tecnologías

| Área | Implementación |
| --- | --- |
| Interfaz | Angular 22, Ionic 9, TypeScript y SCSS |
| Android | Capacitor 8; mínimo API 24, compilación y destino API 36 |
| Identidad | Firebase Authentication, correo y contraseña |
| Datos remotos | Cloud Firestore y observadores en tiempo real |
| Datos locales | `localStorage`, con claves por UID donde corresponde |
| Música | API REST de Jamendo, HTTP y JSON |
| Hardware | Capacitor Camera; micrófono mediante Web Audio y AudioWorklet |
| Verificación | Vitest, Angular TestBed y pruebas de AudioWorklet en Node |

Las versiones exactas y las dependencias resueltas están en [package.json](package.json) y [package-lock.json](package-lock.json).

## Ejecutar en desarrollo

Requisitos: Git, npm y una versión de Node compatible con Angular CLI 22; por ejemplo, **Node 22.22.3 o posterior de la serie 22**. Para Android, instala Android Studio, el SDK 36 y el JDK compatible con la versión de Gradle del proyecto.

```bash
git clone https://github.com/Angela-Rupay/passiflora.git
cd passiflora
git switch master
npm ci --legacy-peer-deps
npm start
```

Abre `http://localhost:4200`. Se usa `--legacy-peer-deps` porque AngularFire 21 declara una compatibilidad de pares anterior a Angular 22; la opción permite instalar el árbol fijado en el lockfile, pero no elimina esa diferencia de versiones.

La aplicación conecta con los servicios configurados en `src/main.ts`. Para usar un proyecto Firebase propio, configura Authentication con correo/contraseña, Firestore y sus reglas; revisa [datos y seguridad](docs/datos-y-seguridad.md). Jamendo utiliza un identificador público en `JamendoService`, sin Client Secret.

## Compilar y probar en Android

```bash
npm run build
npx cap sync android
npx cap open android
```

En Android Studio espera la sincronización de Gradle y ejecuta la app en un teléfono con depuración USB o en un emulador. Tras cambios web repite `build` y `sync`; los cambios nativos requieren recompilar e instalar el APK.

Para un APK de depuración utiliza **Build → Generate App Bundles or APKs → Generate APKs** o la opción equivalente de tu versión de Android Studio. Desde `android/`, también puedes ejecutar `gradlew.bat assembleDebug` en Windows o `./gradlew assembleDebug` en Linux/macOS. El resultado habitual es `android/app/build/outputs/apk/debug/app-debug.apk`. Una publicación en Play Store requiere un proceso de firma de lanzamiento independiente.

## Documentación

- [Índice y guía de lectura](docs/README.md).
- [Arquitectura y estructura del código](docs/arquitectura.md).
- [Flujo de pantallas y casos de uso](docs/flujo-aplicacion.md).
- [Datos, servicios externos y seguridad](docs/datos-y-seguridad.md).
- [Validación técnica y relación con la rúbrica](docs/entrega.md).

## Verificación

```bash
npm run build
node scripts/test-audio-worklet.cjs
```

Las pruebas unitarias pueden ejecutarse por área; en [la guía de entrega](docs/entrega.md) hay un comando dirigido a las funcionalidades actuales. `npm test` también invoca las pruebas E2E y necesita el entorno de Playwright. Los comandos disponibles no implican que toda la suite heredada esté validada.

## Alcance de esta versión

El APK se ha probado en un teléfono Android durante el desarrollo. El repositorio no incluye el APK como parte del código fuente. La música necesita internet; el diario bloquea nuevas entradas cuando detecta que no hay conexión. Las tarjetas, el avatar y el contacto de apoyo permanecen en el almacenamiento local, separados por cuenta, y no se sincronizan entre dispositivos. Los detalles están en la documentación técnica.
