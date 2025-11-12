import { Calendar } from "lucide-react";

export default function FiltroFecha({ mes, anio, setMes, setAnio }) {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const currentYear = new Date().getFullYear();
    const años = Array.from({ length: 3 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 rounded-xl">
        <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 transition-all"
            >
            {meses.map((nombreMes, index) => (
                <option key={index + 1} value={index + 1}>
                {nombreMes}
                </option>
            ))}
            </select>
        </div>

        <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 transition-all"
            >
            {años.map((year) => (
                <option key={year} value={year}>
                {year}
                </option>
            ))}
            </select>
        </div>
        </div>
    );
}
