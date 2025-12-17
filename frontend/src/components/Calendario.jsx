import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Calendario({ pedidos, onSelectPedido }) {

    function normalizarFecha(dateString) {
        const [y, m, d] = dateString.split("-");
        return new Date(y, m - 1, d);
    }

    const diasConPedidos = pedidos.map(p =>
        normalizarFecha(p.fecha_entrega)
    );

    function handleDayClick(day) {
        const fecha = day.toISOString().slice(0, 10);
        const pedidosDelDia = pedidos.filter(p => p.fecha_entrega === fecha);

        if (pedidosDelDia.length > 0) {
        const ids = pedidosDelDia.map(p => Number(p.id_pedido));
        onSelectPedido(ids);
        }
    }

    return (
        <div className="
            w-full 
            max-w-sm 
            sm:max-w-md 
            mx-auto 
            shadow-lg 
            px-6 py-4 
            bg-white 
            rounded-2xl
        ">
        <DayPicker
            onDayClick={handleDayClick}
            classNames={{
            root: "w-full",
            month: "w-full",
            table: "w-full border-collapse",
            caption: "text-lg sm:text-xl font-bold text-green-600 mb-3 text-center",
            weekdays: "grid grid-cols-7 text-center text-gray-500 font-semibold",
            weekday: "text-xs sm:text-sm py-1 sm:py-2",
            week: "grid grid-cols-7",
            day: `
                flex items-center justify-center
                h-9 w-9 sm:h-14 sm:w-14
                text-xs sm:text-sm
                hover:bg-green-200
                rounded-full
                transition
            `,
            day_today: "border border-green-500",
            day_selected: "bg-green-600 text-white",
            }}
            modifiers={{ conPedido: diasConPedidos }}
            modifiersClassNames={{
            conPedido: "bg-green-400 text-white"
            }}
        />
        </div>
    );
}

