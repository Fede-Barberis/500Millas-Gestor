import { RecetaMateriaPrima } from "../models/index.js";
import actualizarStockMateriaPrima from "./actualizarStockMateriaPrima.js";

export async function procesarReceta(id_receta, operacion, transaction) {
    const ingredientes = await RecetaMateriaPrima.findAll({
        where: { id_receta },
        transaction
    });

    for (const ing of ingredientes) {
        await actualizarStockMateriaPrima(
            ing.id_materiaPrima,
            ing.cantidad_necesaria,
            operacion,
            transaction
        );
    }
}
