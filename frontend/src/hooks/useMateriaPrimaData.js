import { useState, useEffect } from "react";
import { getMateriaPrima, getComprasMp, crearCompraMp, editarCompraMp, eliminarCompraMp } from "../api/materiaPrimaApi" 

export function useMateriaPrimaData() {
    const [materiaPrimas, setMateriaPrima] = useState([])
    const [comprasMp, setCompraMp] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)  

    const fetchData = async () => {
        try {
            setLoading(true)
            const [mpData, compraData] = await Promise.all([
                getMateriaPrima(),
                getComprasMp()
            ]) 
            setMateriaPrima(mpData || [])
            setCompraMp(compraData || [])
        } catch (error) {
            setError("Error al cargar materia primas")
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData()
    }, []);

    const agregarCompraMp = async (data) => {
        try {
            const resp = await crearCompraMp(data);
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

    const modificarCompraMp = async (compra) => {
        try {
            const resp = await editarCompraMp(compra.id_compra, compra); 

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

    const deleteCompraMp = async (id_compra) => {
        try {
            const resp = await eliminarCompraMp(id_compra);
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
        materiaPrimas,
        comprasMp,
        loading,
        error,
        reload: fetchData,
        agregarCompraMp,
        modificarCompraMp,
        deleteCompraMp
    };

}

export default useMateriaPrimaData;