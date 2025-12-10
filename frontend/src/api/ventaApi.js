import api from "../config/axios";

export const getVentas = async () => {
    try {
        const res = await api.get("/ventas");
        return res.data;
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al devolver ventas'
        };
    }
};

export const crearVenta = async (payload) => {
    try {
        const response = await api.post('/ventas', payload);
        return {
            ok: true,
            venta: response.data.venta || response.data
        };
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al crear producción'
        };
    }
}; 

export const eliminarVenta = async (id_venta) => {
    try {
        const res = await api.delete(`/ventas/${id_venta}`);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.res.data.error || error.res.data.message || 'Error al eliminar venta'
        };
    }
}

export const editarVenta = async (id_venta, data) => {
    try {
        const res = await api.put(`/ventas/${id_venta}`, data);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response?.data?.error || error.response?.data?.message || 'Error al editar venta'
        };
    }
}