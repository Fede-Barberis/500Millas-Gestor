import { useForm, useFieldArray } from "react-hook-form";
import { Package, Calendar, ClipboardList, Plus, X,  } from "lucide-react";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { productionSchema } from "../schemas/productionSchemas.js";
import { crearProduccion } from "../api/produccionApi";

export default function ProduccionForm({ recetas = [], productos = [], onCreated, onClose, initialData, isEditing = false, onSubmitProduccion }) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(productionSchema),
        defaultValues: {
            fecha: "",
            id_receta: "",
            detalles: [],
        },
    });

    // FieldArray para productos dinámicos
    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles",
    });

    useEffect(() => {
        if (initialData) {
            reset({
                fecha: initialData.fecha,
                id_receta: initialData.id_receta,
                detalles: initialData.DetalleProduccions?.map(d => ({
                    id_producto: d.id_producto,
                    cantidad: d.cantidad,
                    lote: d.lote,
                    fch_vencimiento: d.fch_vencimiento
                })) ?? []
            });
        } else {
            reset({
                fecha: "",
                id_receta: "",
                detalles: []
            });
        }
    }, [initialData, reset]);

    const agregarProducto = () => {
        append({
            id_producto: "",
            cantidad: "",
            fch_vencimiento: "",
            lote: "",
        });
    };

    const onSubmit = async (data) => {
        try {
            let resp;
            
            if (isEditing) {
                // EDITAR
                resp = await onSubmitProduccion({
                    id_produccion: initialData.id_produccion,
                    ...data
                }); 
                
                if (resp?.ok !== false) {
                    toast.success("Producción actualizada", {
                        description: "Los cambios se guardaron correctamente",
                    });
                    onCreated();
                    onClose();
                } else {
                    throw new Error(resp.error || "Error al actualizar");
                }
            } else {
                // CREAR
                resp = await crearProduccion(data);

                if (resp.ok) {
                    toast.success("Producción creada", {
                        description: "Stock actualizado correctamente",
                    });
                    onCreated(resp.produccion);
                    onClose();
                } else {
                    const errorMsg = resp.error || "Ocurrió un error inesperado";

                    if (errorMsg.includes("Stock insuficiente")) {
                        toast.error("Stock insuficiente", {
                            description: errorMsg,
                            duration: 8000,
                        });
                    } else {
                        toast.error("Error al crear la producción", {
                            description: errorMsg,
                            duration: 6000,
                        });
                    }
                }
            }
        } catch (error) {
            toast.error(isEditing ? "Error al actualizar" : "Error de conexión", {
                description: error.message || "No se pudo comunicar con el servidor",
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header con gradiente */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                    <div className="flex items-center gap-3 text-white">
                        <Package className="w-8 h-8" />
                        <h2 className="text-2xl font-bold">
                            {initialData ? "Editar Producción" : "Nueva Producción"}
                        </h2>
                    </div>
                    <p className="text-blue-100 text-sm mt-2">
                        {isEditing 
                            ? "Modifica los datos de la producción" 
                            : "Registra una nueva producción de productos"
                        }
                    </p>
                </div>

                {/* Contenido scrolleable */}
                <div className="overflow-y-auto flex-1 px-8 py-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Grid de 2 columnas para fecha y receta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fecha Producción */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Fecha de Producción
                                </label>
                                <input
                                    type="date"
                                    {...register("fecha")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                />
                                {errors.fecha && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.fecha.message}
                                    </p>
                                )}
                            </div>

                            {/* Receta */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <ClipboardList className="w-4 h-4 text-blue-600" />
                                    Receta Base
                                </label>
                                <select
                                    {...register("id_receta")}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                >
                                <option value="">Selecciona una receta</option>
                                {recetas.map((r) => (
                                    <option key={r.id_receta} value={r.id_receta}>
                                    {r.cantidad}
                                    </option>
                                ))}
                                </select>
                                {errors.id_receta && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span>{" "}
                                        {errors.id_receta.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Sección de productos */}
                        <div className="space-y-4">
                            <div className="flex  items-center justify-between">
                                <h3 className="text-md sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    Productos a Fabricar
                                </h3>
                                <button
                                    type="button"
                                    onClick={agregarProducto}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-800 transition-all shadow-sm hover:shadow-md font-medium text-sm"
                                >
                                <Plus className="w-4 h-4" />
                                    Agregar Producto
                                </button>
                            </div>

                            {fields.length === 0 && (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">
                                        No hay productos agregados. Haz clic en "Agregar Producto"
                                        para comenzar.
                                    </p>
                                </div>
                            )}

                            {/* Productos dinámicos */}
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Producto #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar producto"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Producto */}
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-600">
                                                Producto
                                            </label>
                                            <select
                                                {...register(`detalles.${index}.id_producto`)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
                                            >
                                            <option value="">Selecciona un producto</option>
                                            {productos.map((p) => (
                                                <option key={p.id_producto} value={p.id_producto}>
                                                    {p.nombre}
                                                </option>
                                            ))}
                                            </select>
                                            {errors.detalles?.[index]?.id_producto && (
                                                <p className="text-red-500 text-sm">
                                                    {errors.detalles[index].id_producto.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Cantidad */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-600">
                                                Cantidad
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`detalles.${index}.cantidad`)}
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                            />
                                            {errors.detalles?.[index]?.cantidad && (
                                                <p className="text-red-500 text-sm">
                                                    {errors.detalles[index].cantidad.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Lote */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-600">
                                                Lote
                                            </label>
                                            <input
                                                type="text"
                                                {...register(`detalles.${index}.lote`)}
                                                placeholder="Ej: L001"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                            />
                                            {errors.detalles?.[index]?.lote && (
                                                <p className="text-red-500 text-sm">
                                                    {errors.detalles[index].lote.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Fecha Vencimiento */}
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-600">
                                                Fecha de Vencimiento
                                            </label>
                                            <input
                                                type="date"
                                                {...register(`detalles.${index}.fch_vencimiento`)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                            />
                                            {errors.detalles?.[index]?.fch_vencimiento && (
                                                <p className="text-red-500 text-sm">
                                                    {errors.detalles[index].fch_vencimiento.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer con botones */}
                        <div className=" py-5 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit(onSubmit)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2">
                                <Package className="w-4 h-4" />
                                {initialData ? "Guardar Cambios" : "Crear Producción"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


