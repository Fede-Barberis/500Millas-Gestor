import { Producto, StockMovimiento } from "../models/index.js";

export default async function actualizarStockProducto(id_producto, cantidad, operacion, transaction, contexto = {}) {
    const p = await Producto.findByPk(id_producto, { transaction, lock: transaction?.LOCK?.UPDATE });

    if (!p) throw new Error("Producto no encontrado");

    const stockAnterior = Number(p.stock);
    const cantidadMovimiento = Number(cantidad);
    const nuevoStock =
        operacion === "add"
            ? stockAnterior + cantidadMovimiento
            : stockAnterior - cantidadMovimiento;

    await p.update({ stock: nuevoStock }, { transaction });
    await StockMovimiento.create({
        id_producto: p.id_producto,
        articulo_nombre: p.nombre,
        clase_articulo: "producto",
        tipo: contexto.tipo || "ajuste",
        cantidad: (operacion === "add" ? 1 : -1) * cantidadMovimiento,
        stock_anterior: stockAnterior,
        stock_nuevo: nuevoStock,
        unidad: "unidad",
        origen_tipo: contexto.origenTipo || null,
        origen_id: contexto.origenId || null,
        usuario_id: contexto.usuarioId || null,
        observacion: contexto.observacion || null
    }, { transaction });

    return { stockAnterior, stockNuevo: nuevoStock };
}
