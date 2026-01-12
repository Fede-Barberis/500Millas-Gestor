import api from "../config/axios";

export const obtenerReportes = async () => {
    try {
        const res = await api.get("/reportes");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al cargar reportes'
        };
    }
};

export const descargarReporte = async (id) => {
    try {
        const res = await api.get(`/reportes/${id}`, {
            responseType: 'blob',
        });

        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al cargar reportes'
        };
    }
};

export const cerrarMes = async () => {
    try {
        const res = await api.post("/reportes/cerrar-mes");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al cargar reportes'
        };
    }
};



