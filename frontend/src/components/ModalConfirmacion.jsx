
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmeModal({ open, onClose, onConfirm, title, message }) {
    if(!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp">
                
                {/* Header con icono de advertencia */}
                <div className="relative p-6 pb-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-start gap-4">
                        {/* Icono de advertencia */}
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        
                        {/* Título y mensaje */}
                        <div className="flex-1 pt-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {title}
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="px-6 pb-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>Esta acción es permanente y no se puede recuperar la información eliminada.</span>
                        </p>
                    </div>
                </div>

                {/* Footer con botones */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-2"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Eliminar
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
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
