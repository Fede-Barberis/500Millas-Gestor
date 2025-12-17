import useMateriaPrimaData from '../hooks/useMateriaPrimaData'
import MateriaPrimaTable from '../components/MateriaPrimaTabla'
import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import MateriaPrimaCard from '../components/MateriaPrimaCard';
import CompraMpForm from '../components/CompraMpForm';
import { Loading, ErrorMessage } from '../components/Loading';

export default function MateriaPrima() {
    const { materiaPrimas, comprasMp, loading, error, reload: fetchData, modificarCompraMp, deleteCompraMp } = useMateriaPrimaData();
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

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <div className="px-6 py-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
                <div>
                    <h2 className="text-center sm:text-left font-heading text-4xl font-semibold text-gray-800">
                        Materias Primas
                    </h2>
                    <p className="text-center sm:text-left text-gray-500 mt-1">
                        Gestiona tus insumos
                    </p>
                </div>
                
                <button
                    onClick={abrirModalCrear}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-300 text-white font-heading font-semibold rounded-lg hover:from-yellow-500 hover:to-red-500 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Registrar Compra MP
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {materiaPrimas.map((mp) => (
                    <MateriaPrimaCard
                        key={mp.id_materiaPrima}
                        materiaPrima={mp}
                    />
                ))}
            </div>

            {/* Mensaje si no hay productos */}
            {materiaPrimas.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No hay materia primas registradas
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Comienza agregando tu primer materia prima al inventario
                    </p>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar Primer materia prima
                    </button>
                </div>
            )}
            
            <MateriaPrimaTable 
                comprasMp={comprasMp} 
                materiaPrimas={materiaPrimas} 
                eliminarMateriaPrima={deleteCompraMp}
                editarMateriaPrima={abrirModalEditar}
            />

            <div className='space-y-0'>
                {modalOpen && (
                    <CompraMpForm
                        materiaPrimas={materiaPrimas}
                        initialData={produccionAEditar} 
                        isEditing={!!produccionAEditar} 
                        onCreated={() => {
                            fetchData();
                            setModalOpen(false);
                        }}
                        onClose={cerrarModal}
                        onSubmitCompra={modificarCompraMp}
                    />
                )}
            </div>
        </div>
    );
}
