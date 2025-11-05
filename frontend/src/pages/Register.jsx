import { Link, useNavigate } from "react-router-dom";
import { toast} from 'sonner'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ErrorMessage from "../components/ErrorMessage";
import { registerUser } from "../api/authApi";
import { registerSchema } from "../schemas/authSchemas";


export default function Register() {
    const navigate = useNavigate();

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
            const registerExitoso = true;

            if(registerExitoso){
                setTimeout(() => {
                    navigate('/auth/login');
                }, 1000);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <>
        <div className="flex flex-col justify-center items-center min-h-screen ">
            <h1 className="text-center text-4xl mb-5 text-white font-heading font-bold">Crear Cuenta</h1>

            <form 
                onSubmit={handleSubmit(onSubmit)}
                className="w-80 p-6 md:p-4 rounded-xl space-y-7"
            >
                <div className="grid grid-cols-1">
                    <input
                        id="name"
                        type="text"
                        placeholder="Nombre"
                        className="w-full mb-2 p-2 border rounded-lg font-input bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        {...register('name')}
                    />
                    {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-1">
                    <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        className="w-full mb-2 p-2 border rounded-lg font-input bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        {...register('email')}
                    />
                    {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-1">
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        className="w-full mb-2 p-2 border rounded-lg font-input bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        {...register('password')}
                    />
                    {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                </div>

                <input
                    type="submit"
                    className="w-full mb-2 p-2 text-white border rounded-lg font-button font-semibold tracking-wider bg-register border-none hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
                    value='Crear Cuenta'
                />  
            </form>

            <nav className="mt-4 px-4">
                <Link className="text-center text-white/70 text-sm md:text-md "
                to="/auth/login">¿ Ya tienes cuenta? <span className="font-bold text-white hover:underline">Presiona aquí</span></Link>
            </nav>
        </div>
        </>
    )
}