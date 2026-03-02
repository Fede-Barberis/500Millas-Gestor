# Mapa Backend (`backend/src`)

## Entrypoint y configuracion
- `server.js`: inicia Express, middlewares, rutas, conexion DB y cron.
- `app.js`: actualmente sin contenido funcional.
- `config/database.js`: instancia Sequelize + pool + SSL/timeout.

## Middleware
- `middlewares/authMiddlewares.js`: valida JWT y agrega `req.user`.

## Cron
- `cron/cierreMensualCron.js`: cierre automatico del mes anterior (dia 1 + catch-up al boot).

## Rutas API
- `routes/authRoutes.js`: register/login.
- `routes/dashboardRoutes.js`: stats, charts, alertas y pedidos del dashboard.
- `routes/produccionRoutes.js`: CRUD de produccion + data auxiliar.
- `routes/productoRoutes.js`: CRUD parcial producto + movimientos.
- `routes/materiaPrimaRoutes.js`: CRUD de compras MP + listado MP.
- `routes/ventaRoutes.js`: CRUD ventas.
- `routes/pedidoRoutes.js`: CRUD pedidos.
- `routes/reporteRoutes.js`: cierre mensual, cron endpoint, listado y descarga PDF.

## Controladores
- `controllers/authController.js`: alta usuario y login JWT.
- `controllers/dashboardController.js`: agregaciones para panel.
- `controllers/produccionController.js`: operaciones de produccion con transacciones.
- `controllers/productoController.js`: alta/baja/edicion producto y metricas de movimiento.
- `controllers/materiaPrimaController.js`: compras MP y ajuste de stock con conversion.
- `controllers/ventaController.js`: ventas y sincronizacion de stock.
- `controllers/pedidoController.js`: pedidos y conversion a venta al entregar.
- `controllers/reporteController.js`: cierre mensual y descarga/regeneracion de PDF.

## Servicios
- `services/ventaServices.js`: `crearVentaDesdePedido` (usado por pedido entregado).

## Helpers de dominio
- `helpers/actualizarStockProducto.js`: suma/resta stock de producto.
- `helpers/actualizarStockMateriaPrima.js`: suma/resta stock MP con validaciones.
- `helpers/procesarReceta.js`: descuenta/agrega ingredientes de receta base.
- `helpers/procesarConsumoExtra.js`: procesa consumos extra por producto.
- `helpers/cerrarMesProduccion.js`: calculo mensual, acumulados, cierre y regeneracion de reporte.
- `helpers/generarPdfReporte.js`: armado del PDF mensual.

## Modelos Sequelize
- `models/usuario.js`: usuarios para auth.
- `models/producto.js`: catalogo y stock de productos.
- `models/materiaPrima.js`: stock base de MP + conversion.
- `models/compraMP.js`: compras de materia prima.
- `models/produccion.js`: cabecera de produccion.
- `models/detalleProduccion.js`: detalle por producto producido.
- `models/venta.js`: cabecera de venta.
- `models/detalleVenta.js`: detalle de venta.
- `models/pedido.js`: cabecera de pedido.
- `models/detallePedido.js`: detalle de pedido.
- `models/receta.js`: receta base.
- `models/recetaMateriaPrima.js`: ingredientes por receta.
- `models/productoReceta.js`: relacion producto-receta.
- `models/consumoExtra.js`: consumos adicionales por producto.
- `models/reporteMensual.js`: metadatos del cierre mensual.
- `models/index.js`: centraliza modelos y define asociaciones.

## Relaciones importantes
- `Venta 1-N VentaDetalle`
- `Producto 1-N VentaDetalle`
- `Pedido 1-N DetallePedido`
- `Producto 1-N DetallePedido`
- `Produccion 1-N DetalleProduccion`
- `Producto 1-N DetalleProduccion`
- `MateriaPrima 1-N CompraMP`
- `Receta N-M MateriaPrima` (via `RecetaMateriaPrima`)
- `Receta 1-N Produccion`
- `Producto 1-1 ProductoReceta` (segun modelo actual)

## Regla de unidades (reporte mensual)
- Alfajores: docena -> unidades con factor `12`.
- Galletas: bolsa -> unidades con factor `48`.
