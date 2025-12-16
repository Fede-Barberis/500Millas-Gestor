import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import usePedidoData from "../hooks/usePedidoData";
import { useProductoData } from "../hooks/useProductoData.js";
import PedidoTable from "../components/PedidoTabla.jsx";
import PedidoForm from "../components/PedidoForm.jsx";

export default function Ventas() {
    const { pedidos, loading, error, reload: fetchData, modificarPedido, deletePedido } = usePedidoData();
    const { productos } = useProductoData();
    
    const [modalOpen, setModalOpen] = useState(false);
    const [pedidoAEditar, setPedidoAEditar] = useState(null);

    const abrirModalCrear = () => {
        setPedidoAEditar(null); // Limpiar datos de edición
        setModalOpen(true);
    };

    const abrirModalEditar = (venta) => {
        setPedidoAEditar(venta); // Guardar producción a editar
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setPedidoAEditar(null); // Limpiar al cerrar
    };

    if (loading) return <p className="text-gray-500">Cargando...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="px-6 py-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
                <div>
                    <h2 className="font-heading text-4xl font-semibold text-gray-800">
                        Pedidos
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Gestiona el registro de pedidos
                    </p>
                </div>
                
                <button
                    onClick={abrirModalCrear}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-600 to-indigo-700  text-white font-heading font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Pedido
                </button>
            </div>
            
            <PedidoTable
                pedidos={pedidos} 
                productos={productos}
                eliminarPedido={deletePedido}
                editarPedido={abrirModalEditar}
            />

            <div className='space-y-0'>
                {modalOpen && (
                    <PedidoForm
                        productos={productos}
                        initialData={pedidoAEditar} 
                        isEditing={!!pedidoAEditar} 
                        onCreated={() => {
                            fetchData();
                            setModalOpen(false);
                        }}
                        onClose={cerrarModal}
                        onSubmitPedido={modificarPedido}
                    />
                )}
            </div>
        </div>
    )
}