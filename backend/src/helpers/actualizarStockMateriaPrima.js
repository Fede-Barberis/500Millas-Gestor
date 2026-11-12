import { MateriaPrima, StockMovimiento } from "../models/index.js";

export default async function actualizarStockMateriaPrima(
    id_materiaPrima,
    cantidad,
    operacion,
    transaction,
    contexto = {}
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

    const stockAnterior = Number(mp.stock);
    await mp.update({ stock: nuevoStock }, { transaction });
    await StockMovimiento.create({
        id_materiaPrima: mp.id_materiaPrima,
        articulo_nombre: mp.nombre,
        clase_articulo: "materia_prima",
        tipo: contexto.tipo || "ajuste",
        cantidad: (operacion === "add" ? 1 : -1) * cantidadReal,
        stock_anterior: stockAnterior,
        stock_nuevo: nuevoStock,
        unidad: mp.unidad_base,
        origen_tipo: contexto.origenTipo || null,
        origen_id: contexto.origenId || null,
        usuario_id: contexto.usuarioId || null,
        observacion: contexto.observacion || null
    }, { transaction });

    return { stockAnterior, stockNuevo: nuevoStock };
}


