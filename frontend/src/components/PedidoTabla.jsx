import { Fragment, useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronRight, Edit2, Filter, Package, Search, Trash2 } from "lucide-react";
import ConfirmModal from "../components/ModalConfirmacion";

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

export default function PedidoTable({ pedidos, productos, eliminarPedido, editarPedido }) {
    const [expanded, setExpanded] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [idAEliminar, setIdAEliminar] = useState(null);
    const [pFiltro, setPFiltro] = useState("all");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [estado, setEstado] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const rows = useMemo(() => pedidos.map((pedido) => {
        const detalles = pedido.DetallePedidos || [];
        return { ...pedido, detalles, total: detalles.reduce((sum, d) => sum + Number(d.precio_unitario || 0) * Number(d.cantidad || 0), 0) };
    }).filter((pedido) => {
        const matchProduct = pFiltro === "all" || pedido.detalles.some((d) => d.Producto?.nombre === pFiltro);
        const matchSearch = !searchTerm || (pedido.persona || "").toLowerCase().includes(searchTerm.toLowerCase()) || String(pedido.id_pedido).includes(searchTerm) || pedido.detalles.some((d) => (d.Producto?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()));
        return matchProduct && matchSearch && (!fechaDesde || pedido.fecha_entrega >= fechaDesde) && (!fechaHasta || pedido.fecha_entrega <= fechaHasta) && (estado === "all" || pedido.estado === estado);
    }), [pedidos, pFiltro, fechaDesde, fechaHasta, estado, searchTerm]);
    const toggleExpanded = (id) => setExpanded((current) => ({ ...current, [id]: !current[id] }));
    const getDateTone = (value) => {
        if (!value) return "bg-gray-100 text-gray-700";
        const [year, month, day] = String(value).slice(0, 10).split("-");
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const days = Math.ceil((date - today) / 86400000);
        return days < 7 ? "bg-red-100 text-red-700" : days < 15 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
    };

    return <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-700 px-6 py-5"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Package className="w-6 h-6" />Historial de Pedidos</h2><p className="text-white text-sm mt-1">{rows.length} {rows.length === 1 ? "pedido encontrado" : "pedidos encontrados"}</p></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar producto, cliente o ID..." className="pl-10 pr-4 py-2 rounded-lg w-full md:w-80" /></div></div></div>
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200"><div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">Filtros</span></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="text-sm font-medium text-gray-700">Producto<select className="mt-1 border border-gray-300 p-2.5 rounded-lg w-full" value={pFiltro} onChange={(e) => setPFiltro(e.target.value)}><option value="all">Todos</option>{productos.map((p) => <option key={p.id_producto} value={p.nombre}>{p.nombre}</option>)}</select></label>
            <label className="text-sm font-medium text-gray-700">Desde<input type="date" className="mt-1 border border-gray-300 p-2 rounded-lg w-full" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} /></label>
            <label className="text-sm font-medium text-gray-700">Hasta<input type="date" className="mt-1 border border-gray-300 p-2 rounded-lg w-full" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} /></label>
            <label className="text-sm font-medium text-gray-700">Entrega<select className="mt-1 border border-gray-300 p-2.5 rounded-lg w-full" value={estado} onChange={(e) => setEstado(e.target.value)}><option value="all">Todos</option><option value="entregado">Entregado</option><option value="pendiente">Pendiente</option></select></label>
        </div></div>
        <div className="max-h-[500px] overflow-auto"><table className="w-full min-w-[850px]"><thead className="sticky top-0 z-10 bg-gray-100"><tr>{["", "ID", "Fecha entrega", "Cliente", "Productos", "Total", "Estado", "Acciones"].map((h) => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">
            {rows.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500"><Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />No hay pedidos registrados</td></tr> : rows.map((pedido, index) => {
                const id = pedido.id_pedido;
                return <Fragment key={id}>
                    <tr className={`transition-colors hover:bg-purple-50 ${index % 2 ? "bg-slate-50" : "bg-white"}`}>
                        <td className="px-4 py-4"><button onClick={() => toggleExpanded(id)} className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors" aria-label={expanded[id] ? "Ocultar productos" : "Mostrar productos"}>{expanded[id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button></td>
                        <td className="px-6 py-4 font-medium text-slate-900">{id}</td><td className="px-6 py-4"><span className="inline-flex items-center gap-2 text-slate-700"><Calendar className="w-4 h-4 text-slate-400" /><span className={`rounded px-2 py-1 text-xs font-semibold ${getDateTone(pedido.fecha_entrega)}`}>{formatDate(pedido.fecha_entrega)}</span></span></td>
                        <td className="px-6 py-4"><span className="inline-flex max-w-48 truncate rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">{pedido.persona || "-"}</span></td><td className="px-6 py-4"><button onClick={() => toggleExpanded(id)} className="text-indigo-700 hover:text-indigo-900 hover:underline font-medium">{pedido.detalles.length} {pedido.detalles.length === 1 ? "producto" : "productos"}</button></td><td className="px-6 py-4 font-semibold text-slate-900">{money(pedido.total)}</td>
                        <td className="px-6 py-4"><span className={`inline-flex rounded px-2 py-1 text-sm ${pedido.estado === "entregado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{pedido.estado}</span></td><td className="px-6 py-4"><div className="flex gap-1"><button type="button" onClick={() => editarPedido(pedido)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Editar"><Edit2 className="w-4 h-4" /></button><button type="button" onClick={() => { setIdAEliminar(id); setModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                    {expanded[id] && <tr className="bg-slate-50"><td colSpan={8} className="px-10 py-3"><div className="overflow-x-auto"><table className="w-full min-w-[700px] table-fixed text-sm"><colgroup><col className="w-[40%]" /><col className="w-[18%]" /><col className="w-[21%]" /><col className="w-[21%]" /></colgroup><thead className="text-slate-600"><tr className="border-b border-slate-200"><th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Producto</th><th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide">Cantidad</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide">Precio unitario</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide">Subtotal</th></tr></thead><tbody>{pedido.detalles.map((d, i) => <tr key={d.id_detallePedido || d.id_detalle_pedido || `${id}-${i}`} className="border-b border-slate-200 last:border-0 hover:bg-white"><td className="px-6 py-4"><span className="inline-flex items-center gap-2 font-semibold text-slate-900"><Package className="w-4 h-4 shrink-0 text-blue-500" />{d.Producto?.nombre || "Producto"}</span></td><td className="px-6 py-4 text-center"><span className="inline-flex min-w-12 justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{formatQty(d.cantidad)}</span></td><td className="px-6 py-4 text-right text-slate-700">{money(d.precio_unitario)}</td><td className="px-6 py-4 text-right font-semibold text-slate-900">{money(Number(d.precio_unitario || 0) * Number(d.cantidad || 0))}</td></tr>)}</tbody></table></div></td></tr>}
                </Fragment>;
            })}
        </tbody></table></div>
        <ConfirmModal open={modalOpen} onClose={() => setModalOpen(false)} onConfirm={async () => { await eliminarPedido(idAEliminar); setModalOpen(false); setIdAEliminar(null); }} title="Confirmar eliminación" message="¿Seguro que deseas eliminar este pedido?" />
    </div>;
}
