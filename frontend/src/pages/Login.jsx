
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { loginSchema } from "../schemas/authSchemas";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const initialValues = {
        email: "",
        password: ""
    }

    const { register, handleSubmit, formState: { errors } } = useForm ({ 
        defaultValues: initialValues,
        resolver: yupResolver(loginSchema) 
    })
    
    const onSubmit = async (data) => {
        try {
            const res = await loginUser(data)
            console.log(res);
            login(res.user, res.token)
            toast.success("Inicio de sesion exitoso!")
            const loginExitoso = true;

            if(loginExitoso){
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
        } catch (err) {
            toast.error("Credenciales invalidas")
        }
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center min-h-screen">
                <h1 className="text-center text-4xl mb-5 text-white font-heading font-bold">Iniciar Sesion</h1> 

                <form 
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-80 p-6 md:p-4 space-y-10 rounded-xl"
                >
                    <div className="grid grid-cols-1">
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="w-full mb-2 p-2 border rounded-lg font-input bg-white border-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-200"
                            {...register("email")}
                        />
                        {errors.email && (
                            <ErrorMessage>{errors.email.message}</ErrorMessage>
                        )}
                    </div>
                    <div className="grid grid-cols-1">
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            className="w-full mb-2 p-2 border rounded-lg font-input bg-white border-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-200"
                            {...register("password")}
                        />
                        {errors.password && (
                            <ErrorMessage>{errors.password.message}</ErrorMessage>
                        )}
                    </div>

                    <input
                        type="submit"
                        className="w-full mb-2 p-2 text-white border rounded-lg font-button font-semibold tracking-wider border-none bg-login hover:bg-orange-400 transition-colors duration-200 cursor-pointer"
                        value='Login'
                    />
                        
                </form>

                <nav className="mt-4 px-4">
                    <Link className="text-center text-white/70 text-sm md:text-md "
                    to="/auth/register">¿ No tienes cuenta? <span className="font-bold text-white hover:underline">Regístrate aquí</span></Link>
                </nav>
            </div>
        </>
    );
}
