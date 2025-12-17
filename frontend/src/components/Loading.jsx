
import { Loader2, AlertCircle } from 'lucide-react';

// Componente de Loading
export const Loading = ({ message = "Cargando...", size = "default" }) => {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-8 h-8",
        large: "w-12 h-12"
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
        <p className="text-gray-600 text-sm">{message}</p>
        </div>
    );
};


// Componente de Error
export const ErrorMessage = ({ error, onRetry }) => {
    const errorText = typeof error === 'string' ? error : error?.message || 'Ha ocurrido un error';
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                <p className="text-red-700 text-sm">{errorText}</p>
                {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                    Reintentar
                </button>
                )}
            </div>
            </div>
        </div>
        </div>
    );
};
