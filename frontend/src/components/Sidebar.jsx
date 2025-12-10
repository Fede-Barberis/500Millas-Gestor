import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Package, UserRound, Wheat, LogOut, Handshake, CalendarCheck2, CirclePlus } from "lucide-react"; 
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen }) {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false);
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                fixed top-0 left-0 h-full 
                flex flex-col justify-between
                
                bg-white
                text-black shadow-lg
                transition-all duration-300 linear z-40 
                ${isHovered ? "w-56" : "w-20"} 
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0
            `}
        >
            {/* 🔝 Sección superior - enlaces */}
            <div className={`flex flex-col mt-6 space-y-8 px-4 transition-all duration-300`}>
                <div className={`${isHovered ? "flex flex-row justify-center gap-1 border-b border-black" : "inline"}`}>
                    <span className="text-2xl text-center font-heading text-black font-bold">500</span> 
                    <h1 className={`${isHovered ? "text-2xl font-semibold" : "text-xl"} font-heading text-yellow-500`}> Millas</h1>
                </div>


                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex w-full gap-3 p-2 rounded-md transition-colors duration-300 
                        ${isHovered ? "justify-start" : "justify-center"} 
                        ${isActive ? "bg-sidebar font-semibold" : "hover:bg-sidebar hover:bg-opacity-60"}`
                    }
                >
                    <Home size={20} />
                    {isHovered && <span className={`
                    whitespace-nowrap overflow-hidden transition-all duration-100
                    ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
                    `}>Inicio</span>}
                </NavLink>


                <NavLink
                    to="/productos"
                    className={({ isActive }) =>
                        `flex w-full gap-3 p-2 rounded-md transition-colors duration-300 
                        ${isHovered ? "justify-start" : "justify-center"} 
                        ${isActive ? "bg-sidebar font-semibold" : "hover:bg-sidebar hover:bg-opacity-60"}`
                    }
                >
                    <Package size={20} strokeWidth={1.5} />
                    {isHovered && <span className={`
                    whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
                    `}>Productos</span>}
                </NavLink>
                

                <NavLink
                    to="/produccion"
                    className={({ isActive }) =>
                        `flex w-full gap-3 p-2 rounded-md transition-colors duration-300 
                        ${isHovered ? "justify-start" : "justify-center"} 
                        ${isActive ? "bg-sidebar font-semibold" : "hover:bg-sidebar hover:bg-opacity-60"}`
                    }
                >
                    <CirclePlus size={20} strokeWidth={1.5} />
                    {isHovered && <span className={`
                    whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
                    `}>Produccion</span>}
                </NavLink>


                <NavLink
                    to="/materiaPrima"
                    className={({ isActive }) =>
                        `flex w-full gap-3 p-2 rounded-md transition-colors duration-300 
                        ${isHovered ? "justify-start" : "justify-center"} 
                        ${isActive ? "bg-sidebar font-semibold" : "hover:bg-sidebar hover:bg-opacity-60"}`
                    }
                >
                    <Wheat size={20} strokeWidth={1.5} />
                    {isHovered && <span className={`
                    whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
                    `}>Materias Primas</span>}
                </NavLink>


                <NavLink
                    to="/ventas"
                    className={({ isActive }) =>
                        `flex w-full gap-3 p-2 rounded-md transition-colors duration-300 
                        ${isHovered ? "justify-start" : "justify-center"} 
                        ${isActive ? "bg-sidebar font-semibold" : "hover:bg-sidebar hover:bg-opacity-60"}`
                    }
                >
                    <Handshake size={20} strokeWidth={1.5} />
                    {isHovered && <span className={`
                    whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
                    `}>Ventas</span>}
                </NavLink>


                <NavLink
                    to="/pedidos"
                    className={({ isActive }) =>
                        `flex w-full gap-3 p-2 rounded-md transition-colors duration-300 
                        ${isHovered ? "justify-start" : "justify-center"} 
                        ${isActive ? "bg-sidebar font-semibold" : "hover:bg-sidebar hover:bg-opacity-60"}`
                    }
                >
                    <CalendarCheck2 size={20} strokeWidth={1.5} />
                    {isHovered && <span className={`
                    whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
                    `}>Pedidos</span>}
                </NavLink>


                <NavLink
                    to="/personal"
                    className={({ isActive }) =>
                        `flex w-full gap-3 p-2 rounded-md transition-colors duration-300 
                        ${isHovered ? "justify-start" : "justify-center"} 
                        ${isActive ? "bg-sidebar font-semibold" : "hover:bg-sidebar hover:bg-opacity-60"}`
                    }
                >
                    <UserRound size={20} />
                    {isHovered && <span className={`
                    whitespace-nowrap overflow-hidden transition-all duration-300
                    ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
                    `}>Personal</span>}
                </NavLink>
            </div>

            {/* 🔚 Logout fijo al fondo */}
            <div className="mb-6 flex items-center px-4">
                <button
                onClick={handleLogout}
                className={`flex ${isHovered ? "justify-start" : "justify-center"} w-full gap-3 p-2 rounded-md hover:bg-danger hover:bg-opacity-50 transition`}
                >
                <LogOut size={20} />
                {isHovered && <span className={`
                whitespace-nowrap overflow-hidden transition-all duration-300
                ${isHovered ? "opacity-100 ml-2" : "opacity-0 w-0"}
            `}>Salir</span>}
                </button>
            </div>
        </aside>
    );
}