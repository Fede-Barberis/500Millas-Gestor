import { Mail, Lock, ArrowRight, Eye, EyeOff, User2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { loginUser } from "../api/authApi";
import { loginSchema } from "../schemas/authSchemas";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        email: "",
        password: ""
    };

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        try {
            const res = await loginUser(data);
            console.log(res);
            login(res.user, res.token);
            toast.success("Inicio de sesión exitoso!");
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            toast.error("Credenciales inválidas");
        }
    };

    return (
        <div className="flex flex-col justify-start pt-12 sm:justify-center items-center min-h-screen p-4">
            <div className="w-full max-w-md">
                
                {/* Logo/Brand */}
                <div className="text-center mb-8 animate-fadeIn">
                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg-h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-bounce-slow">
                        <span className="text-xl"><User2 /></span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Bienvenido</h1>
                    <p className="text-white/70 text-sm">Ingresa a tu cuenta para continuar</p>
                </div>

                {/* Card del formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-slideUp">
                    
                    <div className="space-y-5">
                        
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-white text-sm font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </label>
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all placeholder:text-gray-400"
                            />
                            {errors.email && (
                                <p className="text-red-300 text-sm flex items-center gap-1">
                                    <span className="font-bold">•</span> {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-white text-sm font-medium flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-300 text-sm flex items-center gap-1">
                                    <span className="font-bold">•</span> {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Recordar / Olvidé contraseña */}
                        <div className="flex-col sm:flex-row flex justify-between text-sm">
                            <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/30" />
                                Recordarme
                            </label>
                            <a href="#" className="mt-3 sm:mt-0 text-orange-300 hover:text-orange-200 transition-colors">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {/* Botón Login */}
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                            Iniciar Sesión
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                {/* Link a Register */}
                <p className="text-center mt-6 text-white/70">
                    ¿No tienes cuenta?{" "}
                    <Link to="/auth/register" className="text-orange-300 hover:text-orange-200 font-semibold transition-colors">
                        Regístrate aquí
                    </Link>
                </p>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
                .animate-slideUp { animation: slideUp 0.6s ease-out; }
                .animate-bounce-slow { animation: bounce-slow 2s infinite; }
            `}</style>
        </div>
    );
}