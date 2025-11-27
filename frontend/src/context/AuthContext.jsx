/* 
El AuthContext es una forma de almacenar y compartir el estado del usuario autenticado (quién está logueado, su token, etc.)         en toda la aplicación sin tener que pasar props manualmente por cada componente.
*/

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restaurar token
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));

        setLoading(false); 
    }, []);

    const login = (userData, tok) => {
        setUser(userData);
        setToken(tok);

        localStorage.setItem("token", tok);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

