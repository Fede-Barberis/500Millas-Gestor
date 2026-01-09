import { MateriaPrima } from "../models/index.js";

export default async function actualizarStockMateriaPrima(
    id_materiaPrima,
    cantidad,
    operacion,
    transaction
) {
    const mp = await MateriaPrima.findByPk(id_materiaPrima, { transaction });

    if (!mp) throw new Error("Materia prima no encontrada");

    const cantidadReal = parseFloat(cantidad); 

    const nuevoStock =
        operacion === "add"
            ? parseFloat(mp.stock) + cantidadReal
            : parseFloat(mp.stock) - cantidadReal;

    if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente de ${mp.nombre}`);
    }

    await mp.update({ stock: nuevoStock }, { transaction });
}


