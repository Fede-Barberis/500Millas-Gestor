import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx"
import Login from "../pages/Login.jsx";
import Register from "../pages/Register";
// import Dashboard from "../pages/Dashboard";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route path="/auth/login" element={<Login />} />
                    <Route path='/auth/register' element={<Register />} />
                </Route>
                
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                <Route path="*" element={<Navigate to="/auth/login" />} />
            </Routes>
        </Router>
    );
}
