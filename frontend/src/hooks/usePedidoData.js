import { useState, useEffect } from "react";
import { getPedidos, crearPedido, editarPedido, eliminarPedido } from "../api/pedidoApi" 

export function usePedidosData() {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)  

    const fetchData = async () => {
        try {
            setLoading(true)
            const pedidos = await getPedidos()
            setPedidos(pedidos)

        } catch (error){
            setError("Error al cargar pedidos")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    const agregarPedido = async (data) => {
        try {
            const resp = await crearPedido(data);
            if (resp.ok) {
                await fetchData();
                return { ok: true };
            } else {
                return { ok: false, error: resp.error };
            }
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    const modificarPedido = async (pedido) => {
        try {
            const resp = await editarPedido(pedido.id_pedido, pedido); 

            if (resp.ok) {
                await fetchData();
                return { ok: true };
            } else {
                return { ok: false, error: resp.error };
            }
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    const deletePedido = async (id_pedido) => {
        try {
            const resp = await eliminarPedido(id_pedido);
            if (resp.ok) {
                await fetchData();
                return { ok: true };
            } else {
                return { ok: false, error: resp.error };
            }
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };

    return { 
        pedidos,
        loading,
        error,
        reload: fetchData,
        agregarPedido,
        modificarPedido,
        deletePedido
    };
}

export default usePedidosData;