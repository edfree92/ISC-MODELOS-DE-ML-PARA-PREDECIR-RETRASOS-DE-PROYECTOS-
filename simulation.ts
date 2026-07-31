# ISC PULSO Studio

Laboratorio web académico para:

1. Configurar supuestos operativos de proyectos industriales.
2. Generar una base completamente sintética y reproducible.
3. Probar Regresión logística, Árbol de decisión y Bosque aleatorio.
4. Comparar métricas de clasificación, calibración y robustez.
5. Descargar la base simulada y un reporte PDF académico-operativo.

> Todo el universo es sintético. Los resultados no representan el desempeño
> histórico real de ISC ni deben utilizarse como decisión contractual.

## Arquitectura

La aplicación funciona completamente en el navegador:

```text
Parámetros del usuario
        ↓
Generador sintético (ISC UNIVERSE)
        ↓
Base de proyectos y cortes semanales
        ↓
Modelos de ML (ISC ARENA)
        ↓
Métricas, alertas y reporte (ISC PULSO)
```

No requiere API, Python, base de datos, cuenta de ChatGPT ni servidor de
Machine Learning. `localStorage` conserva únicamente la última configuración
en la computadora del visitante.

## Ejecutar en una computadora

Requisitos:

- Node.js 20 o superior.
- npm 10 o superior.

Comandos:

```bash
npm install
npm run dev
```

La terminal mostrará la dirección local. Para comprobar el proyecto completo:

```bash
npm run check
```

## Publicar en GitHub

1. Crea un repositorio vacío llamado `isc-pulso-studio`.
2. Descomprime este paquete.
3. Sube **el contenido de la carpeta**, no el ZIP.
4. Confirma que GitHub muestre `package.json`, `src`, `lib` y `README.md` en la
   raíz.
5. Usa la rama `main`.

El flujo de GitHub Actions ejecutará automáticamente pruebas y construcción.

## Publicar en Cloudflare Pages

En Cloudflare:

1. Ve a **Workers & Pages**.
2. Selecciona **Create application → Pages → Connect to Git**.
3. Autoriza solo el repositorio `isc-pulso-studio`.
4. Usa esta configuración:

| Campo | Valor |
|---|---|
| Rama de producción | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js | `20` |

No se necesitan variables de entorno. Cada cambio confirmado en `main` genera
una nueva publicación.

## Publicar en otros servicios

La misma carpeta `dist` funciona en Vercel, Netlify y GitHub Pages. En todos los
casos, el comando de construcción es `npm run build` y el directorio público es
`dist`.

## Estructura

```text
isc-pulso-studio/
├── .github/workflows/ci.yml  Pruebas automáticas en GitHub
├── docs/                     Explicaciones del sistema
├── lib/
│   ├── simulation.ts         Generador de datos sintéticos
│   ├── ml.ts                 Modelos, división y métricas
│   ├── report.ts             Reporte PDF
│   ├── types.ts              Reglas y configuración
│   └── core.test.ts          Pruebas del motor
├── src/
│   ├── App.tsx               Flujo y pantallas
│   ├── main.tsx              Entrada de React
│   └── styles.css            Diseño Blueprint industrial
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── tsconfig*.json
└── vite.config.ts
```

## Reproducibilidad

La semilla controla la generación aleatoria. La misma semilla y los mismos
parámetros producen la misma base. El identificador y la fecha de ejecución del
reporte sí cambian en cada corrida.

## Licencia

Código distribuido bajo licencia MIT. El nombre empresarial y la interpretación
del caso académico deben utilizarse con el contexto y las advertencias incluidas
en la herramienta.
