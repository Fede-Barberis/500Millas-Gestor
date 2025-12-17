import StatsCards from "../components/StatsCards";
import { useDashboardData } from "../hooks/useDashboardData";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import TopVentasChart from "../components/TopVentasChart";
import AlertasDashboard from "../components/AlertasDashboard";
import Calendario from "../components/Calendario";
import ModalDetallePedido from "../components/ModalDetallePedido";
import { Loading } from "../components/Loading";

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

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <div>
            <div className="px-6 py-2 block sm:hidden">
                <div className="block sm:hidden ">
                    <h2 className="text-center font-heading text-4xl font-semibold text-gray-800">
                        Panel de Control
                    </h2>
                    <p className="text-center text-gray-500 mt-1">
                        Gestiona tu negocio de manera eficiente
                    </p>
                </div>
            </div>


            <div className="px-6 py-2 space-y-8">
                {/* --- Estadísticas --- */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
                <section className="grid grid-cols-1 lg:grid-cols-[2fr_0.75fr] gap-6  items-start">
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
        </div>
    );
}
