import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import { compraMpSchema } from "../schemas/compraMpSchemas.js";
import { useState, useEffect } from "react";
import { crearCompraMp } from "../api/materiaPrimaApi.js";
import { Package, Calendar, DollarSign, Hash, CheckCircle, X } from "lucide-react";


export default function CompraMpForm({ materiaPrimas, onCreated, onClose, initialData, isEditing = false, onSubmitCompra }) {
    const [isPagado, setIsPagado] = useState(initialData?.isPagado ?? false);
    
    const { register, handleSubmit, reset, setValue, formState: { errors }} = useForm ({
        resolver: yupResolver(compraMpSchema),
        defaultValues: {
            fecha: "",
            id_materiaPrima: "",
            cantidad: "",
            precio: "",
            lote: "",
            vencimiento: "",
            estado: ""
        }
    })


    useEffect(() => {
        if (initialData) {
            reset({
                fecha: initialData.fecha,
                id_materiaPrima: initialData.id_materiaPrima,
                cantidad: initialData.cantidad,
                precio: initialData.precio,
                lote: initialData.lote,
                fch_vencimiento: initialData.fch_vencimiento,
                isPagado: initialData.isPagado
            });
        } else {
            reset({
                fecha: "",
                id_materiaPrima: "",
                cantidad: "",
                precio: "",
                lote: "",
                vencimiento: "",
                estado: ""
            });
        }
    }, [initialData, reset]);

    useEffect(() => {
        setValue("isPagado", isPagado);
    }, [isPagado]);


    const onSubmit = async (data) => {
        try {
            let resp;
            
            if (isEditing) {
                // EDITAR
                resp = await onSubmitCompra({
                    id_compra: initialData.id_compra,
                    ...data,
                    isPagado: isPagado
                }); 
                
                if (resp?.ok !== false) {
                    toast.success("Compra actualizada", {
                        description: "Los cambios se guardaron correctamente",
                    });
                    onCreated();
                    onClose();
                } else {
                    throw new Error(resp.error || "Error al actualizar");
                }
            } else {
                // CREAR
                resp = await crearCompraMp(data, isPagado);

                if (resp.ok) {
                    toast.success("Compra materia prima registrada")
                    onCreated(resp.compraMp);
                    onClose();
                } else {
                    const errorMsg = resp.error || "Ocurrió un error inesperado";
                    toast.error("Error al registrar la compra de materia prima", {
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-slideUp max-h-[95vh] flex flex-col">
                
                {/* Header con gradiente */}
                <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-3 sm:px-8 py-6 sm:pb-10 sm:overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {initialData ? "Editar Compra" : "Nueva Compra"}
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    Registra la compra de materia prima
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
                    <form onSubmit={handleSubmit(onSubmit)}  className="space-y-6">
                        
                        {/* Grid: Fecha + Materia Prima */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Fecha de compra */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Fecha de Compra
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    {...register("fecha")}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {errors.fecha && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.fecha.message}
                                    </p>
                                )}
                            </div>

                            {/* Materia Prima */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Package className="w-4 h-4 text-blue-600" />
                                    Materia Prima
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("id_materiaPrima")}
                                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="">Selecciona una materia prima</option>
                                    {materiaPrimas.map(mp => (
                                        <option key={mp.id_materiaPrima} value={mp.id_materiaPrima} >
                                            {mp.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_materiaPrima && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.id_materiaPrima.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Grid: Cantidad + Precio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Cantidad */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Package className="w-4 h-4 text-blue-600" />
                                    Cantidad
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        {...register("cantidad")}
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 pr-16 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                {errors.cantidad && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.cantidad.message}
                                    </p>
                                )}
                            </div>

                            {/* Precio */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <DollarSign className="w-4 h-4 text-blue-600" />
                                    Precio Unitario
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        {...register("precio")}
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full pl-10 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                {errors.precio && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.precio.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Grid: Lote + Vencimiento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Lote */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Hash className="w-4 h-4 text-blue-600" />
                                    Lote
                                </label>
                                <input
                                    type="text"
                                    {...register("lote")}
                                    placeholder="Ej: L-2024-001"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                />
                                <p className="text-xs text-gray-500">
                                    Opcional: Número de lote del proveedor
                                </p>
                            </div>

                            {/* Fecha de Vencimiento */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Fecha de Vencimiento
                                </label>
                                <input
                                    type="date"
                                    {...register("fch_vencimiento")}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500">
                                    Opcional: Si aplica a la materia prima
                                </p>
                                {errors.fch_vencimiento && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <span className="font-bold">•</span> {errors.fch_vencimiento.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Estado de Pago */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                Estado de Pago
                            </label>
                            
                            <input type="hidden" {...register("isPagado")} />

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Botón Pagado */}
                                <button
                                    type="button"
                                    onClick={() => {setIsPagado(true)}}
                                    className={`flex-1 px-3 py-2 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                                        isPagado
                                            ? 'bg-green-50 border-green-500 text-green-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Pagado
                                </button>

                                {/* Botón Pendiente */}
                                <button
                                    type="button"
                                    onClick={() => {setIsPagado(false);}}
                                    className={`flex-1 px-3 py-2 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                                        !isPagado
                                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <Calendar className="w-5 h-5" />
                                    Pendiente
                                </button>
                            </div>

                            {!isPagado && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 animate-slideDown">
                                    <span className="text-amber-600 text-lg">⚠️</span>
                                    <p className="text-xs text-amber-700">
                                        Recuerda registrar el pago cuando se complete para mantener las cuentas al día.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-lg">💡</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-1 text-sm">
                                        Actualización automática de stock
                                    </h4>
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        Al registrar esta compra, el stock de la materia prima se incrementará automáticamente con la cantidad especificada.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer con botones */}
                        <div className="border-t border-gray-200 px-2 sm:px-8 py-5 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <Package className="w-4 h-4" />
                                {initialData ? "Guardar Cambios" : "Registrar Compra"}
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

                @keyframes slideDown {
                    from {
                        transform: translateY(-10px);
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

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

