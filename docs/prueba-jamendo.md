# Sonidos de ambientación con Jamendo

## Actualizar

```bash
git pull --ff-only origin feature/entrega-passiflora
npm start
```

## Comprobar

1. En **Ejercicios**, abrir **Sonidos de ambientación**. Debe mostrar carga y después una lista con título, artista, duración y enlaces a Jamendo y la licencia.
2. Reproducir una pista, pausar y continuar: debe conservar el punto de reproducción.
3. Elegir otra pista: solo debe sonar una a la vez.
4. Salir a Ejercicios: el audio debe detenerse. Al volver se consulta el catálogo de nuevo.
5. Abrir los enlaces de créditos y licencia.
6. Desconectar internet y volver a cargar: debe mostrar un error con opción de reintentar. Reconectar y reintentar.
7. Si una pista falla al reproducirse, debe permitir reintentar o elegir otra. Si tarda en cargar, se puede cancelar.
8. Revisar la lista y el reproductor en ambos temas y en móvil.

## Integración

- GET HTTPS a `/v3.0/tracks/` con `client_id`, JSON, `fuzzytags=ambient+relaxation`, filtro instrumental y límite de 12 pistas.
- Se validan tanto la respuesta HTTP como el estado de Jamendo en el JSON. El catálogo tiene un tiempo límite de espera.
- Se utiliza el campo `audio` para reproducción en línea y se muestran artista, fuente y licencia.
- No se guarda música, catálogo ni favoritos en almacenamiento local. El navegador puede mantener su búfer normal de reproducción.
- No se utiliza ni se incluye Client Secret. El Client ID identifica públicamente la aplicación.
- No se modificaron diario, permisos ni Android.

Documentación del proveedor: https://developer.jamendo.com/v3.0/tracks

Comprobación real desde el entorno de desarrollo: la consulta final devolvió HTTP 200, 12 pistas y CORS abierto. Se leyó un fragmento de 1024 bytes de la primera pista con HTTP 206 y tipo `audio/mpeg`. Esto verifica el acceso al catálogo y al archivo, no sustituye escuchar la reproducción en el navegador o en Android.
