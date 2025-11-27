import useProduccionData from '../hooks/useProduccionData'
import ProduccionTable from '../components/ProduccionTabla'
import ProduccionForm from '../components/ProduccionForm';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function Productos() {
    const { producciones, recetas, productos , deleteProduccion, modificarProduccion, loading, error, reload: fetchData } = useProduccionData();
    const [modalOpen, setModalOpen] = useState(false);
    const [produccionAEditar, setProduccionAEditar] = useState(null);

    const abrirModalCrear = () => {
        setProduccionAEditar(null); // Limpiar datos de edición
        setModalOpen(true);
    };

    const abrirModalEditar = (produccion) => {
        setProduccionAEditar(produccion); // Guardar producción a editar
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setProduccionAEditar(null); // Limpiar al cerrar
    };

    if (loading) return <p className="text-gray-500">Cargando...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="px-6 py-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
                <div>
                    <h2 className="font-heading text-4xl font-semibold text-gray-800">
                        Produccion
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Gestiona tus producciones
                    </p>
                </div>
                
                <button
                    onClick={abrirModalCrear}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-heading font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Producto
                </button>
            </div>

            <ProduccionTable 
                producciones={producciones} 
                productos={productos} 
                recetas={recetas} 
                eliminarProduccion={deleteProduccion}
                editarProduccion={abrirModalEditar}
            />

            {modalOpen && (
                <ProduccionForm
                    recetas={recetas}
                    productos={productos}
                    initialData={produccionAEditar} 
                    isEditing={!!produccionAEditar} 
                    onCreated={() => {
                        fetchData();
                        setModalOpen(false);
                    }}
                    onClose={cerrarModal}
                    onSubmitProduccion={modificarProduccion}
                />
            )}
        </div>
    );
}
