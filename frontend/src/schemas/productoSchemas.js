import * as yup from "yup";

export const productoSchema = yup.object({
    nombre: yup.string().required("El nombre es obligatorio"),
    stock: yup.string().required("El stock es obligatorio"),    
});