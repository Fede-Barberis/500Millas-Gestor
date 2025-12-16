import { Producto } from "../models/index.js";

export default async function actualizarStockProducto(id_producto, cantidad, operacion, transaction) {
    const p = await Producto.findByPk(id_producto, { transaction });

    if (!p) throw new Error("Producto no encontrado");

    const nuevoStock =
        operacion === "add"
            ? parseFloat(p.stock) + parseFloat(cantidad)
            : parseFloat(p.stock) - parseFloat(cantidad);

    await p.update({ stock: nuevoStock }, { transaction });
}