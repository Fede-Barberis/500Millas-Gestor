import { useState, useEffect } from "react";
import { getProduccion, getRecetas, getProductos, crearProduccion, eliminarProduccion, editarProduccion } from "../api/produccionApi";


export function useProduccionData() {
    const [producciones, setProducciones] = useState([]);
    const [recetas, setRecetas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const [produccionData, recetasData, productosData] = await Promise.all([
                getProduccion(),
                getRecetas(),
                getProductos()
            ]) 
            
            setProducciones(produccionData || []);
            setRecetas(recetasData);
            setProductos(productosData);
        } catch (error) {
            setError("Error al cargar los datos de producción");
        } finally {
            setLoading(false);
        }
    }
    
    const agregarProduccion = async (data) => {
        try {
            const resp = await crearProduccion(data);
            if (resp.ok) {
                await fetchData(); // recarga la tabla automáticamente
                return { ok: true };
            } else {
                return { ok: false, error: resp.error };
            }
        } catch (err) {
            return { ok: false, error: err.message };
        }
    };
    
    const deleteProduccion = async (id) => {
        try {
            const resp = await eliminarProduccion(id);
            if (resp.ok) {
                await fetchData(); // recarga la tabla automáticamente
                return { ok: true };
            } else {
                return { ok: false, error: resp.error };
            }
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    const modificarProduccion = async (data) => {
        try {
            const resp = await editarProduccion(data.id_produccion, data);
            if (resp.ok) {
                await fetchData();
                return { ok: true };
            } else {
                return { ok: false, error: resp.error };
            }
        } catch (err) {
            console.error(err);
            return { ok: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    return { producciones, recetas, productos , loading, error, agregarProduccion, deleteProduccion, modificarProduccion, reload: fetchData };
}

export default useProduccionData;