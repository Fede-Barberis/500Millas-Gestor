import { Edit2, Trash2, AlertCircle, Package, TrendingUp } from "lucide-react";
import alfajorImg from "/assets/img/alfajor-1.webp";
import bolsa1Img from "/assets/img/galleta1-2.webp";
import bolsa2Img from "/assets/img/galleta2-2.webp";
import sinImg from "/assets/img/default.webp";
import ConfirmModal from "../components/ModalConfirmacion";
import { useState } from "react";

export default function ProductoCard({ producto, onDelete, onEdit, movimientos }) {
    const [modalOpen, setModalOpen] = useState(false);

    const confirmarEliminacion = async () => {
        await onDelete(producto.id_producto);
        setModalOpen(false);
    };

    const stock = Number(producto.stock || 0);
    const stockMin = producto.id_producto === 4 ? "21" : "10";
    const stockPercentage = Math.min((stock / 100) * 100, 100);
    const stockStatus = stock <= 10
        ? { label: "Crítico", color: "bg-red-50 text-red-700 ring-red-200", bar: "from-red-500 to-rose-500" }
        : stock <= 30
            ? { label: "Bajo", color: "bg-amber-50 text-amber-700 ring-amber-200", bar: "from-amber-500 to-orange-500" }
            : { label: "Óptimo", color: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "from-emerald-500 to-green-500" };

    const imagenes = {
        4: alfajorImg,
        5: bolsa1Img,
        6: bolsa2Img,
    };
    const imagen = imagenes[producto.id_producto] || sinImg;
    const movimientosSemana = movimientos?.movimientosTotales ?? 0;

    return (
        <>
            <article className="group mx-auto flex h-full w-full max-w-[460px] flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:h-28 sm:w-28">
                        <img
                            src={imagen}
                            alt={producto.nombre}
                            className={`h-full w-full ${imagen === sinImg ? "object-cover" : "object-contain"} transition-transform duration-300 group-hover:scale-105`}
                        />
                        {stock <= 10 && (
                            <span className="absolute bottom-1.5 right-1.5 rounded-full bg-red-500 p-1 text-white shadow-sm" title={stock === 0 ? "Sin stock" : "Poco stock"}>
                                <AlertCircle className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                            <h3 className="min-w-0 line-clamp-2 text-base font-bold leading-tight text-slate-800 sm:text-lg">{producto.nombre}</h3>
                            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${stockStatus.color}`}>
                                {stockStatus.label}
                            </span>
                        </div>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                            <Package className="h-3.5 w-3.5" />
                            Producto #{producto.id_producto}
                        </p>
                        <div className="mt-3 flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold leading-none tracking-tight text-slate-900">{Math.round(stock)}</span>
                            <span className="text-xs font-medium text-slate-500">unidades en stock</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold uppercase tracking-wide text-slate-600">inventario</span>
                        <span className="font-bold text-slate-700">{stockPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full bg-gradient-to-r ${stockStatus.bar} transition-[width] duration-500`} style={{ width: `${stockPercentage}%` }} />
                    </div>
                </div>

                <div className="mt-3 mb-3 grid grid-cols-1 grid-rows-2 gap-3 sm:grid-cols-2 sm:grid-rows-1">
                    <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-900">Movimiento</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">{movimientosSemana}</p>
                        <p className="text-xs text-blue-600">Esta semana</p>
                    </div>
                    <div className="rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-900">Mínimo</span>
                        </div>
                        <p className="text-lg font-bold text-purple-700">{stockMin}</p>
                        <p className="text-xs text-purple-600">Recomendado</p>
                    </div>
                </div>

                <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={() => onEdit(producto)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
                    >
                        <Edit2 className="h-4 w-4" />
                        Editar producto
                    </button>
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-red-600 transition hover:border-red-200 hover:bg-red-100"
                        title="Eliminar producto"
                        aria-label={`Eliminar ${producto.nombre}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </article>

            <ConfirmModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmarEliminacion}
                title="Confirmar eliminación"
                message="¿Seguro que deseas eliminar este producto? Esta acción eliminará su stock."
            />
        </>
    );
}
