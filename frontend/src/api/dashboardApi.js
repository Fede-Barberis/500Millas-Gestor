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