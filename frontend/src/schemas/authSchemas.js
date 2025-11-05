import * as yup from "yup";

export const loginSchema = yup.object({
    email: yup.string()
        .required("El email es obligatorio")
        .email("Email inválido"),
    
    password: yup.string()
        .required("La contraseña es obligatoria")
        .min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = yup.object({
        name: yup.string()
            .required("El nombre es obligatorio")
            .min(3, "El nombre debe tener al menos 3 caracteres"),

        email: yup.string()
            .required("El email es obligatorio")
            .email("Email inválido"),

        password: yup.string()
            .required("La contraseña es obligatoria")
            .min(6, "Mínimo 6 caracteres"),
    });