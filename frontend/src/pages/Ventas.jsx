import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useVentaData } from "../hooks/useVentaData.js";
import VentaTable from "../components/VentaTabla.jsx";
import VentaForm from "../components/VentaForm.jsx";

export default function Ventas() {
    const { ventas, productos, loading, error, reload: fetchData, modificarVenta, deleteVenta } = useVentaData();
    
    const [modalOpen, setModalOpen] = useState(false);
    const [ventaAEditar, setVentaAEditar] = useState(null);

    const abrirModalCrear = () => {
        setVentaAEditar(null); // Limpiar datos de edición
        setModalOpen(true);
    };

    const abrirModalEditar = (venta) => {
        setVentaAEditar(venta); // Guardar producción a editar
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setVentaAEditar(null); // Limpiar al cerrar
    };

    if (loading) return <p className="text-gray-500">Cargando...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="px-6 py-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
                <div>
                    <h2 className="text-center sm:text-left font-heading text-4xl font-semibold text-gray-800">
                        Ventas
                    </h2>
                    <p className="text-center sm:text-left text-gray-500 mt-1">
                        Gestiona el registro de ventas
                    </p>
                </div>
                
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-heading font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Venta
                </button>
            </div>
            
            <VentaTable
                ventas={ventas} 
                productos={productos}
                eliminarVenta={deleteVenta}
                editarVenta={abrirModalEditar}
            />

            <div className='space-y-0'>
                {modalOpen && (
                    <VentaForm
                        productos={productos}
                        initialData={ventaAEditar} 
                        isEditing={!!ventaAEditar} 
                        onCreated={() => {
                            fetchData();
                            setModalOpen(false);
                        }}
                        onClose={cerrarModal}
                        onSubmitVenta={modificarVenta}
                    />
                )}
            </div>
        </div>
    )
}