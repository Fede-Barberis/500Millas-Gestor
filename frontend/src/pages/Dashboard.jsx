import StatsCards from "../components/StatsCards";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import { useDashboardData } from "../hooks/useDashboardData";
import TopVentasChart from "../components/TopVentasChart";
import AlertasDashboard from "../components/AlertasDashboard";
import Calendario from "../components/Calendario";
import ModalDetallePedido from "../components/ModalDetallePedido";

export default function Dashboard() {
    const {
        balance,
        chart,
        pieChart,
        loading,
        error,
        mes,
        anio,
        setMes,
        setAnio,
        alertas,
        filtro,
        setFiltro,
        pedidos,
        detallePedido,
        seleccionarPedido,
        setDetallePedido,
    } = useDashboardData();

    if (loading) return <p className="text-gray-500">Cargando...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="px-6 py-2 space-y-8">
            {/* --- Estadísticas --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCards balance={balance} />    
            </section>

            {/* --- Gráficos --- */}
            <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                <IncomeExpenseChart data={chart} />
                <TopVentasChart
                data={pieChart}
                mes={mes}
                anio={anio}
                setMes={setMes}
                setAnio={setAnio}
                />
            </section>

            {/* --- Alertas + Calendario --- */}
            <section className="grid grid-cols-1 lg:grid-cols-[2fr_0.5fr] gap-6">
                <AlertasDashboard
                alertas={alertas}
                filtro={filtro}
                setFiltro={setFiltro}
                />
                <Calendario
                pedidos={pedidos}
                onSelectPedido={seleccionarPedido}
                />
            </section>

            {/* --- Modal detalle pedido --- */}
            <div className="space-y-0">
                <ModalDetallePedido
                    pedido={detallePedido}
                    onClose={() => setDetallePedido(null)}
                />
            </div>
        </div>
    );
}
