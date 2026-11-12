import { useState, useEffect, useCallback, useRef } from "react";
import {
    getDataChart,
    getPieChart,
    getStats,
    getCuentasPorCobrar,
    getPedidos,
    getDetallePedido
} from "../api/dashboardApi";

export function useDashboardData() {
    const [balance, setBalance] = useState({
        total_ingresos: 0,
        total_gastos: 0,
        crecimiento: 0,
        balance: 0,
    });

    const [chart, setChart] = useState([]);
    const [pieChart, setPieChart] = useState([]);

    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());

    const [cuentasPorCobrar, setCuentasPorCobrar] = useState({ deuda_total: 0, ventas_pendientes: 0, clientes_con_saldo: 0, deuda_mas_antigua: null, clientes: [] });

    const [pedidos, setPedidos] = useState([]);
    const [detallePedido, setDetallePedido] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cache para detalles de pedidos
    const detalleCache = useRef({});

    
    const fetchCoreData = useCallback(async () => {
        try {
        setLoading(true);
        setError(null);

        const balanceData = await getStats();

        setBalance(balanceData || {});

        } catch (err) {
        console.error(err);
        setError("Error al cargar los datos principales del dashboard");
        } finally {
        setLoading(false);
        }
    }, []);

    const fetchSecondaryData = useCallback(async () => {
        try {
        const [chartData, pieChartData, pedidosData, cuentasData] = await Promise.all([
            getDataChart(),
            getPieChart(mes, anio),
            getPedidos(),
            getCuentasPorCobrar()
        ]);

        setChart(Array.isArray(chartData) ? chartData : []);
        setPieChart(Array.isArray(pieChartData) ? pieChartData : []);
        setPedidos(pedidosData || []);
        setCuentasPorCobrar(cuentasData || { deuda_total: 0, ventas_pendientes: 0, clientes_con_saldo: 0, deuda_mas_antigua: null, clientes: [] });

        } catch (err) {
        console.error("Error al cargar datos secundarios", err);
        }
    }, [mes, anio]);

    
    // Carga inicial
    useEffect(() => {
        fetchCoreData();
        fetchSecondaryData();
    }, [fetchCoreData, fetchSecondaryData]);


    // Seleccionar pedido (con cache)
    const seleccionarPedido = useCallback(async (ids) => {
        try {
        if (!Array.isArray(ids) || ids.length === 0) return;

        const pedidosCompletos = await Promise.all(
            ids.map(async (id) => {
            if (detalleCache.current[id]) {
                return detalleCache.current[id];
            }

            const data = await getDetallePedido(id);
            detalleCache.current[id] = data;
            return data;
            })
        );

        setDetallePedido(pedidosCompletos);
        } catch (error) {
        console.error("Error al obtener detalle del pedido", error);
        }
    }, []);


    return {
        // Datos
        balance,
        chart,
        pieChart,

        // Filtros de fecha
        mes,
        anio,
        setMes,
        setAnio,

        // Cuentas por cobrar
        cuentasPorCobrar,

        // Pedidos
        pedidos,
        detallePedido,
        seleccionarPedido,
        setDetallePedido,

        // Estado
        loading,
        error,

        // Refetch manual
        refetch: () => {
        fetchCoreData();
        fetchSecondaryData();
        }
    };
}
