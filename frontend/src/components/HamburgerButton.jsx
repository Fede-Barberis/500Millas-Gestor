// components/HamburgerButton.jsx
import { Menu } from "lucide-react";

export default function HamburgerButton({ isOpen, toggleSidebar }) {
    return (
        <button
            onClick={toggleSidebar}
            className="fixed top-4 left-64 z-50 md:hidden bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
        >
            <Menu size={24} className="text-black" />
        </button>
    );
}