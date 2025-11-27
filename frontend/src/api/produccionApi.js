import api from "../config/axios";

export const getProduccion = async () => {
    try {
        const res = await api.get("/produccion/produccion");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al devolver producccion'
        };
    }
};

export const getRecetas = async () => {
    try {
        const res = await api.get("/produccion/recetas");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al devolver recetas'
        };
    }
};

export const getProductos = async () => {
    try {
        const res = await api.get("/produccion/productos");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al devolver productos'
        };
    }
};

export const crearProduccion = async (payload) => {
    try {
        const response = await api.post('/produccion/produccion', payload);
        return {
            ok: true,
            produccion: response.data.produccion || response.data
        };
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al crear producción'
        };
    }
}; 

export const eliminarProduccion = async (id_produccion) => {
    try {
        const res = await api.delete(`/produccion/produccion/${id_produccion}`);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.res.data.error || error.res.data.message || 'Error al devolver productos'
        };
    }
}

export const editarProduccion = async (id_produccion, data) => {
    try {
        const res = await api.put(`/produccion/produccion/${id_produccion}`, data);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response?.data?.error || error.response?.data?.message || 'Error al devolver productos'
        };
    }
}