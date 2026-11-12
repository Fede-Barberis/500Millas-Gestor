import api from "../config/axios";

export const getMovimientosStock = async (filtros = {}) => {
    const res = await api.get("/movimientos-stock", { params: filtros });
    return res.data;
};
