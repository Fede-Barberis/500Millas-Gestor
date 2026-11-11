import { Fragment, useMemo, useState } from "react";
import { Calendar, CheckCircle2, ChevronDown, ChevronRight, Edit2, Filter, HandCoins, Handshake, Package, Search, Trash2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "./ModalConfirmacion";

const money = (value) => Number(value || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
const formatDate = (value) => {
    if (!value) return "-";
    const [year, month, day] = String(value).slice(0, 10).split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("es-ES");
};
const formatQty = (value) => {
    const number = Number(value || 0);
    return number % 1 === 0 ? number.toFixed(0) : number.toFixed(2);
};

export default function VentaTable({ ventas, productos, eliminarVenta, editarVenta, toggleEstadoPago, seleccionActiva = false, ventasSeleccionadas = [], onToggleSeleccion, onSeleccionarCliente, onConfirmarRecibo, onCancelarSeleccion }) {
    const [expanded, setExpanded] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [idAEliminar, setIdAEliminar] = useState(null);
    const [vFiltro, setvFiltro] = useState("all");
    const [tipoFiltro, setTipoFiltro] = useState("all");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [isPagado, setIsPagado] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const interpretarEstadoPago = (valor) => {
        if (typeof valor === "string") return ["1", "true", "si", "sí", "yes", "y"].includes(valor.trim().toLowerCase());
        return Boolean(valor);
    };
    const rows = useMemo(() => ventas.map((venta) => {
        const detalles = venta.VentaDetalles || [];
        return { ...venta, detalles, total: detalles.reduce((sum, d) => sum + Number(d.precio || 0) * Number(d.cantidad || 0), 0) };
    }).filter((venta) => {
        const matchesProduct = vFiltro === "all" || venta.detalles.some((d) => d.Producto?.nombre === vFiltro);
        const matchesSearch = !searchTerm || (venta.persona || "").toLowerCase().includes(searchTerm.toLowerCase()) || String(venta.id_pedido || "").includes(searchTerm) || String(venta.id_venta).includes(searchTerm);
        const paid = interpretarEstadoPago(venta.isPagado);
        return matchesProduct && matchesSearch && (!fechaDesde || venta.fecha >= fechaDesde) && (!fechaHasta || venta.fecha <= fechaHasta) && (tipoFiltro === "all" || (venta.tipo || "venta") === tipoFiltro) && (isPagado === "all" || paid === (isPagado === "1"));
    }), [ventas, vFiltro, tipoFiltro, fechaDesde, fechaHasta, isPagado, searchTerm]);

    const toggleExpanded = (id) => setExpanded((current) => ({ ...current, [id]: !current[id] }));
    const handleTogglePago = async (venta) => {
        const paid = interpretarEstadoPago(venta.isPagado);
        const resp = await toggleEstadoPago?.(venta.id_venta, !paid);
        if (resp?.ok) toast.success(paid ? "Venta marcada como pendiente" : "Venta marcada como pagada", { description: "Valor actualizado correctamente" });
        else toast.error("No se pudo actualizar el estado", { description: resp?.error || "Intenta nuevamente" });
    };
    const clienteSeleccionado = ventas.find((venta) => ventasSeleccionadas.includes(venta.id_venta))?.persona;
    const pendientesCliente = ventas.filter((venta) => !interpretarEstadoPago(venta.isPagado) && Number(venta.saldo_pendiente ?? venta.total) > 0 && (!clienteSeleccionado || venta.persona?.toLowerCase() === clienteSeleccionado.toLowerCase()));

    return <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-400 px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Handshake className="w-6 h-6" />Registro de Ventas</h2><p className="text-green-100 text-sm mt-1">{rows.length} {rows.length === 1 ? "venta" : "ventas"} encontradas</p></div>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar cliente o ID..." className="pl-10 pr-4 py-2 rounded-lg w-full md:w-80" /></div>
            </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">Filtros</span></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <label className="text-sm font-medium text-gray-700">Producto<select className="mt-1 border border-gray-300 p-2.5 rounded-lg w-full" value={vFiltro} onChange={(e) => setvFiltro(e.target.value)}><option value="all">Todos</option>{productos.map((p) => <option key={p.id_producto} value={p.nombre}>{p.nombre}</option>)}</select></label>
                <label className="text-sm font-medium text-gray-700">Tipo<select className="mt-1 border border-gray-300 p-2.5 rounded-lg w-full" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}><option value="all">Todos</option><option value="venta">Venta</option><option value="donacion">Donación</option><option value="cajas_negras">Cajas Negras</option><option value="consumo_propio">Consumo Propio</option></select></label>
                <label className="text-sm font-medium text-gray-700">Desde<input type="date" className="mt-1 border border-gray-300 p-2 rounded-lg w-full" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} /></label>
                <label className="text-sm font-medium text-gray-700">Hasta<input type="date" className="mt-1 border border-gray-300 p-2 rounded-lg w-full" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} /></label>
                <label className="text-sm font-medium text-gray-700">Pago<select className="mt-1 border border-gray-300 p-2.5 rounded-lg w-full" value={isPagado} onChange={(e) => setIsPagado(e.target.value)}><option value="all">Todos</option><option value="1">Pagado</option><option value="0">Pendiente</option></select></label>
            </div>
        </div>
        {seleccionActiva && <div className="flex flex-col gap-3 border-b bg-emerald-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-emerald-900">Modo de generación de recibos</p><p className="text-sm text-emerald-800">Selecciona ventas pendientes de un mismo cliente. {ventasSeleccionadas.length} seleccionada(s).</p></div><div className="flex flex-wrap gap-2"><button disabled={!clienteSeleccionado} onClick={() => onSeleccionarCliente?.(pendientesCliente.map((v) => v.id_venta))} className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-800 disabled:opacity-50">Seleccionar pendientes de {clienteSeleccionado || "cliente"}</button><button disabled={!ventasSeleccionadas.length} onClick={onConfirmarRecibo} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Revisar pago y generar recibo</button><button onClick={onCancelarSeleccion} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white">Cancelar</button></div></div>}
        <div className="max-h-[500px] overflow-auto"><table className="w-full min-w-[1200px]">
            <thead className="sticky top-0 z-10 bg-gray-100"><tr>{["", ...(seleccionActiva ? ["Cobrar"] : []), "ID", "Fecha", "Cliente", "Productos", "Total", "Tipo", "Estado", "Pedido", "Recibos", "Remito", "Acciones"].map((h) => <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-200">{rows.length === 0 ? <tr><td colSpan={seleccionActiva ? 13 : 12} className="px-6 py-12 text-center text-gray-500"><HandCoins className="w-12 h-12 text-gray-300 mx-auto mb-3" />No hay ventas registradas</td></tr> : rows.map((venta, index) => {
                const paid = interpretarEstadoPago(venta.isPagado);
                const id = venta.id_venta;
                const tipo = venta.tipo || "venta";
                const labels = { venta: "Venta", donacion: "Donación", cajas_negras: "Cajas Negras", consumo_propio: "Consumo Propio" };
                const balance = Number(venta.saldo_pendiente ?? (paid ? 0 : venta.total));
                const clienteIncompatible = clienteSeleccionado && venta.persona?.toLowerCase() !== clienteSeleccionado.toLowerCase();
                const canSelect = !paid && balance > 0 && !clienteIncompatible;
                return <Fragment key={id}>
                    <tr className={`transition-colors hover:bg-green-50 ${index % 2 ? "bg-slate-50" : "bg-white"}`}>
                        <td className="px-3 py-4"><button onClick={() => toggleExpanded(id)} className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors" aria-label={expanded[id] ? "Ocultar productos" : "Mostrar productos"}>{expanded[id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button></td>
                        {seleccionActiva && <td className="px-5 py-4"><input type="checkbox" checked={ventasSeleccionadas.includes(id)} disabled={!canSelect} onChange={() => onToggleSeleccion?.(venta)} aria-label={`Seleccionar venta ${id}`} className="h-4 w-4 accent-emerald-600" /></td>}
                        <td className="px-5 py-4 font-medium text-slate-900">{id}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-slate-700"><Calendar className="w-4 h-4 text-slate-400" />{formatDate(venta.fecha)}</span></td>
                        <td className="px-5 py-4"><span className="inline-flex max-w-48 truncate rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">{venta.persona || "-"}</span></td><td className="px-5 py-4"><button onClick={() => toggleExpanded(id)} className="text-blue-700 hover:text-blue-900 hover:underline font-medium">{venta.detalles.length} {venta.detalles.length === 1 ? "producto" : "productos"}</button></td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{money(venta.total)}</td><td className="px-5 py-4"><span className="inline-flex rounded px-2 py-1 text-sm bg-green-100 text-green-800">{labels[tipo] || tipo}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded px-2 py-1 text-sm ${paid ? "bg-green-100 text-green-800" : Number(venta.total_pagado || 0) > 0 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{paid ? "Pagado" : Number(venta.total_pagado || 0) > 0 ? `Parcial · debe ${money(balance)}` : "Pendiente"}</span></td><td className="px-5 py-4 text-slate-700">{venta.id_pedido || "-"}</td>
                        <td className="px-5 py-4"><div className="flex max-w-56 flex-wrap gap-1">{(venta.recibos_asociados || []).length ? venta.recibos_asociados.map((recibo) => <span key={recibo.id_recibo} title={`${money(recibo.importe)} · ${formatDate(recibo.fecha_pago)}`} className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">{recibo.numero || `REC-${String(recibo.id_recibo).padStart(6, "0")}`}</span>) : <span className="text-slate-400">—</span>}</div></td>
                        <td className="px-5 py-4">{venta.remito_asociado ? <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">{venta.remito_asociado.numero}</span> : <span className="text-slate-400">—</span>}</td>
                        <td className="px-5 py-4"><div className="flex gap-1"><button onClick={() => handleTogglePago(venta)} className={`p-2 rounded-lg ${paid ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`} title={paid ? "Marcar pendiente" : "Marcar pagado"}>{paid ? <Clock3 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}</button><button onClick={() => editarVenta(venta)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit2 className="w-4 h-4" /></button><button onClick={() => { setIdAEliminar(id); setModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                    {expanded[id] && <tr className="bg-slate-50"><td colSpan={seleccionActiva ? 13 : 12} className="px-10 py-3"><div className="overflow-x-auto"><table className="w-full min-w-[760px] table-fixed text-sm"><colgroup><col className="w-[40%]" /><col className="w-[18%]" /><col className="w-[21%]" /><col className="w-[21%]" /></colgroup><thead className="text-slate-600"><tr className="border-b border-slate-200"><th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Producto</th><th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide">Cantidad</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide">Precio unitario</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide">Subtotal</th></tr></thead><tbody>{venta.detalles.map((d, i) => <tr key={d.id_detalleVenta || d.id_detalle_venta || `${id}-${i}`} className="border-b border-slate-200 last:border-0 hover:bg-white"><td className="px-6 py-4"><span className="inline-flex items-center gap-2 font-semibold text-slate-900"><Package className="w-4 h-4 shrink-0 text-blue-500" />{d.Producto?.nombre || "Producto"}</span></td><td className="px-6 py-4 text-center"><span className="inline-flex min-w-12 justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{formatQty(d.cantidad)}</span></td><td className="px-6 py-4 text-right text-slate-700">{money(d.precio)}</td><td className="px-6 py-4 text-right font-semibold text-slate-900">{money(Number(d.precio || 0) * Number(d.cantidad || 0))}</td></tr>)}</tbody></table></div></td></tr>}
                </Fragment>;
            })}</tbody>
        </table></div>
        <ConfirmModal open={modalOpen} onClose={() => setModalOpen(false)} onConfirm={async () => { await eliminarVenta(idAEliminar); setModalOpen(false); setIdAEliminar(null); }} title="Confirmar eliminación" message="¿Seguro que deseas eliminar esta venta?" />
    </div>;
}
