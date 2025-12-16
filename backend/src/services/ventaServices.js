import actualizarStockProducto from "../helpers/actualizarStockProducto.js";
import { Pedido, DetallePedido, Venta, VentaDetalle } from "../models/index.js";

export async function crearVentaDesdePedido(id_pedido, transaction) {
    const pedido = await Pedido.findByPk(id_pedido, {
        include: [DetallePedido],
        transaction
    });

    const venta = await Venta.create(
        {
            id_pedido,
            persona: pedido.persona,
            fecha: new Date(),
            isPagado: false
        },
        { transaction }
    );

    for (const det of pedido.DetallePedidos) {
        await VentaDetalle.create(
            {
                id_venta: venta.id_venta,
                id_producto: det.id_producto,
                cantidad: det.cantidad,
                precio: det.precio_unitario
            },
            { transaction }
        );

        // Descontar stock
        await actualizarStockProducto(
            det.id_producto,
            det.cantidad,
            "sub",          // Resta del stock
            transaction
        );
    }

    return venta;
}
