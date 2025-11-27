import * as yup from "yup";

export const productionSchema = yup.object({
    fecha: yup.string().required("La fecha es obligatoria"),
    id_receta: yup.string().required("La receta es obligatoria"),
    detalles: yup.array().of(
        yup.object().shape({
            id_producto: yup.string().required("Selecciona un producto"),
            cantidad: yup.string().required("La cantidad es obligatoria"),
            fch_vencimiento: yup.string().required("Fecha de vencimiento obligatoria"),
            lote: yup.string().required("El lote es obligatorio"),
        })
    ).min(1, "Debes agregar al menos un producto")
});