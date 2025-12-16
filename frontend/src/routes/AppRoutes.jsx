import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { PrivateRoute } from "../components/PrivateRoute.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx"
import AppLayout from "../layouts/AppLayout.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Produccion from "../pages/Produccion.jsx";
import Productos from "../pages/Productos.jsx";
import MateriaPrima from "../pages/MateriaPrima.jsx";
import Ventas from "../pages/Ventas.jsx";
import Pedidos from "../pages/Pedidos.jsx"

export default function AppRouter() {
    return (
        <>
        <Toaster 
            position="bottom-right"
            toastOptions={{
                unstyled: false,
                classNames: {
                    success: '!bg-green-50 !border-l-4 !border-green-500',
                    error: '!bg-red-100 !border-l-4 !border-red-600 ',
                    title: '!text-base !font-semibold', 
                    description: '!text-sm', 
                },
                style: {
                    zIndex: 9999,
                }
            }}
        />
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<Login />} />
                <Route path='/auth/register' element={<Register />} />
            </Route>
            
            <Route element={
                <PrivateRoute>
                    <AppLayout />
                </PrivateRoute>
            }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/produccion" element={<Produccion />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/materiaPrima" element={<MateriaPrima />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/pedidos" element={<Pedidos />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/auth/login" />} />
        </Routes>
        </>
    );
}
