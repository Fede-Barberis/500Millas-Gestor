import { X, User, Package, Calendar, DollarSign, CheckCircle, Clock } from "lucide-react";

export default function ModalDetallePedido({ pedido, onClose }) {
    if (!pedido || !Array.isArray(pedido) || pedido.length === 0) return null;

    // Calcular totales del día
    const totalDelDia = pedido.reduce((acc, p) => {
        const totalPedido = p.DetallePedidos.reduce((sum, d) => 
            sum + (d.cantidad * d.precio_unitario), 0
        );
        return acc + totalPedido;
    }, 0);

    const pedidosEntregados = pedido.filter(p => p.estado === "entregado").length;
    const pedidosPendientes = pedido.filter(p => p.estado === "pendiente").length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Pedidos del día
                                </h2>
                            </div>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stats del día */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="text-white/70 text-xs font-medium mb-1">Total Pedidos</div>
                            <div className="text-white text-2xl font-bold">{pedido.length}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="text-white/70 text-xs font-medium mb-1">Entregados</div>
                            <div className="text-white text-2xl font-bold">{pedidosEntregados}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="text-white/70 text-xs font-medium mb-1">Pendientes</div>
                            <div className="text-white text-2xl font-bold">{pedidosPendientes}</div>
                        </div>
                    </div>
                </div>

                {/* Contenido scrolleable */}
                <div className="overflow-y-auto flex-1 p-6 bg-gray-50">
                    <div className="space-y-4">
                        {pedido.map((p, index) => {
                            const totalPedido = p.DetallePedidos.reduce((sum, d) => 
                                sum + (d.cantidad * d.precio_unitario), 0
                            );

                            return (
                                <div 
                                    key={p.id_pedido} 
                                    className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-purple-500 hover:shadow-lg transition-shadow"
                                >
                                    {/* Header del pedido */}
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4 border-b border-purple-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-800">
                                                            {p.persona}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Pedido #{p.id_pedido}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {p.estado === "Entregado" ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Entregado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                                                <Clock className="w-3 h-3" />
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    ${totalPedido.toLocaleString('es-AR')}
                                                </div>
                                                <div className="text-xs text-gray-500">Total</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabla de productos */}
                                    <div className="p-5">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-200">
                                                        <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase">
                                                            Producto
                                                        </th>
                                                        <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 uppercase">
                                                            Cantidad
                                                        </th>
                                                        <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 uppercase">
                                                            Precio
                                                        </th>
                                                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 uppercase">
                                                            Subtotal
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {p.DetallePedidos.map((d, idx) => (
                                                        <tr 
                                                            key={d.id_detallePedido} 
                                                            className={`border-b border-gray-100 ${
                                                                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                            }`}
                                                        >
                                                            <td className="py-3 px-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="w-4 h-4 text-purple-500" />
                                                                    <span className="font-medium text-gray-800">
                                                                        {d.Producto.nombre}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-3 px-2">
                                                                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                                    {d.cantidad}
                                                                </span>
                                                            </td>
                                                            <td className="text-center py-3 px-2 text-gray-700">
                                                                ${Number(d.precio_unitario).toLocaleString('es-AR')}
                                                            </td>
                                                            <td className="text-right py-3 px-2 font-bold text-gray-800">
                                                                ${(d.cantidad * d.precio_unitario).toLocaleString('es-AR')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer con total del día */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-lg font-semibold">Total del Día</span>
                        </div>
                        <span className="text-3xl font-bold">
                            ${totalDelDia.toLocaleString('es-AR')}
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-slideUp { animation: slideUp 0.3s ease-out; }
            `}</style>
        </div>
    );
}