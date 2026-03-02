# Mapa Frontend (`frontend/src`)

## Entrada y bootstrap
- `main.jsx`: monta React con `BrowserRouter` y `AuthProvider`.
- `App.jsx`: delega en enrutador principal.
- `index.css`: estilos globales.

## Enrutado y layouts
- `routes/AppRoutes.jsx`: rutas publicas/privadas + toaster global.
- `layouts/AuthLayout.jsx`: layout de login/register.
- `layouts/AppLayout.jsx`: layout principal autenticado.
- `components/PrivateRoute.jsx`: guard de autenticacion.

## Contexto y config
- `context/AuthContext.jsx`: estado global de usuario/token.
- `config/axios.js`: cliente HTTP base + interceptor de token.

## Paginas
- `pages/Login.jsx`: formulario de login.
- `pages/Register.jsx`: formulario de registro.
- `pages/Dashboard.jsx`: panel principal.
- `pages/Produccion.jsx`: gestion de producciones.
- `pages/Productos.jsx`: gestion de productos.
- `pages/MateriaPrima.jsx`: gestion de MP y compras.
- `pages/Ventas.jsx`: gestion de ventas.
- `pages/Pedidos.jsx`: gestion de pedidos.
- `pages/Reporte.jsx`: dashboard/tablas de reportes.

## Hooks de datos (capa de orquestacion UI)
- `hooks/useDashboardData.js`: agrega stats, charts, alertas y calendario pedidos.
- `hooks/useProduccionData.js`: carga/crea/edita/elimina produccion.
- `hooks/useProductoData.js`: carga/crea/edita/elimina productos + movimientos.
- `hooks/useMateriaPrimaData.js`: carga/crea/edita/elimina compras MP.
- `hooks/usePedidoData.js`: carga/crea/edita/elimina pedidos.
- `hooks/useVentaData.js`: carga/crea/edita/elimina ventas + productos.
- `hooks/useReporteData.js`: carga y refresca reportes.
- `hooks/useIsMobile.js`: helper responsive.

## API clients (capa HTTP)
- `api/authApi.js`: register/login.
- `api/dashboardApi.js`: stats/charts/alertas/pedidos dashboard.
- `api/produccionApi.js`: endpoints de produccion.
- `api/productoApi.js`: endpoints de producto.
- `api/materiaPrimaApi.js`: endpoints de MP/compras.
- `api/pedidoApi.js`: endpoints de pedidos.
- `api/ventaApi.js`: endpoints de ventas.
- `api/reporteApi.js`: lista/descarga/cierre de reportes.

## Schemas de validacion (Yup)
- `schemas/authSchemas.js`
- `schemas/productionSchemas.js`
- `schemas/productoSchemas.js`
- `schemas/compraMpSchemas.js`
- `schemas/pedidoSchemas.js`
- `schemas/ventaSchemas.js`

## Componentes por dominio

### Dashboard
- `components/StatsCards.jsx`
- `components/IncomeExpenseChart.jsx`
- `components/TopVentasChart.jsx`
- `components/FiltroFecha.jsx`
- `components/AlertasDashboard.jsx`
- `components/FiltroNivelAlerta.jsx`
- `components/Calendario.jsx`
- `components/ModalDetallePedido.jsx`

### Produccion
- `components/ProduccionForm.jsx`
- `components/ProduccionTabla.jsx`
- `components/EstadisticasProduccion.jsx`

### Productos
- `components/ProductoForm.jsx`
- `components/ProductoCard.jsx`

### Materia prima
- `components/CompraMpForm.jsx`
- `components/MateriaPrimaCard.jsx`
- `components/MateriaPrimaTabla.jsx`

### Pedidos
- `components/PedidoForm.jsx`
- `components/PedidoTabla.jsx`

### Ventas
- `components/VentaForm.jsx`
- `components/VentaTabla.jsx`

### Reportes
- `components/EstadisticasReporte.jsx`
- `components/ReporteTabla.jsx`

### Compartidos/UI
- `components/Sidebar.jsx`
- `components/HamburgerButton.jsx`
- `components/Loading.jsx`
- `components/ModalConfirmacion.jsx`

## Flujo de datos recomendado para leer rapido
1. Ir de `page` -> `hook` -> `api/*` para entender UI y llamadas.
2. Cruzar endpoint con `backend/src/routes/*`.
3. Seguir controller y helpers para regla de negocio.

## Notas de mantenimiento
- Preferir cambios en hook + api antes que logica distribuida en muchos componentes.
- Mantener consistencia de `ok/error` en respuestas API.
- Si cambia un endpoint, revisar:
1. archivo `api/*` correspondiente
2. hook que lo consume
3. pagina/componente que renderiza el resultado
