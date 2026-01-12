import { useEffect, useState, useCallback } from "react";
import { obtenerReportes } from "../api/reporteApi";

export const useReportes = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarReportes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await obtenerReportes();
            setReportes(data);
        } catch (err) {
            setError(err);
            console.error("Error cargando reportes", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarReportes();
    }, [cargarReportes]);

    return {
        reportes,
        loading,
        error,
        refetch: cargarReportes
    };
};
