import api from "../config/axios";

export const getStats = async () => {
    const res = await api.get("/dashboard/stats");
    return res.data;
};


export const getDataChart = async () => {
    const res = await api.get("/dashboard/areaChart");
    return res.data;
};


export const getPieChart = async (mes, anio) => {
    const res = await api.get(`/dashboard/pieChart?month=${mes}&year=${anio}`);
    return res.data;
};


export const getAlertas = async () => {
    const res = await api.get("/dashboard/alerts");
    return res.data;
}


export const marcarAlertasLeidas = async (id) => {
    const res = await api.patch(`/dashboard/alerts/${id}`);
    return res.data;
}


export const getPedidos = async () => {
    const res = await api.get("/dashboard/pedidos");
    return res.data;
}

export const getDetallePedido = async (id) => {
    const res = await api.get(`/dashboard/pedidos/${id}`);
    return res.data;
}