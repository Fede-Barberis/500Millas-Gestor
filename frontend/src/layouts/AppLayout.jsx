import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import HamburgerButton from "../components/HamburgerButton";

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Botón hamburguesa (solo visible en mobile) */}
            <HamburgerButton isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Contenido principal */}
            <main className="flex-1 overflow-y-auto md:ml-20 bg-gray-50">
                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}