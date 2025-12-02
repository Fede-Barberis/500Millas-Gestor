import api from "../config/axios";

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

export const crearProducto = async (payload) => {
    try {
        const response = await api.post('/producto', payload);
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

export const eliminarProducto = async (id_producto) => {
    try {
        const res = await api.delete(`/producto/producto/${id_producto}`);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.res.data.error || error.res.data.message || 'Error al eliminar producto'
        };
    }
}

export const editarProducto = async (id_producto, data) => {
    try {
        const res = await api.put(`/producto/producto/${id_producto}`, data);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response?.data?.error || error.response?.data?.message || 'Error al editar producto'
        };
    }
}


export const obtenerMovimientosProducto = async (id_producto) => {
    try {
        const res = await api.get(`/producto/${id_producto}/movimientos`);
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response?.data?.error || error.response?.data?.message || 'Error al devolver moviminetos productos'
        };
    }
}