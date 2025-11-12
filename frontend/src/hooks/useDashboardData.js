import { useState, useEffect, useCallback } from "react";
import { getDataChart, getPieChart, getStats } from "../api/dashboardApi";

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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [balanceData, chartData, pieChartData] = await Promise.all([
                getStats(),
                getDataChart(),
                getPieChart(mes, anio),
            ])

            setBalance(prevBalance => ({
                ...prevBalance,
                ...(balanceData || {})
            }))

            setChart(chartData || [])
            setPieChart(pieChartData || [])

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

    // Lo que devuelve el hook
    return { balance, chart, pieChart, loading, error, fetchData, mes, anio, setMes, setAnio}
}