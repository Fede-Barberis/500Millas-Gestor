import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    getDataChart,
    getPieChart,
    getStats,
    getAlertas,
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

    const [alertas, setAlertas] = useState([]);
    const [filtro, setFiltro] = useState("all");

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

        const [balanceData, alertasData] = await Promise.all([
            getStats(),
            getAlertas()
        ]);

        setBalance(balanceData || {});
        setAlertas(alertasData?.alertas || []);

        } catch (err) {
        console.error(err);
        setError("Error al cargar los datos principales del dashboard");
        } finally {
        setLoading(false);
        }
    }, []);


    const fetchSecondaryData = useCallback(async () => {
        try {
        const [chartData, pieChartData, pedidosData] = await Promise.all([
            getDataChart(),
            getPieChart(mes, anio),
            getPedidos()
        ]);

        setChart(Array.isArray(chartData) ? chartData : []);
        setPieChart(Array.isArray(pieChartData) ? pieChartData : []);
        setPedidos(pedidosData || []);

        } catch (err) {
        console.error("Error al cargar datos secundarios", err);
        }
    }, [mes, anio]);

    
    // Carga inicial
    useEffect(() => {
        fetchCoreData();
        fetchSecondaryData();
    }, [fetchCoreData, fetchSecondaryData]);

    // Refresco de alertas (30s)
    useEffect(() => {
        const interval = setInterval(async () => {
        try {
            const alertasData = await getAlertas();
            const nuevasAlertas = alertasData?.alertas || [];

            setAlertas(prev =>
            JSON.stringify(prev) === JSON.stringify(nuevasAlertas)
                ? prev
                : nuevasAlertas
            );
        } catch (e) {
            console.error("Error al refrescar alertas", e);
        }
        }, 30000);

        return () => clearInterval(interval);
    }, []);


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

        // Alertas
        alertas,
        totalAlertas: alertas.length,
        filtro,
        setFiltro,

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
