import { AlertTriangle } from "lucide-react";
import huevos from "/assets/img/huevo.webp"
import harina from "/assets/img/harina.webp"
import azucar from "/assets/img/azucar.webp"
import grasa from "/assets/img/grasa.webp"
import sal from "/assets/img/sal.webp"
import dulceDeLeche from "/assets/img/dulce.webp"
import defaultImg from "/assets/img/default.webp";


export default function MateriaPrimaCard({ materiaPrima }) {
    const stockActual = Number(materiaPrima.stock);
    const stockMinimo = Number(materiaPrima.stock_minimo);

    // Imágenes según tipo de materia prima
    const imagenesMateriaPrima = {
        harina,
        huevo: huevos,
        grasa,
        "dulce de leche": dulceDeLeche,
        sal,
        azucar,
    };

    // Obtener imagen basado en el nombre 
    const getImagen = (nombre) => { 
        const nombreLower = nombre.toLowerCase(); 
        const key = Object.keys(imagenesMateriaPrima).find(k => nombreLower.includes(k) ); 
        return imagenesMateriaPrima[key] || imagenesMateriaPrima.default; 
    }; 
    
    const imagen = getImagen(materiaPrima.nombre);

    // Determinar color según stock
    const getStockStatus = (stock, minimo) => {
        stock = Number(stock);
        minimo = Number(minimo);
        
        if (stock <= minimo) { // Crítico: <= stock_minimo
            return {
                color: "border-red-500 bg-red-100",
                textColor: "text-red-700",
                badgeColor: "bg-red-500",
                icon: "🔴",
                label: "Crítico"
            };
        }
        if (stock <= minimo * 2) { // Medio: entre stock_minimo y stock_minimo * 2
            return {
                color: "border-yellow-500 bg-yellow-100",
                textColor: "text-yellow-700",
                badgeColor: "bg-yellow-500",
                icon: "🟡",
                label: "Medio"
            };
        }
        // Óptimo: > stock_minimo * 2
        return {
            color: "border-green-500 bg-green-100",
            textColor: "text-green-700",
            badgeColor: "bg-green-500",
            icon: "🟢",
            label: "Óptimo"
        };
    };
    const status = getStockStatus(stockActual, stockMinimo);

    return (
        <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-l-4 ${status.color.replace('bg-', 'border-')} shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group`}>
            
            <div className="p-4">
                
                {/* Contenedor principal - columna en móvil, fila en desktop */}
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-3">
                    
                    {/* SECCIÓN 1: Imagen + Nombre (fila siempre) */}
                    <div className="flex items-center gap-3 sm:flex-1 sm:min-w-0">
                        {/* Imagen */}
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden border border-gray-200">
                            <img 
                                src={imagen} 
                                alt={materiaPrima.nombre}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Nombre + Badge "Bajo" */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap sm:mb-2">
                                <h3 className="text-2xl sm:text-lg md:text-2xl lg:text-lg font-bold text-gray-800 capitalize sm:truncate">
                                    {materiaPrima.nombre}
                                </h3>
                                {/* {stockActual <= stockMinimo && (
                                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0">
                                        <AlertTriangle className="w-3 h-3" />
                                        Bajo
                                    </span>
                                )} */}
                            </div>
                            
                            {/* Stock mínimo */}
                            {stockMinimo && (
                                <p className="text-xs text-gray-500">
                                    Mínimo: <span className="font-semibold">{stockMinimo} {materiaPrima.unidad_medida || "kg"}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 2: Stock + Badge estado */}
                    <div className="flex sm:flex-col md:flex-row lg:flex-col items-center justify-between lg:justify-center sm:text-right sm:flex-shrink-0">
                        <div className="flex items-baseline gap-1 sm:flex-col sm:items-end">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                                    {materiaPrima.nombre === 'HUEVOS' ? parseInt(stockActual) : parseFloat(stockActual).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 font-medium">
                                    {materiaPrima.unidad_base }
                                </span>
                            </div>
                        </div>
                        
                        {/* Badge de estado */}
                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${status.color} sm:mt-1`}>
                            <span>{status.icon}</span>
                            <span className={status.textColor}>
                                {status.label}
                            </span>
                        </div>
                    </div>


                    {/* <div className="flex flex-row sm:flex-col md:flex-row lg:flex-col gap-2 pt-3">
                        <button
                            onClick={() => onEdit(materiaPrima)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(materiaPrima.id_materiaPrima)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium text-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
