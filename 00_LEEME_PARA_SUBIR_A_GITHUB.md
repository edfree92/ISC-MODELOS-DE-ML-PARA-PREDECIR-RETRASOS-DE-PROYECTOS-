# ISC PULSO Studio — subida correcta a GitHub

Este paquete ya contiene la arquitectura completa. No muevas los archivos
internos ni los subas uno por uno.

## Estructura obligatoria

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
├── lib/
│   ├── core.test.ts
│   ├── ml.ts
│   ├── report.ts
│   ├── simulation.ts
│   └── types.ts
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .gitignore
├── .nvmrc
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

El archivo `index.html` debe contener:

```html
<script type="module" src="/src/main.tsx"></script>
```

## Cómo corregir el repositorio que quedó aplanado

La opción más segura es crear un repositorio nuevo y vacío. Si deseas conservar
el repositorio actual, elimina primero los archivos de código que quedaron
sueltos en la raíz y después repón la estructura completa.

1. Descomprime este ZIP en Windows.
2. Abre la carpeta `ISC_PULSO_STUDIO_GITHUB_CORREGIDO`.
3. Comprueba que ves las carpetas `src`, `lib`, `docs` y `.github`.
4. En GitHub usa **Add file → Upload files**.
5. Arrastra **todo el contenido interno** de la carpeta, no el ZIP y no la
   carpeta contenedora.
6. Comprueba antes del commit que GitHub muestre rutas como:
   `src/App.tsx`, `lib/ml.ts` y `.github/workflows/ci.yml`.
7. Confirma el commit y abre la pestaña **Actions**.

No reemplaces `npm ci` por `npm install` dentro de `ci.yml`. El archivo
`package-lock.json` incluido es el que garantiza que GitHub y Cloudflare
instalen exactamente las dependencias previstas.

## Señal de que todo quedó bien

En la raíz de GitHub no deben aparecer estos archivos:

- `App.tsx`
- `main.tsx`
- `styles.css`
- `ml.ts`
- `report.ts`
- `simulation.ts`
- `types.ts`
- `core.test.ts`
- `ci.yml`

Esos archivos deben aparecer dentro de sus carpetas. La ejecución **Calidad**
de GitHub Actions debe terminar con un check verde.

## Cloudflare Pages

Cuando GitHub Actions esté en verde:

| Campo | Valor |
|---|---|
| Rama de producción | `main` |
| Framework | Vite |
| Comando de construcción | `npm run build` |
| Directorio de salida | `dist` |
| Directorio raíz | `/` |
| Node.js | `20` |

