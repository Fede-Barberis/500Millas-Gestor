# Arquitectura General - 500Millas Gestor

## 1. Objetivo
Este sistema gestiona operacion diaria de un emprendimiento: produccion, ventas, pedidos, materia prima, dashboard y reportes mensuales.

Stack principal:
- `frontend`: React + Vite + React Router + Axios + React Hook Form + Yup.
- `backend`: Node.js + Express + Sequelize + MySQL.
- `auth`: JWT con token Bearer.
- `reportes`: PDF generado con PDFKit.

## 2. Estructura general
- Frontend consume API REST en `/api/*`.
- Backend valida token en rutas protegidas.
- Sequelize conecta con MySQL y maneja modelos/asociaciones.
- El cierre mensual puede ejecutarse:
1. Manual (`POST /api/reportes/cerrar-mes`)
2. Cron externo/interno (`/api/reportes/cerrar-mes-cron`)

## 3. Flujo de autenticacion
1. Usuario envia email/password en login.
2. Backend busca usuario por email.
3. Compara password con `bcrypt.compare`.
4. Si coincide, genera JWT (`userId`, `email`).
5. Frontend guarda `token` y `user` en `localStorage`.
6. Axios agrega `Authorization: Bearer <token>` en cada request.
7. `PrivateRoute` bloquea acceso si no hay token.

## 4. Flujo de produccion (impacta stock)
Archivo clave: `backend/src/controllers/produccionController.js`

Cuando se crea una produccion:
1. Se crea cabecera de produccion.
2. Se descuenta receta base de materia prima (`procesarReceta(..., "sub")`).
3. Por cada detalle:
- Se calcula `tapas`.
- Se incrementa stock de producto terminado.
- Se descuenta consumo extra de materia prima.
4. Todo corre dentro de transaccion.

Editar/eliminar produccion hace rollback logico de stocks y reaplica datos nuevos para evitar desbalance.

## 5. Flujo de pedidos y ventas
Archivos clave:
- `backend/src/controllers/pedidoController.js`
- `backend/src/controllers/ventaController.js`
- `backend/src/services/ventaServices.js`

Reglas:
- Pedido valida stock disponible.
- Si pedido pasa a `entregado`, se genera venta automaticamente (`crearVentaDesdePedido`).
- Venta descuenta stock de productos.
- Eliminar venta/pedido revierte stocks.

## 6. Flujo de materia prima
Archivo clave: `backend/src/controllers/materiaPrimaController.js`

Puntos importantes:
- `factor_conversion` transforma cantidad comprada a unidad base de stock.
- Crear compra: suma stock base.
- Editar compra: ajusta diferencia de stock.
- Eliminar compra: resta stock, con bloqueo si ya fue consumido.

## 7. Flujo de reportes mensuales
Archivos clave:
- `backend/src/helpers/cerrarMesProduccion.js`
- `backend/src/helpers/generarPdfReporte.js`
- `backend/src/controllers/reporteController.js`
- `backend/src/cron/cierreMensualCron.js`

Proceso:
1. Se calcula metrica del mes cerrado.
2. Se calcula acumulado mensual.
3. Se genera PDF `reporte_<mes>_<anio>.pdf`.
4. Se guarda registro en `reportes_mensuales`.
5. Descarga:
- Si archivo existe, se devuelve.
- Si falta, se intenta regenerar automaticamente y luego descargar.

Conversiones de unidades en reporte:
- Alfajores: `docena -> unidades` con factor `12`.
- Galletas: `bolsa -> unidades` con factor `48`.

## 8. Flujo de dashboard
Backend: `dashboardController` agrega estadisticas, series y alertas.
Frontend: `useDashboardData` separa carga principal y secundaria:
- Core: stats.
- Secundario: graficos + pedidos.
- Alertas: carga separada y refresco periodico.

## 9. Variables de entorno importantes
Backend:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `CRON_SECRET`
- `NODE_ENV`
- `DB_SYNC_ON_START` (si `true`, ejecuta `db.sync()` al boot)

Frontend:
- `VITE_API_URL`

## 10. Notas operativas
- Render free puede tener cold start.
- El filesystem de Render es efimero: los PDFs pueden perderse tras restart/deploy.
- Se agrego regeneracion automatica de PDF al descargar para mitigar ese problema.
