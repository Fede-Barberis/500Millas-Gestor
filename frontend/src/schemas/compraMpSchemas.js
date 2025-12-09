import * as yup from "yup";

export const compraMpSchema = yup.object({
    fecha: yup.string().required("La fecha es obligatoria"),
    id_materiaPrima: yup.string().required("Selecciona un materia prima"),
    cantidad: yup.string().required("La cantidad es obligatoria"),
    precio: yup.string().required("El precio es obligatorio"),
    fch_vencimiento: yup.string().required("Fecha de vencimiento obligatoria"),
});