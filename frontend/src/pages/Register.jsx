// import { Link, useNavigate } from "react-router-dom";
// import { toast} from 'sonner'
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import ErrorMessage from "../components/ErrorMessage";
// import { registerUser } from "../api/authApi";
// import { registerSchema } from "../schemas/authSchemas";


// export default function Register() {
//     const navigate = useNavigate();

//     const initialValues = {
//         name: "",
//         email: "",
//         password: "",
//     };

//     const { register, handleSubmit, formState: { errors } } = useForm({ 
//         defaultValues: initialValues,
//         resolver: yupResolver(registerSchema)
//     });

//     const onSubmit = async (data) => {
//         try {
//             await registerUser(data);
//             toast.success('Registro exitoso. Por favor, inicia sesión.');
//             const registerExitoso = true;

//             if(registerExitoso){
//                 setTimeout(() => {
//                     navigate('/auth/login');
//                 }, 1000);
//             }
//         } catch (err) {
//             toast.error(err.message);
//         }
//     };

//     return (
//         <>
//         <div className="flex flex-col justify-center items-center min-h-screen ">
//             <h1 className="text-center text-4xl mb-5 text-white font-heading font-bold">Crear Cuenta</h1>

//             <form 
//                 onSubmit={handleSubmit(onSubmit)}
//                 className="w-80 p-6 md:p-4 rounded-xl space-y-7"
//             >
//                 <div className="grid grid-cols-1">
//                     <input
//                         id="name"
//                         type="text"
//                         placeholder="Nombre"
//                         className="w-full mb-2 p-2 border rounded-lg font-input bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
//                         {...register('name')}
//                     />
//                     {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
//                 </div>
//                 <div className="grid grid-cols-1">
//                     <input
//                         id="email"
//                         type="email"
//                         placeholder="Email"
//                         className="w-full mb-2 p-2 border rounded-lg font-input bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
//                         {...register('email')}
//                     />
//                     {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
//                 </div>
//                 <div className="grid grid-cols-1">
//                     <input
//                         id="password"
//                         type="password"
//                         placeholder="Password"
//                         className="w-full mb-2 p-2 border rounded-lg font-input bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
//                         {...register('password')}
//                     />
//                     {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
//                 </div>

//                 <input
//                     type="submit"
//                     className="w-full mb-2 p-2 text-white border rounded-lg font-button font-semibold tracking-wider bg-register border-none hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
//                     value='Crear Cuenta'
//                 />  
//             </form>

//             <nav className="mt-4 px-4">
//                 <Link className="text-center text-white/70 text-sm md:text-md "
//                 to="/auth/login">¿ Ya tienes cuenta? <span className="font-bold text-white hover:underline">Presiona aquí</span></Link>
//             </nav>
//         </div>
//         </>
//     )
// }

import { Mail, Lock, User, ArrowRight, Eye, EyeOff, UserPlus2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { registerUser } from "../api/authApi";
import { registerSchema } from "../schemas/authSchemas";

export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const initialValues = {
        name: "",
        email: "",
        password: "",
    };

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues,
        resolver: yupResolver(registerSchema)
    });

    const onSubmit = async (data) => {
        try {
            await registerUser(data);
            toast.success('Registro exitoso. Por favor, inicia sesión.');
            
            setTimeout(() => {
                navigate('/auth/login');
            }, 1000);
        } catch (err) {
            toast.error(err.message || "Error al registrar usuario");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen p-4">
            <div className="w-full max-w-md">
                
                {/* Logo/Brand */}
                <div className="text-center mb-6 animate-fadeIn">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-bounce-slow">
                        <span className="text-3xl text-white"><UserPlus2 /></span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Crear Cuenta</h1>
                    <p className="hidden sm:block text-white/70 text-sm">Únete y comienza a gestionar tu negocio</p>
                </div>

                {/* Card del formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20 animate-slideUp">
                    
                    <div className="space-y-4 sm:space-y-5">
                        
                        {/* Nombre */}
                        <div className="space-y-2">
                            <label className="text-white text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                {...register("name")}
                                placeholder="Juan Pérez"
                                className="w-full px-4 py-2 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-gray-400"
                            />
                            {errors.name && (
                                <p className="text-red-300 text-sm flex items-center gap-1">
                                    <span className="font-bold">•</span> {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                className="w-full px-4 py-2 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-gray-400"
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
                                    className="w-full px-4 py-2 pr-12 bg-white/90 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-white/60 text-xs">Mínimo 8 caracteres</p>
                            {errors.password && (
                                <p className="text-red-300 text-sm flex items-center gap-1">
                                    <span className="font-bold">•</span> {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Términos */}
                        <label className="flex items-start gap-2 text-white/80 text-sm cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-white/30" />
                            <span>
                                Acepto los{" "}
                                <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                                    términos y condiciones
                                </a>
                            </span>
                        </label>

                        {/* Botón Register */}
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-400 to-indigo-700 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                            Crear Cuenta
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                {/* Link a Login */}
                <p className="text-center mt-2 text-white/70">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/auth/login" className="text-blue-300 hover:text-blue-200 font-semibold transition-colors">
                        Inicia sesión aquí
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