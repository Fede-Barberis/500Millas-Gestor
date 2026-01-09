import React, { useMemo } from 'react';
import { Package, TrendingUp, Calendar, Activity, AlertCircle } from 'lucide-react';

export default function EstadisticasProduccion({ producciones, productos = [] }) {
    
    // Calcular todas las estadísticas
    const stats = useMemo(() => {
        // Normalizar los datos de producción (igual que en la tabla)
        const detalles = [];
        producciones.forEach(p => {
            p.DetalleProduccions?.forEach(d => {
                detalles.push({
                    id_produccion: p.id_produccion,
                    fecha: p.fecha,
                    producto: d.Producto?.nombre,
                    cantidad: d.cantidad,
                    tapas: d.tapas || 0,
                    lote: d.lote
                });
            });
        });

        // 1. TOTALES GENERALES
        const totalTapas = detalles.reduce((sum, d) => sum + (d.tapas || 0), 0);
        const totalProducciones = producciones.length;
        const totalDetalles = detalles.length;

        // 2. ESTADÍSTICAS DEL MES ACTUAL
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth();
        const añoActual = fechaActual.getFullYear();
        
        const produccionesMes = producciones.filter(p => {
            const fecha = new Date(p.fecha);
            return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
        });

        const detallesMes = [];
        produccionesMes.forEach(p => {
            p.DetalleProduccions?.forEach(d => {
                detallesMes.push({
                    tapas: d.tapas || 0,
                    producto: d.Producto?.nombre
                });
            });
        });

        const tapasMes = detallesMes.reduce((sum, d) => sum + d.tapas, 0);
        const cantidadProduccionesMes = produccionesMes.length;

        // 3. ESTADÍSTICAS POR PRODUCTO (TOTAL)
        const porProducto = {};
        detalles.forEach(d => {
            if (!d.producto) return;
            
            if (!porProducto[d.producto]) {
                porProducto[d.producto] = {
                    cantidad: 0,
                    tapas: 0,
                    producciones: 0
                };
            }
            porProducto[d.producto].cantidad += parseFloat(d.cantidad || 0);
            porProducto[d.producto].tapas += d.tapas;
            porProducto[d.producto].producciones += 1;
        });

        // 3.1 ESTADÍSTICAS POR PRODUCTO (SOLO MES ACTUAL)
        const porProductoMes = {};
        detallesMes.forEach(d => {
            if (!d.producto) return;
            
            if (!porProductoMes[d.producto]) {
                porProductoMes[d.producto] = {
                    tapas: 0
                };
            }
            porProductoMes[d.producto].tapas += d.tapas;
        });

        // Ordenar productos por cantidad de tapas
        const productosOrdenados = Object.entries(porProducto)
            .map(([producto, data]) => [
                producto, 
                {
                    ...data,
                    tapasMes: porProductoMes[producto]?.tapas || 0
                }
            ])
            .sort((a, b) => b[1].tapas - a[1].tapas)
            .slice(0, 3); // Top 3 productos

        // 4. COMPARACIÓN CON MES ANTERIOR
        const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
        const añoMesAnterior = mesActual === 0 ? añoActual - 1 : añoActual;

        const produccionesMesAnterior = producciones.filter(p => {
            const fecha = new Date(p.fecha);
            return fecha.getMonth() === mesAnterior && fecha.getFullYear() === añoMesAnterior;
        });

        const detallesMesAnterior = [];
        produccionesMesAnterior.forEach(p => {
            p.DetalleProduccions?.forEach(d => {
                detallesMesAnterior.push({ tapas: d.tapas || 0 });
            });
        });

        const tapasMesAnterior = detallesMesAnterior.reduce((sum, d) => sum + d.tapas, 0);
        const diferenciaVsMesAnterior = tapasMes - tapasMesAnterior;
        const porcentajeCambio = tapasMesAnterior > 0 
            ? ((diferenciaVsMesAnterior / tapasMesAnterior) * 100).toFixed(1)
            : 0;

        // 5. PROMEDIO DIARIO DEL MES
        const diasDelMes = new Date(añoActual, mesActual + 1, 0).getDate();
        const promedioDiario = (tapasMes / diasDelMes).toFixed(0);

        return {
            totalTapas,
            totalProducciones,
            totalDetalles,
            tapasMes,
            cantidadProduccionesMes,
            productosOrdenados,
            diferenciaVsMesAnterior,
            porcentajeCambio,
            promedioDiario
        };
    }, [producciones]);

    // Función para obtener nombre del mes
    const getNombreMes = () => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[new Date().getMonth()];
    };

    return (
        <div className="space-y-6">
            {/* TARJETAS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Tapas General */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Package className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats.totalTapas.toLocaleString()}
                    </div>
                    <div className="text-blue-100 text-sm">Total Tapas Producidas</div>
                    <div className="text-xs text-blue-200 mt-2">
                        {stats.totalProducciones} producciones totales
                    </div>
                </div>

                {/* Tapas del Mes */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Calendar className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats.tapasMes.toLocaleString()}
                    </div>
                    <div className="text-green-100 text-sm">Tapas en {getNombreMes()}</div>
                    <div className="text-xs text-green-200 mt-2">
                        {stats.cantidadProduccionesMes} producciones este mes
                    </div>
                </div>

                {/* Promedio Diario */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Activity className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats.promedioDiario}
                    </div>
                    <div className="text-purple-100 text-sm">Promedio Diario</div>
                    <div className="text-xs text-purple-200 mt-2">
                        Tapas por día en {getNombreMes()}
                    </div>
                </div>

                {/* Comparación vs Mes Anterior */}
                <div className={`bg-gradient-to-br rounded-xl shadow-lg p-6 text-white ${
                    stats.diferenciaVsMesAnterior >= 0 
                        ? 'from-emerald-600 to-emerald-700' 
                        : 'from-orange-600 to-orange-700'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats.diferenciaVsMesAnterior >= 0 ? '+' : ''}
                        {stats.porcentajeCambio}%
                    </div>
                    <div className="text-sm opacity-90">vs Mes Anterior</div>
                    <div className="text-xs opacity-75 mt-2">
                        {stats.diferenciaVsMesAnterior >= 0 ? '+' : ''}
                        {stats.diferenciaVsMesAnterior.toLocaleString()} tapas
                    </div>
                </div>
            </div>

            {/* TARJETAS POR PRODUCTO (TOP 3) */}
            {stats.productosOrdenados.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-800">
                            Producción por Producto
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.productosOrdenados.map(([producto, data], idx) => {
                            const colores = [
                                'from-indigo-500 to-indigo-600',
                                'from-violet-500 to-violet-600',
                                'from-fuchsia-500 to-fuchsia-600'
                            ];

                            return (
                                <div 
                                    key={producto}
                                    className={`bg-gradient-to-br ${colores[idx]} rounded-lg p-5 text-white`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="bg-white bg-opacity-20 rounded-full p-2">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                            #{idx + 1}
                                        </span>
                                    </div>
                                    
                                    <div className="font-semibold mb-3 text-lg opacity-90">
                                        {producto}
                                    </div>

                                    {/* Total General */}
                                    <div className="mb-3">
                                        <div className="text-xs opacity-75 mb-1">Total General</div>
                                        <div className="text-3xl font-bold">
                                            {data.tapas.toLocaleString()}
                                        </div>
                                        <div className="text-xs opacity-75 mt-1">
                                            tapas producidas
                                        </div>
                                    </div>

                                    {/* Total del Mes */}
                                    <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-3">
                                        <div className="text-xs opacity-90 mb-1">
                                            {getNombreMes()}
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {data.tapasMes.toLocaleString()}
                                        </div>
                                        <div className="text-xs opacity-75 mt-1">
                                            tapas este mes
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm opacity-75 border-t border-white border-opacity-20 pt-3">
                                        <span>Cantidad: {data.cantidad.toFixed(0)}</span>
                                        <span>{data.producciones} prod.</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}