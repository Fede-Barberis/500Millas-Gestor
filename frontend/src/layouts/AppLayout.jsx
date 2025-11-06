import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

export default function AppLayout() {
    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 md:ml-20 overflow-y-auto bg-primary p-5">
                <Outlet />
            </main>
        </div>
    );
}
