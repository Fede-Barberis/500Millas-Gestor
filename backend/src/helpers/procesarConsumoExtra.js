import { ConsumoExtra, RecetaMateriaPrima } from "../models/index.js";
import actualizarStockMateriaPrima from "./actualizarStockMateriaPrima.js";

export default async function procesarConsumoExtra(
    id_producto,
    cantidad,
    operacion,
    transaction
) {
    const cantidadNumerica = Number(cantidad || 0);

    const extras = await ConsumoExtra.findAll({
        where: { id_producto },
        transaction
    });

    for (const ext of extras) {

        // MP directa (dulce, glasee, etc)
        if (ext.id_materiaPrima) {
            const cantidadPorLote = Number(ext.cantidad_por_lote || 0);
            const loteEquivale = Number(ext.lote_equivale || 1);
            const total = (cantidadNumerica * cantidadPorLote) / loteEquivale;

            await actualizarStockMateriaPrima(
                ext.id_materiaPrima,
                total,
                operacion,
                transaction
            );
        }

        // Receta completa
        if (ext.id_receta) {
            const loteEquivale = Number(ext.lote_equivale || 1);
            const lotes = cantidadNumerica / loteEquivale;

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
