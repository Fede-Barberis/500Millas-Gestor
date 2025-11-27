import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) return null; 

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    return children;
}

