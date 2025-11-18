import StatsCards from "../components/StatsCards"
import IncomeExpenseChart from "../components/IncomeExpenseChart"
import { useDashboardData } from "../hooks/useDashboardData"
import TopVentasChart from "../components/TopVentasChart"
import AlertasDashboard from "../components/AlertasDashboard"

export default function Dashboard() {
    const {
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
        alertas,
        toggleCheck,
        filtro,
        setFiltro,
    } = useDashboardData();

    if (loading) return <p className="text-gray-500">Cargando...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="px-6 py-2 space-y-6">
            {/* --- Estadísticas superiores --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCards balance={balance} />    
            </section>

            {/* --- Grafico --- */}
            <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                <IncomeExpenseChart data={chart} />
                <TopVentasChart data={pieChart} mes={mes} anio={anio} setMes={setMes} setAnio={setAnio} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-6" >
                <AlertasDashboard alertas={alertas} toggleCheck={toggleCheck} filtro={filtro} setFiltro={setFiltro} />
            </section>
        </div> 
    )
}
