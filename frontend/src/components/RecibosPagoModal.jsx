import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { crearReciboPago, getRecibosPago } from "../api/ventaApi.js";
import { toast } from "sonner";
import { X, ReceiptText, Download, Search } from "lucide-react";

const hoy = () => {
    const local = new Date();
    return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
};
const money = (n) => Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
const date = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR") : "-";

function descargarRecibo(recibo) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 48;
    let y = 58;
    const width = doc.internal.pageSize.getWidth() - left * 2;
    const emisor = recibo.emisor?.razonSocial || import.meta.env.VITE_EMPRESA_RAZON_SOCIAL || "Alfajores 500 Millas";
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.text(emisor, left, y);
    y += 16; doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    const datosEmpresa = [recibo.emisor?.cuit || import.meta.env.VITE_EMPRESA_CUIT, recibo.emisor?.domicilio || import.meta.env.VITE_EMPRESA_DOMICILIO, recibo.emisor?.telefono || import.meta.env.VITE_EMPRESA_TELEFONO, recibo.emisor?.email || import.meta.env.VITE_EMPRESA_EMAIL].filter(Boolean);
    if (datosEmpresa.length) { doc.text(datosEmpresa.join(" · "), left, y, { maxWidth: width }); y += 15; }
    y += 8; doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("RECIBO DE PAGO", left, y);
    doc.setFontSize(11); doc.text(recibo.numero || `REC-${String(recibo.id_recibo).padStart(6, "0")}`, left + width, y, { align: "right" });
    y += 20; doc.setDrawColor(180); doc.line(left, y, left + width, y); y += 24;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Emitido: ${date(recibo.fecha_emision)}     Pago: ${date(recibo.fecha_pago)}`, left, y); y += 18;
    doc.text(`Recibimos de: ${recibo.cliente}`, left, y); y += 24;
    doc.setFont("helvetica", "bold");
    doc.text("Venta", left, y); doc.text("Fecha", left + 100, y); doc.text("Importe original", left + 260, y, { align: "right" }); doc.text("Abonado", left + width, y, { align: "right" });
    y += 10; doc.line(left, y, left + width, y); y += 18; doc.setFont("helvetica", "normal");
    const detalle = recibo.detalle || recibo.ReciboPagoVentas || [];
    detalle.forEach((item) => {
        if (y > 730) { doc.addPage(); y = 58; }
        const venta = item.Venta || item.venta || {};
        const original = item.total ?? (venta.VentaDetalles || []).reduce((s, d) => s + Number(d.precio || 0) * Number(d.cantidad || 0), 0);
        doc.text(`#${item.id_venta || venta.id_venta}`, left, y);
        doc.text(date(item.fecha || venta.fecha), left + 100, y);
        doc.text(money(original), left + 260, y, { align: "right" });
        doc.text(money(item.importe), left + width, y, { align: "right" }); y += 22;
    });
    y += 10; doc.setDrawColor(180); doc.line(left, y, left + width, y); y += 24;
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.text(`Total recibido: ${money(recibo.total)}`, left + width, y, { align: "right" });
    y += 24; doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(`Medio de pago: ${recibo.medio_pago || "-"}`, left, y); y += 18;
    if (recibo.observaciones) { doc.text(`Observaciones: ${recibo.observaciones}`, left, y, { maxWidth: width }); y += 30; }
    y += 24; doc.setFont("helvetica", "italic");
    doc.text("Recibimos de conformidad el importe indicado en concepto de cancelación de las ventas detalladas en el presente comprobante.", left, y, { maxWidth: width });
    y += 70; doc.setFont("helvetica", "normal"); doc.line(left + 20, y, left + 230, y); doc.text("Firma y aclaración", left + 20, y + 16);
    const blobUrl = URL.createObjectURL(doc.output("blob"));
    const viewer = window.open(blobUrl, "_blank", "noopener,noreferrer");
    if (!viewer) doc.save(`${recibo.numero || `REC-${recibo.id_recibo}`}.pdf`);
    else window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export default function RecibosPagoModal({ mode = "crear", ventas = [], onClose, onCreated }) {
    const [fechaPago, setFechaPago] = useState(hoy());
    const [medio, setMedio] = useState("efectivo");
    const [observaciones, setObservaciones] = useState("");
    const [importes, setImportes] = useState({});
    const [recibos, setRecibos] = useState([]);
    const [buscar, setBuscar] = useState("");
    const [fechaFiltro, setFechaFiltro] = useState("");
    const [guardando, setGuardando] = useState(false);
    useEffect(() => {
        setImportes(Object.fromEntries(ventas.map((v) => [v.id_venta, Number(v.saldo_pendiente ?? v.total ?? 0)])));
        if (mode === "historial") getRecibosPago().then((data) => setRecibos(Array.isArray(data) ? data : []));
    }, [ventas, mode]);
    const total = useMemo(() => ventas.reduce((s, v) => s + Number(importes[v.id_venta] || 0), 0), [ventas, importes]);
    const recibosFiltrados = recibos.filter((r) => `${r.cliente} ${r.numero}`.toLowerCase().includes(buscar.toLowerCase()) && (!fechaFiltro || r.fecha_pago === fechaFiltro));
    const guardar = async () => {
        for (const venta of ventas) {
            const importe = Number(importes[venta.id_venta]);
            if (!Number.isFinite(importe) || importe <= 0 || importe > Number(venta.saldo_pendiente ?? venta.total)) {
                toast.error(`Revisa el importe de la venta #${venta.id_venta}`); return;
            }
        }
        setGuardando(true);
        const resp = await crearReciboPago({ ventas: ventas.map((v) => v.id_venta), pagos: ventas.map((v) => ({ id_venta: v.id_venta, importe: Number(importes[v.id_venta]) })), fecha_pago: fechaPago, fecha_emision: hoy(), medio_pago: medio, observaciones });
        setGuardando(false);
        if (!resp.ok) { toast.error(resp.error || "No se pudo registrar el pago"); return; }
        descargarRecibo(resp.recibo);
        toast.success("Pago registrado y recibo generado");
        onCreated?.(); onClose?.();
    };

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
        <section className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-green-500 px-6 py-4 text-white">
                <div className="flex items-center gap-3"><ReceiptText /><div><h2 className="text-xl font-bold">{mode === "historial" ? "Historial de recibos" : "Confirmar cobro y generar recibo"}</h2><p className="text-sm text-emerald-50">{mode === "crear" ? `${ventas[0]?.persona || "Cliente"} · ${ventas.length} venta(s)` : "Consulta y descarga comprobantes"}</p></div></div>
                <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/15" aria-label="Cerrar"><X /></button>
            </header>
            {mode === "crear" ? <div className="max-h-[calc(92vh-76px)] space-y-5 overflow-y-auto p-6">
                <div className="overflow-x-auto rounded-xl border"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Venta / fecha</th><th className="p-3 text-right">Importe original</th><th className="p-3 text-right">Saldo pendiente</th><th className="p-3 text-right">A cobrar</th></tr></thead><tbody className="divide-y">{ventas.map((v) => <tr key={v.id_venta}><td className="p-3 font-medium">Venta #{v.id_venta}<span className="ml-2 text-slate-500">{date(v.fecha)}</span></td><td className="p-3 text-right">{money(v.total)}</td><td className="p-3 text-right">{money(v.saldo_pendiente)}</td><td className="p-3 text-right"><input type="number" min="0.01" max={v.saldo_pendiente} step="0.01" value={importes[v.id_venta] ?? ""} onChange={(e) => setImportes((prev) => ({ ...prev, [v.id_venta]: e.target.value }))} className="w-32 rounded-lg border px-3 py-2 text-right" /></td></tr>)}</tbody></table></div>
                <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Fecha del pago<input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label><label className="text-sm font-medium">Medio de pago<select value={medio} onChange={(e) => setMedio(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="cheque">Cheque</option><option value="otro">Otro</option></select></label></div>
                <label className="block text-sm font-medium">Observaciones (opcional)<textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border p-2.5" /></label>
                <div className="flex flex-col items-end gap-3 border-t pt-4 sm:flex-row sm:justify-between"><p className="text-xl font-bold text-emerald-800">Total recibido: {money(total)}</p><div className="flex gap-2"><button onClick={onClose} className="rounded-lg border px-4 py-2.5">Cancelar</button><button disabled={guardando || total <= 0} onClick={guardar} className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{guardando ? "Registrando..." : "Confirmar pago y descargar PDF"}</button></div></div>
            </div> : <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-6"><div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar cliente o número de recibo" className="w-full rounded-lg border py-2.5 pl-10 pr-3" /></div><input aria-label="Filtrar por fecha de pago" type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} className="rounded-lg border px-3 py-2.5" /></div><div className="space-y-3">{recibosFiltrados.map((r) => <article key={r.id_recibo} className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"><div><p className="font-bold text-slate-800">{r.numero} · {r.cliente}</p><p className="text-sm text-slate-500">Pago: {date(r.fecha_pago)} · {r.ReciboPagoVentas?.length || 0} venta(s) · {r.medio_pago}</p><p className="text-sm font-semibold text-emerald-700">{money(r.total)}</p><p className="text-xs text-slate-500">{(r.ReciboPagoVentas || []).map((item) => `#${item.id_venta}`).join(", ")}</p></div><button onClick={() => descargarRecibo(r)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white"><Download className="h-4 w-4" />Ver / imprimir PDF</button></article>)}{recibosFiltrados.length === 0 && <p className="py-10 text-center text-slate-500">No hay recibos para mostrar.</p>}</div></div>}
        </section>
    </div>;
}
