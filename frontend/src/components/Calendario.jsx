
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";


export default function Calendario({ pedidos, onSelectPedido }) {

    function normalizarFecha(dateString) {
        const [y, m, d] = dateString.split("-");
        return new Date(y, m - 1, d);
    }

    // Crear fechas reales, sin cambio de huso horario
    const diasConPedidos = pedidos.map(p => normalizarFecha(p.fecha_entrega));

    function handleDayClick(day) {
        const fecha = day.toISOString().slice(0, 10); // Obtener la fecha en formato YYYY-MM-DD
        
        const pedidosDelDia = pedidos.filter( p => p.fecha_entrega === fecha );
        
        if (pedidosDelDia.length > 0) {
            const ids = pedidosDelDia.map(p => Number(p.id_pedido));
            onSelectPedido(ids);
        }
    }

    return (
        <div className="w-full h-96 md:w-72 mx-full shadow-lg p-4 bg-white rounded-2xl">
            {/* CALENDARIO */}
            <DayPicker
                onDayClick={handleDayClick}
                classNames={{
                    root: "w-full",
                    month: "w-full",
                    table: "w-full",
                    caption: "text-xl font-bold text-green-600 mb-4",
                    day: "p-2 m-0.5 mx-auto text-sm sm:text-base hover:bg-green-200 rounded-xl",
                    day_today: "border border-green-500",
                    day_selected: "bg-green-600 text-white rounded-full",
                    weekdays: "hidden sm:grid grid-cols-7 text-center text-gray-500 font-semibold",
                    weekday: "text-xs sm:text-sm py-2",
                    week: "grid grid-cols-7 lg:mb-2 font-semibold",
                }}
                modifiers={{ conPedido: diasConPedidos }}
                modifiersClassNames={{
                    conPedido: "bg-green-400 text-white rounded-full"
                }}
            />
        </div>
    );
}
