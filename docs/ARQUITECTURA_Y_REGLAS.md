# Arquitectura y reglas de ISC PULSO Studio

## 1. Propósito

ISC PULSO Studio es un laboratorio didáctico. Construye un mundo simulado de
proyectos industriales para observar cómo tres modelos de Machine Learning
aprenden a distinguir proyectos cumplidos y retrasados.

La herramienta separa dos conceptos:

- **Riesgo:** probabilidad estimada de retraso.
- **Confianza del dato:** cuánto respaldo disponible tiene esa estimación.

## 2. Entradas

Los campos obligatorios definen el tamaño, duración, holgura, condiciones
operativas y reglas del experimento. Los opcionales permiten representar
cambios de ingeniería, retrabajo, importaciones, calidad de reporte y mezcla de
complejidad.

Todos los porcentajes se ingresan como valores fáciles de leer. Por ejemplo,
`14` en la interfaz significa `14%`; internamente se transforma a `0.14`.

## 3. Generación sintética

Cada proyecto recibe:

- sector y tipo;
- complejidad;
- duración;
- holgura inicial;
- dotación planificada;
- exposición a material importado.

Después se generan cortes semanales con Compras, Ingeniería, Planificación,
personal, productividad, restricciones, retrabajo, recuperación y calidad del
dato.

La etiqueta `delayed` se calcula al cerrar la historia sintética. La fecha
contractual simulada reconoce la recuperación acumulada antes de determinar el
retraso final.

## 4. Experimento

Los proyectos se dividen, sin mezclar sus semanas, en:

- 70% entrenamiento;
- 15% validación;
- 15% prueba final.

La validación elige el modelo ganador. La prueba final se reserva para informar
el desempeño sin escoger el ganador con esos mismos resultados.

Los modelos disponibles son:

- Regresión logística.
- Árbol de decisión.
- Bosque aleatorio.

## 5. Resultados

La herramienta informa, entre otras medidas:

- exactitud;
- precisión;
- sensibilidad o recall;
- especificidad;
- exactitud equilibrada;
- F1;
- AUC;
- Brier Score;
- calibración;
- matriz de confusión;
- robustez cuando faltan grupos de información.

El PDF convierte esas medidas en una explicación académica y en recomendaciones
operativas. Una alerta prioriza revisión; no reemplaza la decisión del equipo.

## 6. Límites

- Los datos son sintéticos.
- Una buena métrica demuestra comportamiento dentro del simulador, no validez
  empresarial externa.
- Antes de uso real se necesita un inventario de fuentes, definición contractual
  de la etiqueta, validación temporal y revisión humana.
- Los tres algoritmos se implementan dentro del navegador para fines
  pedagógicos; no son un servicio productivo certificado.

## 7. Privacidad

La aplicación no envía la configuración ni los resultados a un servidor. Las
descargas se producen localmente en el navegador. La última configuración se
guarda en `localStorage` y puede eliminarse limpiando los datos del sitio.
