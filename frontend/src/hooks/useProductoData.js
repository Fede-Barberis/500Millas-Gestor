import { useState, useEffect } from "react";
import { getProductos, crearProducto, editarProducto, eliminarProducto, obtenerMovimientosProducto } from "../api/productoApi" 

export function useProductoData() {
    const [productos, setProductos] = useState([])
    const [movimientos, setMovimientos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const productosData = await getProductos()

            // Obtener movimientos para cada producto
            const movimientosData = {}
            await Promise.all(
                productosData.map(async (p) => {
                    const mov = await obtenerMovimientosProducto(p.id_producto)
                    movimientosData[p.id_producto] = mov
                })
            ) 

            setProductos(productosData)
            setMovimientos(movimientosData)
        } catch (error) {
            setError("Error al cargar los productos")
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData()
    }, []);

    const agregarProducto = async (data) => {
        try {
            const resp = await crearProducto(data);
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

    const modificarProducto = async (producto) => {
        try {
            const resp = await editarProducto(producto.id_producto, producto); 

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

    const deleteProducto = async (id_producto) => {
        try {
            const resp = await eliminarProducto(id_producto);
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
        productos, 
        loading, 
        error, 
        agregarProducto, 
        modificarProducto, 
        deleteProducto,
        movimientos,
        reload: fetchData 
    };

}