import { Outlet, useLocation } from "react-router-dom"
import { Toaster } from "sonner"

export default function AuthLayout() {
    const location = useLocation();

    const isLogin = location.pathname.includes("login");

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

            <Toaster 
                position="bottom-right"
                toastOptions={{
                    unstyled: false,
                    classNames: {
                        success: '!bg-green-50 !border-l-4 !border-green-500',
                        error: '!bg-red-100 !border-l-4 !border-red-600 ',
                        title: '!text-base !font-semibold', 
                        description: '!text-sm', 
                    },
                    style: {
                        zIndex: 9999,
                    }
                }}
            />

        </>
    )
}

