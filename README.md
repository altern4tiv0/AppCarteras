# App Carteras

Aplicación web móvil para emprendedores que venden carteras de manera ambulatoria. Centraliza el control diario de inventario, gastos, ingresos por método de pago e inconsistencias entre stock y ventas, sin necesidad de múltiples hojas de cálculo.

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

## Configuración de Netlify
1. Instala dependencias y construye:
   ```bash
   npm install
   npm run build
   ```
2. Inicia sesión con la CLI de Netlify y crea un sitio:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init      # o netlify deploy --build
   ```
   El archivo `netlify.toml` ya define:
   ```toml
   [build]
     command = "npm run build"
     publish = ".svelte-kit/netlify/static"

   [functions]
     directory = ".svelte-kit/netlify/functions"
   ```
3. Despliega:
   ```bash
   netlify deploy --prod
   ```

## Publicación en GitHub
```bash
git init
git add .
git commit -m "feat: initial release of App Carteras"
git remote add origin git@github.com:<usuario>/<repo>.git
git push -u origin main
```

Luego enlaza Netlify con ese repositorio o continúa desplegando con `netlify deploy`. Documenta tu enlace público y úsalo como panel diario para cuadrar tus ventas de carteras.
