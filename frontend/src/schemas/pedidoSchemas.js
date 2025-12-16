import * as yup from "yup";

export const pedidoSchema = yup.object().shape({
    fecha_entrega: yup.string().required("La fecha de entrega es obligatoria"),
    persona: yup.string().required("El cliente es obligatorio"),
    detalles: yup.array()
        .of(
            yup.object().shape({
                id_producto: yup.string().required("Selecciona un producto"),
                cantidad: yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser mayor a 0")
                    .required("La cantidad es obligatoria"),
                precio_unitario: yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser mayor a 0")
                    .required("El precio es obligatorio"),
            })
        )
        .min(1, "Debes agregar al menos un producto")
});