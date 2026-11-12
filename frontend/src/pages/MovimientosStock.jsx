import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, Search } from "lucide-react";
import { getMovimientosStock } from "../api/stockMovimientoApi";

const fechaCorta = (value) => value ? new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "—";
const tituloTipo = (tipo = "") => tipo.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());

export default function MovimientosStock() {
    const [filtros, setFiltros] = useState({ buscar: "", clase: "", tipo: "", desde: "", hasta: "", pagina: 1 });
    const [datos, setDatos] = useState({ movimientos: [], total: 0, paginas: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;
        setLoading(true);
        setError("");
        getMovimientosStock({ ...filtros, limite: 50 })
            .then((respuesta) => { if (activo) setDatos(respuesta); })
            .catch((err) => { if (activo) setError(err.response?.data?.error || "No se pudo cargar el historial."); })
            .finally(() => { if (activo) setLoading(false); });
        return () => { activo = false; };
    }, [filtros]);

    const actualizarFiltro = (campo, valor) => setFiltros((actual) => ({ ...actual, [campo]: valor, pagina: 1 }));

    return (
        <main className="space-y-5 px-4 py-5 md:px-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Movimientos de stock</h1>
                    <p className="mt-1 text-slate-500">Trazabilidad de cambios en productos y materias primas.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"><ArrowLeftRight size={17} /> {datos.total} movimientos</div>
            </header>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-slate-700">Filtros</h2>
                        <p className="mt-0.5 text-xs text-slate-400">Encontrá movimientos por artículo, tipo o período.</p>
                    </div>
                    {(filtros.buscar || filtros.clase || filtros.tipo || filtros.desde || filtros.hasta) && (
                        <button type="button" onClick={() => setFiltros({ buscar: "", clase: "", tipo: "", desde: "", hasta: "", pagina: 1 })} className="text-xs font-semibold text-blue-600 transition hover:text-blue-800">Limpiar filtros</button>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-6 xl:grid-cols-12">
                    <label className="text-xs font-semibold text-slate-500 md:col-span-3 xl:col-span-5">
                        Buscar
                        <span className="relative mt-1.5 block">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={filtros.buscar} onChange={(e) => actualizarFiltro("buscar", e.target.value)} placeholder="Artículo, motivo o referencia" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                        </span>
                    </label>
                    <label className="text-xs font-semibold text-slate-500 md:col-span-3 xl:col-span-3">
                        Tipo de artículo
                        <select value={filtros.clase} onChange={(e) => actualizarFiltro("clase", e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                            <option value="">Todos los artículos</option><option value="producto">Productos</option><option value="materia_prima">Materias primas</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-500 md:col-span-3 xl:col-span-4">
                        Tipo de movimiento
                        <select value={filtros.tipo} onChange={(e) => actualizarFiltro("tipo", e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                            <option value="">Todos los movimientos</option><option value="produccion">Producción</option><option value="venta">Ventas</option><option value="compra_mp">Compras de MP</option><option value="consumo_receta">Consumo de receta</option><option value="consumo_extra">Consumo extra</option><option value="ajuste_manual">Ajustes manuales</option><option value="anulacion_venta">Anulaciones de venta</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-500 md:col-span-3 xl:col-span-3">
                        Fecha desde
                        <input type="date" value={filtros.desde} onChange={(e) => actualizarFiltro("desde", e.target.value)} className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    </label>
                    <label className="text-xs font-semibold text-slate-500 md:col-span-3 xl:col-span-3">
                        Fecha hasta
                        <input type="date" value={filtros.hasta} onChange={(e) => actualizarFiltro("hasta", e.target.value)} className="mt-1.5 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    </label>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? <div className="p-10 text-center text-slate-500">Cargando movimientos…</div> : error ? <div className="p-10 text-center text-red-600">{error}</div> : datos.movimientos.length === 0 ? <div className="p-10 text-center text-slate-500">No hay movimientos para los filtros seleccionados.</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Fecha", "Artículo", "Movimiento", "Stock anterior → nuevo", "Origen", "Usuario", "Motivo"].map((t) => <th key={t} className="px-4 py-3 font-semibold">{t}</th>)}</tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {datos.movimientos.map((m) => {
                                    const cantidad = Number(m.cantidad);
                                    const positivo = cantidad >= 0;
                                    return <tr key={m.id_movimiento} className="transition hover:bg-slate-50/80">
                                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{fechaCorta(m.fecha)}</td>
                                        <td className="px-4 py-4"><div className="font-semibold text-slate-800">{m.articulo_nombre}</div><div className="mt-1 text-xs text-slate-400">{m.clase_articulo === "materia_prima" ? "Materia prima" : "Producto"}</div></td>
                                        <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${positivo ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{positivo ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{tituloTipo(m.tipo)}</span><div className={`mt-1 font-bold ${positivo ? "text-emerald-700" : "text-rose-700"}`}>{positivo ? "+" : ""}{cantidad.toLocaleString("es-AR", { maximumFractionDigits: 2 })} {m.unidad}</div></td>
                                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{Number(m.stock_anterior).toLocaleString("es-AR")} <span className="text-slate-300">→</span> <strong className="text-slate-800">{Number(m.stock_nuevo).toLocaleString("es-AR")} {m.unidad}</strong></td>
                                        <td className="px-4 py-4 text-slate-600">{m.origen_tipo ? tituloTipo(m.origen_tipo) : "—"}{m.origen_id ? <div className="text-xs text-slate-400">N.º {m.origen_id}</div> : null}</td>
                                        <td className="px-4 py-4 text-slate-600">{m.Usuario?.name || "Sistema"}</td>
                                        <td className="max-w-xs px-4 py-4 text-slate-500">{m.observacion || "—"}</td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                    <span>Página {datos.pagina || 1} de {Math.max(1, datos.paginas || 0)}</span>
                    <div className="flex gap-2"><button disabled={filtros.pagina <= 1 || loading} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina - 1 }))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Anterior</button><button disabled={filtros.pagina >= datos.paginas || loading} onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina + 1 }))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Siguiente</button></div>
                </footer>
            </section>
        </main>
    );
}
