import { Package, Calendar, DollarSign, User, Hash, CheckCircle, X, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ventaSchema } from "../schemas/ventaSchemas.js"; 
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { crearVenta } from "../api/ventaApi.js";

export default function VentaForm({ productos = [], onClose, initialData, isEditing = false, onCreated, onSubmitVenta}) {
    const [isPagado, setIsPagado] = useState(initialData?.isPagado || false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(ventaSchema),
        defaultValues: {
            fecha: "",
            persona: "",
            id_pedido: null,
            isPagado: false,
            detalles: []
        },
    });

    // FieldArray para productos dinámicos
    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles",
    });

    // Cargar datos iniciales si es edición
    useEffect(() => {
        if (initialData) {
            reset({
                fecha: initialData.fecha,
                persona: initialData.persona,
                id_pedido: initialData.id_pedido || null,
                isPagado: initialData.isPagado ?? false,
                detalles: initialData.VentaDetalles?.map(d => ({
                    id_producto: d.id_producto,
                    cantidad: Number(d.cantidad),
                    precio: Number(d.precio)
                })) || []
            });

            setIsPagado(initialData.isPagado ?? false);

        } else {
            reset({
                fecha: "",
                persona: "",
                id_pedido: null,
                isPagado: false,
                detalles: []
            });
        }
    }, [initialData, reset]);


    // Agregar producto
    const agregarProducto = () => {
        append({
            id_producto: "",
            cantidad: "",
            precio: ""
        });
    };

    // Calcular total
    const detalles = watch("detalles");
    const calcularTotal = () => {
        if (!detalles) return 0;
        return detalles.reduce((sum, d) => {
            const cantidad = parseFloat(d.cantidad) || 0;
            const precio = parseFloat(d.precio) || 0;
            return sum + (cantidad * precio);
        }, 0);
    };

    // Actualizar precio cuando cambia el producto
    const handleProductoChange = (index, id_producto) => {
        const productoSeleccionado = productos.find(p => p.id_producto === parseInt(id_producto));
        if (productoSeleccionado && productoSeleccionado.precio_venta) {
            setValue(`detalles.${index}.precio`, productoSeleccionado.precio_venta);
        }
    };

    const onSubmit = async (data) => {
        // Agregar isPagado al data
        const ventaData = {
            ...data,
            isPagado: isPagado,
            total: calcularTotal()
        };

        try {
            let resp;
            
            if (isEditing) {
                // EDITAR
                resp = await onSubmitVenta({
                    id_venta: initialData.id_venta,
                    ...ventaData
                });
                
                if (resp?.ok !== false) {
                    toast.success("Venta actualizada", {
                        description: "Los cambios se guardaron correctamente",
                    });
                    onCreated();
                    onClose();
                } else {
                    throw new Error(resp.error || "Error al actualizar");
                }
            } else {
                // CREAR
                resp = await crearVenta(ventaData);

                if (resp.ok) {
                    toast.success("Venta registrada", {
                        description: "Stock actualizado correctamente",
                    });
                    onCreated(resp.venta);
                    onClose();
                } else {
                    const errorMsg = resp.error || "Ocurrió un error inesperado";

                    if (errorMsg.includes("Stock insuficiente")) {
                        toast.error("Stock insuficiente", {
                            description: errorMsg,
                            duration: 8000,
                        });
                    } else {
                        toast.error("Error al registrar la venta", {
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[95vh] flex flex-col">
                
                {/* Header */}
                <div className="relative bg-gradient-to-br from-green-600 via-emerald-700 to-green-700 px-8 py-6 ">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {isEditing ? "Editar Venta" : "Nueva Venta"}
                                </h2>
                                <p className="text-green-100 text-sm mt-1">
                                    Registra una venta de productos
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

                {/* Contenido scrolleable */}
                <div className="overflow-y-auto flex-1 px-8 py-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* Grid: Fecha + Cliente */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Fecha de venta */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                    Fecha de Venta
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    {...register("fecha")}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                                {errors.fecha && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.fecha.message}
                                    </p>
                                )}
                            </div>

                            {/* Cliente */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <User className="w-4 h-4 text-green-600" />
                                    Cliente
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("persona")}
                                    placeholder="Nombre del cliente"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                />
                                {errors.persona && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.persona.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Sección de Productos */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-green-600" />
                                    Productos
                                </h3>
                                <button
                                    type="button"
                                    onClick={agregarProducto}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md font-medium text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar Producto
                                </button>
                            </div>

                            {errors.detalles && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <span className="font-bold">•</span> {errors.detalles.message}
                                </p>
                            )}

                            {fields.length === 0 && (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                    <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">
                                        No hay productos. Haz clic en "Agregar Producto"
                                    </p>
                                </div>
                            )}

                            {/* Lista de productos */}
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:border-green-300 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-semibold text-gray-700">
                                                Producto #{index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Producto */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-600">
                                                    Producto
                                                </label>
                                                <select
                                                    {...register(`detalles.${index}.id_producto`)}
                                                    onChange={(e) => handleProductoChange(index, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                                                >
                                                    <option value="">Seleccionar</option>
                                                    {productos.map(p => (
                                                        <option key={p.id_producto} value={p.id_producto}>
                                                            {p.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.detalles?.[index]?.id_producto && (
                                                    <p className="text-red-500 text-xs">{errors.detalles[index].id_producto.message}</p>
                                                )}
                                            </div>

                                            {/* Cantidad */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-600">
                                                    Cantidad
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`detalles.${index}.cantidad`)}
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                                />
                                                {errors.detalles?.[index]?.cantidad && (
                                                    <p className="text-red-500 text-xs">{errors.detalles[index].cantidad.message}</p>
                                                )}
                                            </div>

                                            {/* Precio unitario */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-gray-600">
                                                    Precio Unit. ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...register(`detalles.${index}.precio`)}
                                                    placeholder="0.00"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                                />
                                                {errors.detalles?.[index]?.precio && (
                                                    <p className="text-red-500 text-xs">{errors.detalles[index].precio.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subtotal */}
                                        {detalles[index]?.cantidad && detalles[index]?.precio && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                                                <span className="text-sm text-gray-600">Subtotal: </span>
                                                <span className="text-lg font-bold text-green-600">
                                                    ${((parseFloat(detalles[index].cantidad) || 0) * (parseFloat(detalles[index].precio) || 0)).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total General */}
                        {fields.length > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gray-700">
                                        Total de la Venta
                                    </span>
                                    <span className="text-3xl font-bold text-green-600">
                                        ${calcularTotal().toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Campos opcionales */}
                        <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                            {/* Estado de Pago */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Estado de Pago
                                </label>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsPagado(true)}
                                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                                            isPagado
                                                ? 'bg-green-50 border-green-500 text-green-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Pagado
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsPagado(false)}
                                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                                            !isPagado
                                                ? 'bg-amber-50 border-amber-500 text-amber-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <Calendar className="w-5 h-5" />
                                        Pendiente
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-8 py-5 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <DollarSign className="w-4 h-4" />
                                {isEditing ? "Guardar Cambios" : "Registrar Venta"}
                            </button>
                        </div>
                    </form>
                </div>

                
            </div>
        </div>
    );
}