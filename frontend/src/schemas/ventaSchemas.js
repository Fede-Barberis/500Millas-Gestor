import * as yup from "yup";

export const ventaSchema = yup.object().shape({
    fecha: yup.string().required("La fecha es obligatoria"),
    persona: yup.string().required("El cliente es obligatorio"),
    id_pedido: yup.string().nullable(),
    isPagado: yup.boolean(),
    detalles: yup.array()
        .of(
            yup.object().shape({
                id_producto: yup.string().required("Selecciona un producto"),
                cantidad: yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser mayor a 0")
                    .required("La cantidad es obligatoria"),
                precio: yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser mayor a 0")
                    .required("El precio es obligatorio"),
            })
        )
        .min(1, "Debes agregar al menos un producto")
});