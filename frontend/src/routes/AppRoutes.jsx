import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx"
import AppLayout from "../layouts/AppLayout.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<Login />} />
                <Route path='/auth/register' element={<Register />} />
            </Route>
            
            <Route element={<AppLayout />}>
                <Route path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
            </Route>
            
            <Route path="*" element={<Navigate to="/auth/login" />} />
        </Routes>
        
    );
}
