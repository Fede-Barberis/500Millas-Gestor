import { Outlet, useLocation } from "react-router-dom"
import { Toaster } from "sonner"

export default function AuthLayout() {
    const location = useLocation();

    const isLogin = location.pathname.includes("login");
    const isRegister = location.pathname.includes("register");

    const backgroundStyle = {
        backgroundImage: isLogin
        ? "url(/assets/img/fondoLogin.svg)"
        : "url(/assets/img/fondoRegister.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
    };

    return (
        <>
            <div className="bg-cover bg-center"
            style={backgroundStyle}>
                <div className="max-w-lg mx-auto px-5">
                    <div>
                        <Outlet />
                    </div>
                </div>
            </div>

            <Toaster position="bottom-right"/>

        </>
    )
}