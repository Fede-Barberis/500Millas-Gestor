import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Package, Wheat, LogOut, Handshake, CalendarCheck2, CirclePlus, X, ChartNoAxesCombined } from "lucide-react"; 
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, toggleSidebar }) {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false);
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    return (
        <>
            {/* Overlay oscuro para mobile */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
                />
            )}

            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    fixed top-0 left-0 h-full 
                    flex flex-col justify-between
                    bg-white text-black shadow-2xl
                    transition-all duration-300 ease-in-out z-40
                    
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    w-64
                    
                    md:translate-x-0
                    md:${isHovered ? "w-64" : "w-20"}
                `}
            >
                {/* Botón cerrar (solo mobile cuando está abierto) */}
                {/* {isOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                )} */}

                {/* 🔝 Header del sidebar */}
                <div className="mt-6 px-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 justify-center">
                        <span className="text-2xl font-heading text-black font-bold">500</span>
                        <h1 className={`
                            text-2xl font-heading text-yellow-500 font-semibold
                            transition-all duration-300
                            ${isHovered ? "md:opacity-100 md:w-auto" : "md:opacity-0 md:w-0 md:overflow-hidden"}
                        `}>
                            Millas
                        </h1>
                    </div>
                </div>

                {/* 🔝 Sección de navegación */}
                <nav className="flex-1 flex flex-col gap-5 mt-6 px-3 overflow-y-auto">
                    <NavLink
                        to="/dashboard"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            ${isActive 
                                ? "bg-yellow-100 text-yellow-700 font-semibold shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100"
                            }
                            ${isHovered ? "md:justify-start" : "md:justify-center"}`
                        }
                    >
                        <Home size={22} className="flex-shrink-0" />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Inicio
                        </span>
                    </NavLink>

                    <NavLink
                        to="/productos"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            ${isActive 
                                ? "bg-yellow-100 text-yellow-700 font-semibold shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100"
                            }
                            ${isHovered ? "md:justify-start" : "md:justify-center"}`
                        }
                    >
                        <Package size={22} className="flex-shrink-0" strokeWidth={1.5} />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Productos
                        </span>
                    </NavLink>

                    <NavLink
                        to="/produccion"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            ${isActive 
                                ? "bg-yellow-100 text-yellow-700 font-semibold shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100"
                            }
                            ${isHovered ? "md:justify-start" : "md:justify-center"}`
                        }
                    >
                        <CirclePlus size={22} className="flex-shrink-0" strokeWidth={1.5} />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Producción
                        </span>
                    </NavLink>

                    <NavLink
                        to="/materiaPrima"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            ${isActive 
                                ? "bg-yellow-100 text-yellow-700 font-semibold shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100"
                            }
                            ${isHovered ? "md:justify-start" : "md:justify-center"}`
                        }
                    >
                        <Wheat size={22} className="flex-shrink-0" strokeWidth={1.5} />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Materias Primas
                        </span>
                    </NavLink>

                    <NavLink
                        to="/ventas"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            ${isActive 
                                ? "bg-yellow-100 text-yellow-700 font-semibold shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100"
                            }
                            ${isHovered ? "md:justify-start" : "md:justify-center"}`
                        }
                    >
                        <Handshake size={22} className="flex-shrink-0" strokeWidth={1.5} />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Ventas
                        </span>
                    </NavLink>

                    <NavLink
                        to="/pedidos"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            ${isActive 
                                ? "bg-yellow-100 text-yellow-700 font-semibold shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100"
                            }
                            ${isHovered ? "md:justify-start" : "md:justify-center"}`
                        }
                    >
                        <CalendarCheck2 size={22} className="flex-shrink-0" strokeWidth={1.5} />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Pedidos
                        </span>
                    </NavLink>

                    <NavLink
                        to="/reportes"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                            ${isActive 
                                ? "bg-yellow-100 text-yellow-700 font-semibold shadow-sm" 
                                : "text-gray-700 hover:bg-gray-100"
                            }
                            ${isHovered ? "md:justify-start" : "md:justify-center"}`
                        }
                    >
                        <ChartNoAxesCombined size={22} className="flex-shrink-0" strokeWidth={1.5} />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Reportes
                        </span>
                    </NavLink>

                </nav>
                

                {/* 🔚 Logout al fondo */}
                <div className="p-3 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 p-3 rounded-lg w-full
                            text-red-600 hover:bg-red-50 transition-all duration-200
                            ${isHovered ? "md:justify-start" : "md:justify-center"}
                        `}
                    >
                        <LogOut size={22} className="flex-shrink-0" />
                        <span className={`
                            whitespace-nowrap transition-all duration-200
                            ${isHovered ? "md:opacity-100 md:block" : "md:opacity-0 md:hidden"}
                        `}>
                            Salir
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}