import api from "../config/axios"

export const getPedidos = async () => {
    try {
        const res = await api.get("/pedidos")
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al devolver pedidos'
        };
    }
}


export const crearPedido = async (data) => {
    try {
        const res = await api.post("/pedidos", data)
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al crear pedido'
        };
    }
}

export const eliminarPedido = async (id_pedido) => {
    try {
        const res = await api.delete(`/pedidos/${id_pedido}`)
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al editar pedido'
        };
    }
}


export const editarPedido = async (id_pedido, data) => {
    try {
        const res = await api.put(`/pedidos/${id_pedido}`, data)
        return res.data
    } catch (error) {
        return {
            ok: false,
            error: error.response.data.error || error.response.data.message || 'Error al editar pedido'
        };
    }
}