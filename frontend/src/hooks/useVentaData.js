import { useState, useEffect } from "react";
import { getVentas, crearVenta, editarVenta, eliminarVenta } from "../api/ventaApi.js" 
import { getProductos } from "../api/productoApi.js";

export function useVentaData() {
    const [ventas, setVentas] = useState([])
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)  

    const fetchData = async () => {
        try {
            setLoading(true)
            const [ventaData, productoData] = await Promise.all([
                getVentas(),
                getProductos()
            ])

            setVentas(ventaData || [])
            setProductos(productoData || [])
            console.log(ventas);
            
        } catch (error) {
            setError("Error al cargar ventas")
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData()
    }, []);

    const agregarVenta = async (data) => {
        try {
            const resp = await crearVenta(data);
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

    const modificarVenta = async (venta) => {
        try {
            const resp = await editarVenta(venta.id_venta, venta); 

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

    const deleteVenta = async (id_venta) => {
        try {
            const resp = await eliminarVenta(id_venta);
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
        ventas,
        productos,
        loading,
        error,
        reload: fetchData,
        agregarVenta,
        modificarVenta,
        deleteVenta
    };

}

export default useVentaData;