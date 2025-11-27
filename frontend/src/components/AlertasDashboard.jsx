import FiltrosAlertas from "./FiltroNivelAlerta";
import { CircleAlert, AlertTriangle, CircleCheckIcon, Hourglass } from "lucide-react";

export default function AlertasDashboard({ alertas, toggleCheck, filtro, setFiltro }) {
    const iconMap = {
        warning: CircleAlert,
        danger: AlertTriangle,
        expired: Hourglass
    };
    
    const stylesMap = {
        danger: "border-red-300 bg-red-50 text-red-600",
        warning: "border-amber-300 bg-amber-50 text-amber-600",
        expired: "border-purple-300 bg-purple-50 text-purple-600",
    };



    return (
        <div className="min-h-[300px] max-h-[600px] h-auto bg-white rounded-2xl shadow-lg p-6 space-y-4 animate-fadeIn overflow-auto">

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row border-b pb-2 justify-between items-center gap-4">

                {/* Título */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-center">
                    <AlertTriangle className="text-amber-500" />
                    <h2 className="text-xl sm:text-2xl font-heading font-semibold text-gray-800">
                        Alertas del sistema
                    </h2>
                </div>

                {/* Filtros */}
                <div 
                    className="
                        w-full
                        flex flex-col gap-2
                        sm:flex-row sm:justify-center
                        lg:w-auto lg:justify-end
                    "
                >
                    <FiltrosAlertas filtro={filtro} setFiltro={setFiltro} />
                </div>
            </div>

            {/* CONTENIDO */}
            {alertas.length === 0 ? (
                <div className="flex justify-center gap-5 mt-8 bg-white rounded-2xl p-6 text-center text-gray-500">
                    <CircleCheckIcon className="text-green-500" /> 
                    <span className="text-xl font-body">No hay alertas activas.</span>
                </div>
            ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                    {alertas.map((alerta, index) => {
                        const Icon = iconMap[alerta.nivel];
                        return (
                            <li
                                key={alerta.id_alerta}
                                className={`p-3 rounded-lg border flex items-center gap-2 transition-all duration-300 ${stylesMap[alerta.nivel] || ""}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={alerta.checked}
                                    onChange={() => toggleCheck(alerta.id_alerta)}
                                    disabled={alerta.checked}
                                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                                />

                                {Icon && (
                                    <Icon
                                        className={`w-5 h-5 ml-3 mr-1.5 hidden sm:block flex-shrink-0 ${iconMap[alerta.nivel] || ""}`}
                                    />
                                )}

                                <span
                                    className={`transition-all duration-200 ${
                                        alerta.checked ? "line-through opacity-60" : ""
                                    }`}
                                >
                                    {alerta.mensaje}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
