import { useState, useEffect, useCallback, useMemo } from "react";
import { getDataChart, getPieChart, getStats, getAlertas, marcarAlertasLeidas } from "../api/dashboardApi";

export function useDashboardData () {
    const [balance, setBalance]= useState({
        total_ingresos: 0,
        total_gastos: 0,
        crecimiento: 0,
        balance: 0,
    });

    const [chart, setChart] = useState([]);
    const [pieChart, setPieChart] = useState([]);

    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());

    const [alertas, setAlertas] = useState([])
    const [filtro, setFiltro] = useState("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchData = useCallback(async () => {
        try {
            const [balanceData, chartData, pieChartData, alertasData] = await Promise.all([
                getStats(),
                getDataChart(),
                getPieChart(mes, anio),
                getAlertas(),
            ])

            setBalance(prevBalance => ({
                ...prevBalance,
                ...(balanceData || {})
            }))

            setChart(chartData || [])
            setPieChart(pieChartData || [])
            setAlertas(alertasData.alertas || [])

        } catch (error) {
            console.log(error);
            setError("Error al cargar los datos del dashboard")
        } finally {
            setLoading(false)
        }
    }, [mes, anio]);

    // Caragr los datos al montar el componente
    useEffect(() => {
        fetchData()
    }, [fetchData])


    // MARCAR ALERTA COMO LEÍDA
    const toggleCheck = async (id_alerta) => {
        // marcar visualmente
        setAlertas(prev =>
            prev.map(a =>
                a.id_alerta === id_alerta ? { ...a, checked: true } : a
            )
        );

        try {
            await marcarAlertasLeidas(id_alerta);

            // eliminar 1 segundo después
            setTimeout(() => {
                setAlertas(prev =>
                    prev.filter(a => a.id_alerta !== id_alerta)
                );
            }, 1000);

        } catch (err) {
            console.error("Error al marcar alerta:", err);

            // revertir check
            setAlertas(prev =>
                prev.map(a =>
                    a.id_alerta === id_alerta ? { ...a, checked: false } : a
                )
            );
        }
    };


    const alertasFiltradas = useMemo(() => {
        if (filtro === "all") return alertas;
        return alertas.filter(a => a.nivel === filtro);
    }, [alertas, filtro]);


    // Lo que devuelve el hook
    return { 
        balance, 
        chart, 
        pieChart, 
        loading, 
        error, 
        fetchData, 
        mes, 
        anio, 
        setMes, 
        setAnio,
        alertas: alertasFiltradas,
        toggleCheck,  
        filtro,
        setFiltro
    };
}