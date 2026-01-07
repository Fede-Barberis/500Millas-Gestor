import { Edit2, Trash2, AlertCircle, Package, TrendingUp } from "lucide-react";
import alfajorImg from "/assets/img/alfajor-1.webp";
import bolsa1Img from "/assets/img/galleta1-2.webp";
import bolsa2Img from "/assets/img/galleta2-2.webp";
import sinImg from "/assets/img/default.webp";
import ConfirmModal from "../components/ModalConfirmacion"
import { useState } from "react";

export default function ProductoCard({ producto, onDelete, onEdit, movimientos }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [idAEliminar, setIdAEliminar] = useState(null);

    const abrirModal = (id) => {
        setIdAEliminar(id);
        setModalOpen(true);
    };

    const confirmarEliminacion = async () => {
        await onDelete(idAEliminar);
        setModalOpen(false);
        setIdAEliminar(null);
    };

    // Determinar color según nivel de stock
    const getStockStatus = (stock) => {
        if (stock <= 10) return {
            color: "text-red-600 bg-red-50 border-red-200",
            bgGradient: "from-red-500 to-rose-500",
            icon: "🔴",
            label: "Crítico",
            barColor: "bg-gradient-to-r from-red-500 to-rose-500"
        };
        if (stock <= 30) return {
            color: "text-amber-600 bg-amber-50 border-amber-200",
            bgGradient: "from-amber-500 to-orange-500",
            icon: "🟡",
            label: "Bajo",
            barColor: "bg-gradient-to-r from-amber-500 to-orange-500"
        };
        return {
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
            bgGradient: "from-emerald-500 to-green-500",
            icon: "🟢",
            label: "Óptimo",
            barColor: "bg-gradient-to-r from-emerald-500 to-green-500"
        };
    };

    const getStockMin = (id) => {
        if (id === 4) return {
            label: "21",
        };
        return {
            label: "10"
        }
    };

    const stockMin = getStockMin(producto.id_producto)
    const stockStatus = getStockStatus(producto.stock);
    const stockPercentage = Math.min((producto.stock / 100) * 100, 100);

    // Imágenes 
    const imagenesProductos = {
        4: alfajorImg,
        5: bolsa1Img,
        6: bolsa2Img,
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group">
            
            {/* Imagen del producto con overlay gradiente */}
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                    src={imagenesProductos[producto.id_producto] || sinImg }
                    alt={producto.nombre}
                    className={`w-full h-full ${(imagenesProductos[producto.id_producto] || sinImg) === sinImg ? "object-cover": "object-contain sm:scale-125 sm:group-hover:scale-150 scale-90 group-hover:scale-100"}  transition-transform duration-700`}
                />
                
                {/* Overlay gradiente sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge de stock en la imagen */}
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold border-2 backdrop-blur-md ${stockStatus.color} shadow-lg`}>
                    <span className="mr-1">{stockStatus.icon}</span>
                    {stockStatus.label}
                </div>
                
                {/* Badge de alerta si stock crítico */}
                {producto.stock <= 10 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {producto.stock === 0 ? "Sint stock" : "Poco stock"}
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-2 sm:p-6 ">
                
                {/* Header con nombre y stock numérico */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">
                            {producto.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            ID: {producto.id_producto}
                        </p>
                    </div>
                    
                    {/* Stock grande destacado */}
                    <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {Math.round(producto.stock)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">unidades</div>
                    </div>
                </div>

                {/* Barra de stock */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Inventario
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                            {stockPercentage.toFixed(0)}%
                        </span>
                    </div>
                    
                    {/* Barra de progreso con gradiente */}
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${stockStatus.barColor} shadow-lg`}
                            style={{ width: `${stockPercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="grid sm:grid-cols-2 sm:grid-rows-1 gap-3 mb-2 grid-cols-1 grid-rows-2">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-900">Movimiento</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">{movimientos.movimientosTotales || 0}</p>
                        <p className="text-xs text-blue-600">Esta semana</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-900">Mínimo</span>
                        </div>
                        <p className="text-lg font-bold text-purple-700">{stockMin.label}</p>
                        <p className="text-xs text-purple-600">Recomendado</p>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                        onClick={() => onEdit(producto)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar
                    </button>
                    <button
                        onClick={() => abrirModal(producto.id_producto)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl hover:from-rose-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: shimmer 2s infinite;
                }
            `}</style>

            <ConfirmModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmarEliminacion}
                title="Confirmar eliminación"
                message="¿Seguro que deseas eliminar este producto? Esta acción eliminara el stock de dicho producto."
            />

        </div>
    );
}