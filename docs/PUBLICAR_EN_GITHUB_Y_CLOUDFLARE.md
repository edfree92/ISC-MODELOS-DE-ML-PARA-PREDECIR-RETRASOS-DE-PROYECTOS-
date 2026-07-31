# Publicación paso a paso

Esta guía supone que nunca has publicado una aplicación.

## Parte A. Crear el repositorio

1. Ingresa a GitHub.
2. Presiona **New repository**.
3. Escribe `isc-pulso-studio`.
4. Elige **Public**.
5. No marques la creación automática de README, licencia ni `.gitignore`:
   este paquete ya los contiene.
6. Presiona **Create repository**.

## Parte B. Subir el código desde la página de GitHub

1. Descomprime `ISC_PULSO_STUDIO_GITHUB.zip`.
2. En el repositorio vacío selecciona **uploading an existing file**.
3. Abre la carpeta descomprimida.
4. Arrastra todos sus archivos y carpetas visibles a GitHub.
5. Comprueba que `package.json` quede en la raíz. No debe aparecer una carpeta
   adicional llamada `ISC_PULSO_STUDIO_GITHUB` envolviendo todo.
6. Escribe `Primera versión pública` y confirma el cambio.

La carpeta `.github` puede estar oculta en Windows. Si el navegador no la
arrastra, la aplicación igual funciona; solo faltará la prueba automática de
GitHub Actions. Para conservarla con seguridad, es preferible usar GitHub
Desktop.

## Parte C. Conectar Cloudflare Pages

1. Crea o abre tu cuenta en Cloudflare.
2. Ve a **Workers & Pages**.
3. Selecciona **Create application**.
4. Elige **Pages** y después **Connect to Git**.
5. Conecta GitHub.
6. Autoriza únicamente el repositorio `isc-pulso-studio`.
7. Selecciona el repositorio y presiona **Begin setup**.

Usa exactamente:

```text
Production branch: main
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

No agregues variables de entorno. Presiona **Save and Deploy**.

Cloudflare entregará una dirección similar a:

```text
https://isc-pulso-studio.pages.dev
```

## Parte D. Actualizar la página

Cada vez que modifiques archivos en la rama `main`, Cloudflare construirá y
publicará una nueva versión. Si la construcción falla:

1. Abre el despliegue fallido en Cloudflare.
2. Revisa el primer mensaje rojo real, no la última línea genérica.
3. Confirma que el comando sea `npm run build`.
4. Confirma que el directorio sea `dist`.
5. Confirma que Cloudflare use Node.js 20 o superior.

## Comprobación final

En una ventana de incógnito:

- abre el enlace;
- genera una base sintética;
- descarga el CSV;
- ejecuta cada modelo;
- ejecuta **Todos los modelos**;
- descarga el PDF;
- verifica que el PDF tenga portada y 14 capítulos;
- repite con la misma semilla y confirma que la base se conserva.
