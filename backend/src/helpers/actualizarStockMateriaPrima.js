import { MateriaPrima } from "../models/index.js";

export default async function actualizarStockMateriaPrima(
    id_materiaPrima,
    cantidad,
    operacion,
    transaction
) {
    const mp = await MateriaPrima.findByPk(id_materiaPrima, {
        transaction,
        lock: transaction?.LOCK?.UPDATE
    });

    if (!mp) throw new Error("Materia prima no encontrada");

    const cantidadReal = Number(cantidad);
    if (!Number.isFinite(cantidadReal) || cantidadReal < 0) {
        throw new Error("Cantidad inválida para actualizar stock de materia prima");
    }
    if (!["add", "sub"].includes(operacion)) {
        throw new Error(`Operación inválida: ${operacion}`);
    }

    const nuevoStock =
        operacion === "add"
            ? Number(mp.stock) + cantidadReal
            : Number(mp.stock) - cantidadReal;

    if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente de ${mp.nombre}`);
    }

    await mp.update({ stock: nuevoStock }, { transaction });
}


