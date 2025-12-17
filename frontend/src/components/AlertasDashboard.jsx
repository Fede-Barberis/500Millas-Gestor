import { useMemo, memo } from "react";
import FiltrosAlertas from "./FiltroNivelAlerta";
import {
    CircleAlert,
    AlertTriangle,
    CircleCheckIcon,
    Hourglass
} from "lucide-react";

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


const AlertasDashboard = memo(function AlertasDashboard({ alertas, filtro, setFiltro }) {

    // Alertas filtradas (memo)
    const alertasVisibles = useMemo(() => {
        if (filtro === "all") return alertas;
        return alertas.filter(
        a => a.tipo === filtro || a.nivel === filtro
        );
    }, [alertas, filtro]);

    if (alertasVisibles.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row border-b pb-2 justify-between items-center gap-4">
                    <div className="flex gap-2 items-center">
                        <AlertTriangle className="text-amber-500" />
                        <h2 className="text-xl font-semibold">
                            Alertas del sistema ({alertasVisibles.length})
                        </h2>
                    </div>

                    <FiltrosAlertas filtro={filtro} setFiltro={setFiltro} />
                </div>

                <div className="flex justify-center gap-4 py-6 text-gray-500">
                    <CircleCheckIcon className="text-green-500" />
                    <span>No hay alertas para este filtro.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row border-b pb-2 justify-between items-center gap-4">
            <div className="flex gap-2 items-center">
            <AlertTriangle className="text-amber-500" />
            <h2 className="text-xl font-semibold">
                Alertas del sistema ({alertasVisibles.length})
            </h2>
            </div>

            <FiltrosAlertas filtro={filtro} setFiltro={setFiltro} />
        </div>

        {/* LISTA */}
        <ul className="space-y-2 max-h-[400px] sm:max-h-[260px] overflow-y-auto pr-2">
            {alertasVisibles.map(alerta => {
            const Icon = iconMap[alerta.nivel];
            return (
                <li
                key={alerta.id}
                className={`px-3 py-2.5 rounded-lg border flex items-center gap-3 ${stylesMap[alerta.nivel]}`}
                >
                {Icon && <Icon className="w-5 h-5 hidden sm:block" />}
                <span className={alerta.checked ? "line-through opacity-60" : ""}>
                    {alerta.mensaje}
                </span>
                </li>
            );
            })}
        </ul>
        </div>
    );
});

export default AlertasDashboard;
