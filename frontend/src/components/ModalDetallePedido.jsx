import React from 'react'

export default function ModalDetallePedido({ pedido, onClose}) {
    if (!pedido) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-[550px] max-h-[80vh] overflow-y-auto relative'>

                <button
                    className='absolute top-7 right-6 text-red-500 hover:text-red-700'
                    onClick={onClose}
                >
                    X
                </button>

                <h2 className='text-xl font-bold mb-4'>
                    Pedidos del día ({pedido.length})
                </h2>

                {pedido.map(pedido => (
                    <div key={pedido.id_pedido} className="mb-6 border rounded p-4 shadow-sm">

                        <p className='text-gray-600 mb-2'>
                            <strong>Pedido #{pedido.id_pedido}</strong> — {pedido.persona}
                        </p>

                        <table className="w-full text-sm border-collapse mb-2">
                            <thead>
                                <tr className="border-b bg-blue-100">
                                    <th className="text-left py-2">Producto</th>
                                    <th className="text-center py-2">Cant.</th>
                                    <th className="text-center py-2">Precio unit.</th>
                                    <th className="text-right py-2">Subtotal</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pedido.DetallePedidos.map(d => (
                                    <tr key={d.id_detallePedido} className="border-b">
                                        <td className="py-2 font-semibold">{d.Producto.nombre}</td>
                                        <td className="text-center py-2">{d.cantidad}</td>
                                        <td className="text-center py-2">${Number(d.precio_unitario).toFixed(2)}</td>
                                        <td className="text-right py-2">
                                            ${(d.cantidad * d.precio_unitario).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            {/* <tfoot>
                                <tr>
                                    <td colSpan="3" className="py-3 font-bold text-lg">Total</td>
                                    <td className="py-3 text-right font-bold text-lg">
                                        ${pedido.DetallePedidos
                                            .reduce((acc, d) => acc + d.cantidad * d.precio_unitario, 0)
                                            .toFixed(2)
                                        }
                                    </td>
                                </tr>
                            </tfoot> */}
                        </table>
                    </div>
                ))}

            </div>
        </div>
    );
}
