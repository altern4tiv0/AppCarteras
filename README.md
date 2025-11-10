# App Carteras

Aplicación web móvil. Centraliza el control diario de inventario, gastos, ingresos por método de pago e inconsistencias entre stock y ventas, sin necesidad de múltiples hojas de cálculo.

## ¿Qué problema resuelve?
- **Asignación flexible del stock**: soporta jornadas con stock repartido por vendedor o un único punto de venta compartido.
- **Cuadre automático**: calcula carteras vendidas usando únicamente los ingresos reportados (efectivo + Yape), deriva los sobrantes y detecta descuadres de inventario cuando los ingresos superan lo esperado según el stock inicial.
- **Seguimiento de gastos**: cada vendedor registra gastos puntuales (almuerzos, movilidad, agua, etc.) y el sistema los descuenta para mostrar ingresos netos reales.
- **Exportación y auditoría**: genera reportes en JSON/CSV/PDF, muestra diferencias por vendedor y resalta los indicadores críticos (ingresos netos, diferencias monetarias, descuadre en unidades).

## Características principales
- Flujo lineal: registrar salida → asignar vendedores → capturar cierre → exportar reporte.
- Modo *un solo punto* o *stock distribuido* configurable por salida.
- Persistencia local en IndexedDB (Dexie) para operar sin conexión.
- Resumen imprimible y listo para PDF/Netlify.
- Tests de negocio con Vitest para los cálculos clave.

## Stack
- [SvelteKit](https://kit.svelte.dev/) + TypeScript
- Dexie (IndexedDB), html2pdf.js, dayjs, nanoid, zod
- Adapter oficial `@sveltejs/adapter-netlify`

## Scripts
```bash
npm run dev          # servidor de desarrollo
npm run build        # compilación para producción (Netlify)
npm run preview      # previsualizar build
npm run check        # svelte-check + typecheck
npm run test         # vitest (cálculos de negocio)
```
