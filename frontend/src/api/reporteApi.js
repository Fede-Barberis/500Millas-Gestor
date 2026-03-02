import api from "../config/axios";

async function extractErrorMessage(error, fallback) {
    try {
        const data = error?.response?.data;
        if (data instanceof Blob) {
            const text = await data.text();
            if (!text) return fallback;

            try {
                const parsed = JSON.parse(text);
                return parsed?.error || parsed?.message || fallback;
            } catch {
                return text || fallback;
            }
        }

        return data?.error || data?.message || error?.message || fallback;
    } catch {
        return fallback;
    }
}

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

        if (!(res.data instanceof Blob)) {
            throw new Error("Respuesta invalida al descargar el reporte");
        }

        return res.data;
    } catch (error) {
        const msg = await extractErrorMessage(error, "Error al descargar reporte");
        throw new Error(msg);
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



