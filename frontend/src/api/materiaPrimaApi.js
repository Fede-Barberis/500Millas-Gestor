import api from "../config/axios";

export const getMateriaPrima = async () => {
    try {
        const res = await api.get("/materiaPrima");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response?.data?.message || 'Error al devolver materia primas'
        };
    }
};

export const getComprasMp = async () => {
    try {
        const res = await api.get("/materiaPrima/compraMp");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response?.data?.message || 'Error al devolver compras de materia prima'
        };
    }
};

export const crearCompraMp = async (payload) => {
    try {
        const response = await api.post('/materiaPrima/compraMp', payload);
        return {
            ok: true,
            compraMp: response.data.compraMp || response.data
        };
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response?.data?.message || 'Error al crear compraMp'
        };
    }
}; 

export const eliminarCompraMp = async (id_compra) => {
    try {
        const res = await api.delete(`/materiaPrima/compraMp/${id_compra}`);
        return res.data 
    } catch (error) {
        return {
            ok: false,
            error: error.response?.data?.error || error.response?.data?.message || 'Error al eliminar compraMp'
        };
    }
}

export const editarCompraMp = async (id_compra, data) => {
    try {
        const res = await api.put(`/materiaPrima/compraMp/${id_compra}`, data);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response?.data?.error || error.response?.data?.message || 'Error al editar compraMp'
        };
    }
}

