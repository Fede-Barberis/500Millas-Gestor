import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, CalendarClock, CheckCircle2, HandCoins, Users } from "lucide-react";

const currency = (value) => Number(value || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = (value) => {
    if (!value) return "—";
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("es-AR");
};

export default function CuentasPorCobrarDashboard({ data }) {
    const clientes = data?.clientes || [];
    const deudaAntigua = data?.deuda_mas_antigua;

    return <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <header className="flex flex-col gap-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><HandCoins className="h-5 w-5" /></span>
                <div><h2 className="text-xl font-semibold text-slate-800">Cuentas por cobrar</h2><p className="text-sm text-slate-500">Saldos pendientes de clientes</p></div>
            </div>
            <Link to="/ventas" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">Ver ventas pendientes<ArrowRight className="h-4 w-4" /></Link>
        </header>

        <div className="space-y-5 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-emerald-700 p-4 text-white sm:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Saldo pendiente total</p>
                    <p className="mt-2 text-2xl font-bold">{currency(data?.deuda_total)}</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="rounded-lg bg-blue-100 p-2 text-blue-700"><BadgeDollarSign className="h-5 w-5" /></span>
                    <div><p className="text-2xl font-bold text-slate-800">{data?.ventas_pendientes || 0}</p><p className="text-xs text-slate-500">Ventas con saldo</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="rounded-lg bg-violet-100 p-2 text-violet-700"><Users className="h-5 w-5" /></span>
                    <div><p className="text-2xl font-bold text-slate-800">{data?.clientes_con_saldo || 0}</p><p className="text-xs text-slate-500">Clientes con deuda</p></div>
                </div>
            </div>

            {deudaAntigua && <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-amber-900"><CalendarClock className="h-4 w-4 shrink-0" /><p className="text-sm"><span className="font-semibold">Saldo más antiguo:</span> venta #{deudaAntigua.id_venta} de {deudaAntigua.persona}, {date(deudaAntigua.fecha)}</p></div>
                <span className="pl-6 text-sm font-semibold text-amber-800">{deudaAntigua.dias} días · {currency(deudaAntigua.saldo)}</span>
            </div>}

            <div>
                <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-700">Clientes con mayor saldo</h3><span className="text-xs text-slate-400">Top {clientes.length}</span></div>
                {clientes.length ? <ul className="divide-y divide-slate-100">{clientes.map((cliente) => <li key={cliente.cliente} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-0">
                    <div className="min-w-0"><p className="truncate font-medium text-slate-800">{cliente.cliente}</p><p className="text-xs text-slate-500">{cliente.cantidad_ventas} {cliente.cantidad_ventas === 1 ? "venta pendiente" : "ventas pendientes"} · deuda más antigua: {cliente.dias_mas_antigua} días</p></div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-800">{currency(cliente.saldo)}</span>
                </li>)}</ul> : <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-5 text-sm text-emerald-800"><CheckCircle2 className="h-5 w-5" />No hay saldos pendientes de cobro.</div>}
            </div>
        </div>
    </section>;
}
