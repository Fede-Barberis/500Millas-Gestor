import { useMemo, useState } from "react";
import { AlertTriangle, MinusCircle, X } from "lucide-react";
import { toast } from "sonner";

export default function DescontarStockModal({ materiaPrimas, onClose, onSubmit }) {
    const [idMateriaPrima, setIdMateriaPrima] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const materiaSeleccionada = useMemo(
        () => materiaPrimas.find((mp) => String(mp.id_materiaPrima) === idMateriaPrima),
        [materiaPrimas, idMateriaPrima]
    );
    const unidad = materiaSeleccionada?.unidad_base || "";
    const stockActual = Number(materiaSeleccionada?.stock || 0);
    const cantidadNumber = Number(cantidad);
    const cantidadValida = Number.isFinite(cantidadNumber)
        && cantidadNumber > 0
        && cantidadNumber <= stockActual
        && (unidad !== "unidad" || Number.isInteger(cantidadNumber));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!materiaSeleccionada || !cantidadValida) return;

        setIsSubmitting(true);
        const response = await onSubmit(materiaSeleccionada.id_materiaPrima, cantidadNumber);
        setIsSubmitting(false);

        if (!response?.ok) {
            toast.error("No se pudo descontar el stock", { description: response?.error || "Intentá nuevamente." });
            return;
        }

        toast.success("Stock descontado", {
            description: `${materiaSeleccionada.nombre}: ${cantidadNumber} ${unidad} descontados.`
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="descontar-stock-title">
                <div className="flex items-start justify-between bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <span className="rounded-xl bg-white/20 p-2"><MinusCircle className="h-6 w-6" /></span>
                        <div>
                            <h2 id="descontar-stock-title" className="text-xl font-bold">Descontar stock</h2>
                            <p className="mt-1 text-sm text-white/90">Registrá un ajuste manual de inventario</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/20" aria-label="Cerrar"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <label className="block text-sm font-semibold text-gray-700">
                        Materia prima
                        <select
                            required
                            value={idMateriaPrima}
                            onChange={(event) => { setIdMateriaPrima(event.target.value); setCantidad(""); }}
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-normal focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        >
                            <option value="" disabled>Seleccioná una materia prima</option>
                            {materiaPrimas.map((mp) => <option key={mp.id_materiaPrima} value={mp.id_materiaPrima}>{mp.nombre}</option>)}
                        </select>
                    </label>

                    {materiaSeleccionada && (
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-sm text-slate-600">Stock actual</span>
                            <span className="text-lg font-bold text-slate-900">{stockActual.toLocaleString("es-AR", { maximumFractionDigits: 2 })} <span className="text-sm font-medium text-slate-500">{unidad}</span></span>
                        </div>
                    )}

                    <label className="block text-sm font-semibold text-gray-700">
                        Cantidad a descontar{unidad ? ` (${unidad})` : ""}
                        <input
                            type="number"
                            required
                            min={unidad === "unidad" ? "1" : "0.01"}
                            max={materiaSeleccionada ? stockActual : undefined}
                            step={unidad === "unidad" ? "1" : "0.01"}
                            value={cantidad}
                            onChange={(event) => setCantidad(event.target.value)}
                            disabled={!materiaSeleccionada}
                            placeholder="Ingresá la cantidad"
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-normal focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100"
                        />
                        {unidad === "unidad" && <span className="mt-1 block text-xs font-normal text-gray-500">Ingresá una cantidad entera.</span>}
                    </label>

                    {materiaSeleccionada && cantidadNumber > stockActual && (
                        <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />La cantidad supera el stock disponible.</p>
                    )}

                    {materiaSeleccionada && cantidadValida && (
                        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            Stock luego del ajuste: <strong>{(stockActual - cantidadNumber).toLocaleString("es-AR", { maximumFractionDigits: 2 })} {unidad}</strong>
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={!cantidadValida || isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
                            <MinusCircle className="h-4 w-4" />{isSubmitting ? "Descontando..." : "Confirmar descuento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
