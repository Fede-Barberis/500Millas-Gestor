import { useState, useEffect, useCallback, useMemo } from "react";
import {
    getDataChart,
    getPieChart,
    getStats,
    getAlertas,
    getPedidos,
    getDetallePedido
} from "../api/dashboardApi";

    export function useDashboardData() {
    // ===============================
    // Estados principales
    // ===============================
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

    // ===============================
    // Fetch principal
    // ===============================
    const fetchData = useCallback(async () => {
        try {
        setLoading(true);

        const [
            balanceData,
            chartData,
            pieChartData,
            alertasData,
            pedidosData
        ] = await Promise.all([
            getStats(),
            getDataChart(),
            getPieChart(mes, anio),
            getAlertas(),
            getPedidos()
        ]);

        setBalance(prev => ({ ...prev, ...(balanceData || {}) }));
        setChart(Array.isArray(chartData) ? chartData : []);
        setPieChart(Array.isArray(pieChartData) ? pieChartData : []);
        setAlertas(alertasData?.alertas || []);
        setPedidos(pedidosData || []);

        } catch (err) {
        console.error(err);
        setError("Error al cargar los datos del dashboard");
        } finally {
        setLoading(false);
        }
    }, [mes, anio]);

    // Caragr los datos al montar el componente
    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        const interval = setInterval(async () => {
        try {
            const alertasData = await getAlertas();
            setAlertas(alertasData?.alertas || []);
        } catch (e) {
            console.error("Error al refrescar alertas", e);
        }
        }, 30000); // 30s

        return () => clearInterval(interval);
    }, []);

    const alertasFiltradas = useMemo(() => {
        if (filtro === "all") return alertas;
        return alertas.filter(a => a.tipo === filtro || a.nivel === filtro);
    }, [alertas, filtro]);

    const seleccionarPedido = async (ids) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) return;

            const pedidosCompletos = await Promise.all(
            ids.map(id => getDetallePedido(id))
            );

            setDetallePedido(pedidosCompletos);
        } catch (error) {
            console.error("Error al obtener detalle del pedido", error);
        }
    };

    // Lo que devuelve el hook
    return {
        balance,
        chart,
        pieChart,

        mes,
        anio,
        setMes,
        setAnio,

        alertas: alertasFiltradas,
        totalAlertas: alertas.length,
        filtro,
        setFiltro,

        pedidos,
        detallePedido,
        seleccionarPedido,
        setDetallePedido,

        loading,
        error,
        fetchData
    };
}