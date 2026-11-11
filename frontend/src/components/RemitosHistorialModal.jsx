import { useEffect, useMemo, useState } from "react";
import { X, Search, FileText, Printer } from "lucide-react";
import { getRemitos } from "../api/ventaApi.js";

const money = (value) => Number(value || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
const date = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR") : "-";

export default function RemitosHistorialModal({ onClose, onView }) {
    const [remitos, setRemitos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [fecha, setFecha] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getRemitos().then((data) => {
            if (Array.isArray(data)) setRemitos(data);
            else setError(data.error || "No se pudo cargar el historial de remitos");
        });
    }, []);

    const filtrados = useMemo(() => remitos.filter((item) =>
        `${item.numeroRemito} ${item.cliente || item.receptor?.nombre || ""} ${item.idVenta}`.toLowerCase().includes(busqueda.toLowerCase()) &&
        (!fecha || item.fechaEmision === fecha)
    ), [remitos, busqueda, fecha]);

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
        <section className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-sky-500 px-6 py-4 text-white">
                <div className="flex items-center gap-3"><FileText /><div><h2 className="text-xl font-bold">Historial de remitos</h2><p className="text-sm text-blue-50">Remitos emitidos y asociados a ventas</p></div></div>
                <button onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-white/15"><X /></button>
            </header>
            <div className="max-h-[calc(90vh-72px)] space-y-4 overflow-y-auto p-6">
                <div className="grid gap-3 sm:grid-cols-[1fr_200px]"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar cliente, venta o número de remito" className="w-full rounded-lg border py-2.5 pl-10 pr-3" /></label><input aria-label="Filtrar por fecha de emisión" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="rounded-lg border px-3 py-2.5" /></div>
                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <div className="space-y-3">{filtrados.map((item) => <article key={item.id_remito} className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"><div><p className="font-bold text-slate-800">{item.numeroRemito} · Venta #{item.idVenta}</p><p className="text-sm text-slate-500">{item.cliente || item.receptor?.nombre} · Emitido {date(item.fechaEmision)}</p><p className="text-sm font-semibold text-blue-700">{money(item.total)} · {item.tipoRemito}</p></div><button onClick={() => onView(item)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Printer className="h-4 w-4" />Ver / imprimir</button></article>)}{!error && filtrados.length === 0 && <p className="py-10 text-center text-slate-500">No hay remitos para mostrar.</p>}</div>
            </div>
        </section>
    </div>;
}
