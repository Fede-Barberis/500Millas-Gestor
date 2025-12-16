import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export default function StatsCards({ balance }) {
    return (
        <>
        {/* INGRESOS */}
        <div className="bg-gradient-to-br from-emerald-600 via-green-400 to-green-300 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <h2 className="text-white text-sm font-semibold tracking-wide">Ingresos</h2>
                <ArrowUpRight size={24} className="text-white opacity-90" />
            </div>

            <p className="text-3xl font-bold text-white mt-2">
                ${(balance.total_ingresos || 0).toLocaleString("es-AR")}
            </p>

            <span
            className={`text-sm mt-1 text-gray-100`}
            >
                {balance.crecimiento_ingresos >= 0 ? "+" : ""}
                {balance.crecimiento_ingresos || 0}% vs mes anterior
            </span>
        </div>

        {/* EGRESOS */}
        <div className="bg-gradient-to-br from-rose-600 via-red-400 to-red-300 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <h2 className="text-white text-sm font-semibold tracking-wide">Egresos</h2>
                <ArrowDownRight size={24} className="text-white opacity-90" />
            </div>

            <p className="text-3xl font-bold text-white mt-2">
                ${(balance.total_gastos || 0).toLocaleString("es-AR")}
            </p>

            <span
            className={`text-sm mt-1 text-gray-100`}
            >
                {balance.crecimiento_gastos >= 0 ? "+" : ""}
                {balance.crecimiento_gastos || 0}% vs mes anterior
            </span>
        </div>

        {/* CRECIMIENTO GENERAL */}
        <div
            className={`bg-gradient-to-r from-slate-900 to-gray-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-5`}
        >
            <div
            className={`w-28 h-28 rounded-full border-8 ${
                balance.crecimiento >= 0 ? "border-emerald-400" : "border-red-500"
            } flex items-center justify-center`}
            >
                <span
                    className={`text-white ${ Math.abs(balance.crecimiento) > 99 ? "text-xl" : "text-2xl"} font-semibold`}
                >
                    {(balance.crecimiento || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                    })}
                    %
                </span>
            </div>
            <p className="text-gray-300 text-sm mt-3">Rentabilidad</p>
        </div>

        {/* DINERO DISPONIBLE */}
        <div className="bg-white p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <h2 className="hidden lg:block text-gray-700 text-sm font-semibold tracking-wide">
                    Dinero Disponible
                </h2>
                <h2 className="lg:hidden text-gray-700 text-sm font-semibold tracking-wide">
                    Disponible
                </h2>
                <Wallet size={24} className="text-gray-700" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
                ${(balance.balance || 0).toLocaleString("es-AR")}
            </p>
            <span
            className={`text-sm mt-1 text-gray-500`}
            >
                {balance.crecimiento_balance >= 0 ? "+" : ""}
                {balance.crecimiento_balance || 0}% vs mes anterior
            </span>
        </div>
        </>
    );
}
