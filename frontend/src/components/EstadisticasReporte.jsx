
import { 
    FileText, 
    Calendar, 
    BarChart3, 
    TrendingUp, 
    CheckCircle, 
    AlertCircle,
    Package,
    Activity
} from "lucide-react";

const EstadisticasReporte = ({ reportes }) => {
    const totalReportes = reportes.length;
    
    const reportesGenerados = reportes.filter(r => r.estado === 'GENERADO').length;
    const reportesError = reportes.filter(r => r.estado === 'ERROR').length;
    
    const totalTapas = reportes
        .filter(r => r.estado === 'GENERADO')
        .reduce((acc, r) => acc + Number(r.total_tapas || 0), 0);
    
    const totalProducciones = reportes
        .filter(r => r.estado === 'GENERADO')
        .reduce((acc, r) => acc + Number(r.total_producciones || 0), 0);

    // Promedios
    const promedioTapasPorMes = reportesGenerados > 0 
        ? Math.round(totalTapas / reportesGenerados) 
        : 0;
    
    const promedioProduccionesPorMes = reportesGenerados > 0 
        ? Math.round(totalProducciones / reportesGenerados) 
        : 0;

    // Último mes
    const ultimoReporte = reportes.length > 0 
        ? reportes.sort((a, b) => new Date(b.fecha_generacion) - new Date(a.fecha_generacion))[0]
        : null;

    // Tasa de éxito
    const tasaExito = totalReportes > 0 
        ? Math.round((reportesGenerados / totalReportes) * 100) 
        : 0;

    const estadisticas = [
        {
            titulo: "Reportes Generados",
            valor: reportesGenerados,
            subtitulo: `de ${totalReportes} totales`,
            icono: CheckCircle,
            color: "emerald",
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600",
            borderColor: "border-emerald-200"
        },
        {
            titulo: "Total de Tapas",
            valor: totalTapas.toLocaleString(),
            subtitulo: `${promedioTapasPorMes.toLocaleString()} promedio/mes`,
            icono: Package,
            color: "blue",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "border-blue-200"
        },
        {
            titulo: "Total Producciones",
            valor: totalProducciones,
            subtitulo: `${promedioProduccionesPorMes} promedio/mes`,
            icono: Activity,
            color: "purple",
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            borderColor: "border-purple-200"
        },
        {
            titulo: "Tasa de Éxito",
            valor: `${tasaExito}%`,
            subtitulo: reportesError > 0 ? `${reportesError} con errores` : 'Sin errores',
            icono: TrendingUp,
            color: tasaExito === 100 ? "green" : "amber",
            bgColor: tasaExito === 100 ? "bg-green-50" : "bg-amber-50",
            iconColor: tasaExito === 100 ? "text-green-600" : "text-amber-600",
            borderColor: tasaExito === 100 ? "border-green-200" : "border-amber-200"
        }
    ];

    return (
        <div className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {estadisticas.map((stat, index) => {
            const Icon = stat.icono;
            return (
                <div 
                key={index}
                className={`bg-white rounded-xl shadow-md border-2 ${stat.borderColor} p-6 hover:shadow-lg transition-shadow`}
                >
                <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                </div>
                
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.titulo}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.valor}
                    </p>
                    <p className="text-xs text-gray-500">
                    {stat.subtitulo}
                    </p>
                </div>
                </div>
            );
            })}
        </div>

        {/* Último reporte generado */}
        {ultimoReporte && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-md border-2 border-indigo-200 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">
                        Último Reporte Generado
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                        {new Date(ultimoReporte.fecha_generacion).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long' 
                        })}
                    </p>
                </div>
                </div>
                
                <div className="text-right">
                <div className="flex items-center gap-6">
                    <div>
                    <p className="text-sm text-gray-600">Tapas</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {ultimoReporte.total_tapas.toLocaleString()}
                    </p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-600">Producciones</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {ultimoReporte.total_producciones}
                    </p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default EstadisticasReporte;