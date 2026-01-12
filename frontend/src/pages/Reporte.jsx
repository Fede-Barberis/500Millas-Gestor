import { FileText } from "lucide-react";
import ReporteTabla from "../components/ReporteTabla";
import EstadisticasReporte from "../components/EstadisticasReporte";
import { Loading, ErrorMessage } from "../components/Loading";
import { useReportes } from "../hooks/useReporteData";

const Reportes = () => {
    const { reportes, loading, error } = useReportes();

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <div className="space-y-6 p-6">
        
        <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold">Reportes Mensuales</h1>
        </div>

        <EstadisticasReporte reportes={reportes} />

        <ReporteTabla 
            data={reportes}
            loading={loading}
        />

        </div>
    );
};

export default Reportes;
