import React from 'react';
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

    // Demo de uso
    const Demo = () => {
    const [state, setState] = React.useState('normal');
    const [data, setData] = React.useState(null);

    const simulateLoading = () => {
        setState('loading');
        setTimeout(() => {
        setState('normal');
        setData('Datos cargados exitosamente');
        }, 2000);
    };

    const simulateError = () => {
        setState('error');
    };

    const handleRetry = () => {
        setState('normal');
        setData(null);
    };

    if (state === 'loading') return <Loading message="Cargando datos..." />;
    if (state === 'error') return <ErrorMessage error="No se pudieron cargar los datos del servidor" onRetry={handleRetry} />;

    return (
        <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Componentes de Loading y Error</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Demostración</h2>
            <div className="flex gap-3 mb-6">
            <button
                onClick={simulateLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
                Simular Loading
            </button>
            <button
                onClick={simulateError}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Simular Error
            </button>
            </div>
            
            {data && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{data}</p>
            </div>
            )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">Uso en tu código:</h2>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
    {`import { Loading, ErrorMessage } from './components';

    function MiComponente() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return <div>Contenido normal</div>;
    }`}
            </pre>
        </div>
        </div>
    );
};

export default Demo;