import { Package, ChefHat, Image as ImageIcon, X, Upload, TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { productoSchema } from "../schemas/productoSchemas.js";
import { crearProducto } from "../api/productoApi";



export default function ProductoForm({ onCreated, onClose, initialData, isEditing = false, onSubmitProducto }) {
    // const [imagePreview, setImagePreview] = useState(initialData?.imagen || null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(productoSchema),
        defaultValues: {
            nombre: "",
            // imagen: "",
            stock: ""
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                nombre: initialData.nombre,
                // imagen: "",
                stock: initialData.stock
            });
        } else {
            reset({
                nombre: "",
                // imagen: "",
                stock: ""
            });
        }
    }, [initialData, reset]);

    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setImagePreview(reader.result);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    // const removeImage = () => {
    //     setImagePreview(null);
    // };

    const onSubmit = async (data) => {
        try {
            let resp;
            
            if (isEditing) {
                // EDITAR
                resp = await onSubmitProducto({
                    id_producto: initialData.id_producto,
                    ...data
                }); 
                
                if (resp?.ok !== false) {
                    toast.success("Producto actualizado", {
                        description: "Los cambios se guardaron correctamente",
                    });
                    onCreated();
                    onClose();
                } else {
                    throw new Error(resp.error || "Error al actualizar");
                }
            } else {
                // CREAR
                resp = await crearProducto(data);

                if (resp.ok) {
                    toast.success("Producto creado")
                    onCreated(resp.produccion);
                    onClose();
                } else {
                    const errorMsg = resp.error || "Ocurrió un error inesperado";
                    toast.error("Error al crear la producción", {
                        description: errorMsg,
                        duration: 6000,
                    });
                }
            }
        } catch (error) {
            toast.error(isEditing ? "Error al actualizar" : "Error de conexión", {
                description: error.message || "No se pudo comunicar con el servidor",
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] sm:max-w-xl md:max-w-xl lg:max-w-xl overflow-hidden transform transition-all animate-slideUp">
                
                {/* Header con gradiente */}
                <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 overflow-hidden">
                    {/* Decoración de fondo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {initialData ? "Editar Producto" : "Nuevo Producto"}
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    Complete la información del producto
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Contenido del formulario */}
                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)}  className="space-y-6">
                        
                        {/* Grid principal: Datos */}
                        <div className="grid grid-cols-1">
                            
                            {/* Sección de datos */}
                            <div className="lg:col-span-2 space-y-5">
                                
                                {/* Nombre del producto */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <ChefHat className="w-4 h-4 text-blue-600" />
                                        Nombre del Producto
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("nombre")}
                                        placeholder="Ej: Alfajor de Maicena Triple"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <span className="font-bold">•</span> {errors.nombre.message}
                                        </p>
                                    )}
                                </div>

                                {/* Stock inicial */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Package className="w-4 h-4 text-blue-600" />
                                        Stock Inicial
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            {...register("stock")}
                                            step="0.01"
                                            placeholder="0"
                                            disabled={isEditing}
                                            className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                            unidades
                                        </span>
                                        {errors.stock && (
                                            <p className="text-red-500 text-sm flex items-center gap-1">
                                                <span className="font-bold">•</span> {errors.stock.message}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-start gap-1">
                                        <span className="text-yellow-600 mt-0.5"><TriangleAlert size={12}/></span>
                                        El stock se actualizará automáticamente con las producciones y ventas
                                    </p>
                                </div>

                                {/* Info box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-lg">💡</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-900 mb-1 text-sm">
                                                Gestión automática de stock
                                            </h4>
                                            <p className="block md:hidden text-xs text-blue-700 leading-relaxed">
                                                Su stock se actualizará automáticamente.
                                            </p>
                                            <p className="hidden md:block text-xs text-blue-700 leading-relaxed">
                                                Una vez creado el producto, su stock se actualizará automáticamente cuando registres producciones (aumenta) o ventas (disminuye). No necesitas modificarlo manualmente.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer con botones */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-0 sm:pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                            >
                                <Package className="w-4 h-4" />
                                {initialData ? "Guardar Cambios" : "Crear Producto"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}



{/* Sección de imagen */}
{/* <div className="lg:col-span-1">
    <label className="block text-sm font-semibold text-gray-700 mb-3">
        <ImageIcon className="w-4 h-4 inline mr-2 text-blue-600" />
        Imagen del producto
    </label>
    
    <div className="relative">
        {imagePreview ? (
            <div className="relative group">
                <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 shadow-md"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Eliminar
                    </button>
                </div>
            </div>
        ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                    <p className="text-sm text-gray-600 font-medium mb-1">
                        Click para subir imagen
                    </p>
                    <p className="text-xs text-gray-400">
                        PNG, JPG hasta 5MB
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    {...register("imagen")}
                    onChange={handleImageChange}
                />
            </label>
            
        )}
    </div>
    
    {!imagePreview && (
        <p className="text-xs text-gray-500 mt-2 text-center">
            Opcional: Puedes agregar una imagen después
        </p>
    )}
</div> */}