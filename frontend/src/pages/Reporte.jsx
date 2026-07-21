import { FileText, Play } from "lucide-react";
import ReporteTabla from "../components/ReporteTabla";
import EstadisticasReporte from "../components/EstadisticasReporte";
import { Loading, ErrorMessage } from "../components/Loading";
import { useReportes } from "../hooks/useReporteData";
import { cerrarMes } from "../api/reporteApi";
import { useState } from "react";
import { toast } from "sonner";

const Reportes = () => {
    const { reportes, loading, error, refetch } = useReportes();
    const [closingMonth, setClosingMonth] = useState(null);
    const [showManualClose, setShowManualClose] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const handleCerrarMesManual = async () => {
        setClosingMonth(true);
        try {
            const resultado = await cerrarMes(parseInt(selectedMonth) + 1, parseInt(selectedYear));
            
            if (resultado.ok) {
                toast.success(`Reporte de ${meses[selectedMonth]} ${selectedYear} generado correctamente`);
                setShowManualClose(false);
                setTimeout(() => refetch(), 1000);
            } else {
                toast.error(resultado.error || 'Error al generar el reporte');
            }
        } catch (err) {
            toast.error('Error al generar el reporte');
            console.error(err);
        } finally {
            setClosingMonth(false);
        }
    };

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <div className="space-y-6 p-6">
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold">Reportes Mensuales</h1>
            </div>

            <button
                onClick={() => setShowManualClose(!showManualClose)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="Generar reporte de un mes específico"
            >
                <Play className="w-4 h-4" />
                Generar Reporte
            </button>
        </div>

        {showManualClose && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
                <h3 className="text-lg font-semibold mb-4">Generar Reporte Manual</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {meses.map((mes, idx) => (
                                <option key={idx} value={idx}>
                                    {mes}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="2020"
                            max={new Date().getFullYear()}
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleCerrarMesManual}
                            disabled={closingMonth}
                            className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-all ${
                                closingMonth
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {closingMonth ? 'Generando...' : 'Generar'}
                        </button>
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    {meses[selectedMonth]} {selectedYear}
                </p>
            </div>
        )}

        <EstadisticasReporte reportes={reportes} />

        <ReporteTabla 
            data={reportes}
            loading={loading}
        />

        </div>
    );
};

export default Reportes;
