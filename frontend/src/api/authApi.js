// src/api/authApi.js
import api from "../config/axios";

export const registerUser = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
};

export const loginUser = async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
};
