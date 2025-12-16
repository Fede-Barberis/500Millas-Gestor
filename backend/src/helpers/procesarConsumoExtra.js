import { ConsumoExtra, RecetaMateriaPrima } from "../models/index.js";
import actualizarStockMateriaPrima from "./actualizarStockMateriaPrima.js";

export default async function procesarConsumosExtra(
    id_producto,
    cantidad,
    operacion,
    transaction
) {
    const extras = await ConsumoExtra.findAll({
        where: { id_producto },
        transaction
    });

    for (const ext of extras) {
        // Materia prima directa
        if (ext.id_materiaPrima) {
            const total = (cantidad * ext.cantidad_por_lote) / ext.lote_equivale;

            await actualizarStockMateriaPrima(
                ext.id_materiaPrima,
                total,
                operacion,
                transaction
            );
        }

        // Receta completa
        if (ext.id_receta) {
            const lotes = Math.ceil(cantidad / ext.lote_equivale);
            const ingredientes = await RecetaMateriaPrima.findAll({
                where: { id_receta: ext.id_receta },
                transaction
            });

            for (const ing of ingredientes) {
                await actualizarStockMateriaPrima(
                    ing.id_materiaPrima,
                    lotes * ing.cantidad_necesaria,
                    operacion,
                    transaction
                );
            }
        }
    }
}
