import { Package, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useProductoData } from "../hooks/useProductoData.js";
import ProductoCard from "../components/ProductoCard.jsx";
import ProductoForm from "../components/ProductoForm.jsx";

export default function Productos() {
    const { productos, loading, error, deleteProducto, modificarProducto, movimientos, reload } = useProductoData();
    const [modalOpen, setModalOpen] = useState(false);
    const [productoAEditar, setProductoAEditar] = useState(null);

    const abrirModalCrear = () => {
        setProductoAEditar(null); // Limpiar datos de edición
        setModalOpen(true);
    };

    const abrirModalEditar = (producto) => {
        setProductoAEditar(producto); // Guardar producción a editar
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setProductoAEditar(null); // Limpiar al cerrar
    };

    if (loading) return <p className="text-gray-500">Cargando productos...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="px-6 py-2 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
                <div>
                    <h2 className="font-heading text-4xl font-semibold text-gray-800">
                        Productos
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Gestiona tu catálogo de productos
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

            {/* Cards de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productos.map((producto) => (
                    <ProductoCard
                        key={producto.id_producto}
                        producto={producto}
                        onEdit={abrirModalEditar}
                        onDelete={deleteProducto}
                        movimientos={movimientos[producto.id_producto]}
                    />
                ))}
            </div>

            {/* Mensaje si no hay productos */}
            {productos.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No hay productos registrados
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Comienza agregando tu primer producto al catálogo
                    </p>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Agregar Primer Producto
                    </button>
                </div>
            )}

            <div className='space-y-0'>
                {modalOpen && (
                    <ProductoForm
                        productos={productos}
                        initialData={productoAEditar} 
                        isEditing={!!productoAEditar} 
                        onCreated={() => {
                            reload(); 
                            setModalOpen(false);
                        }}
                        onClose={cerrarModal}
                        onSubmitProducto={modificarProducto}
                    />
                )}
            </div>
        </div>
    );
}