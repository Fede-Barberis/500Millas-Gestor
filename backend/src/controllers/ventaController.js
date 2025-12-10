import { Producto, Venta, VentaDetalle } from '../models/index.js'
import db from "../config/database.js";

async function actualizarStockProducto(id_producto, cantidad, operacion, transaction) {
    const p = await Producto.findByPk(id_producto, { transaction });

    if (!p) throw new Error("Producto no encontrado");

    const nuevoStock =
        operacion === "add"
            ? parseFloat(p.stock) + parseFloat(cantidad)
            : parseFloat(p.stock) - parseFloat(cantidad);

    await p.update({ stock: nuevoStock }, { transaction });
}


const ventaController = {
    
    async obtenerVentas (req, res) {
        try {
            const ventas = await Venta.findAll({
                include: [
                {
                    model: VentaDetalle,
                    include: [
                        { model: Producto }
                    ]
                }
            ],
            order: [
                ["id_venta", "DESC"]
            ]
            })
            return res.json(ventas)

        } catch(error) {
            console.log("Error en obtenerVentas:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },
    
    async crearVenta(req, res) {
        const transaction = await db.transaction();

        try {
            const { fecha, persona, id_pedido, isPagado, detalles } = req.body;

            if (!fecha || !persona || !Array.isArray(detalles) || detalles.length === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    ok: false,
                    message: "Fecha, persona y al menos un producto son obligatorios"
                });
            }

            // Normalizar pago
            const pago = ["true", "1", 1, true].includes(isPagado);

            // Normalizar pedido
            const pedidoNormalizado =
            id_pedido === "" || id_pedido === null || id_pedido === undefined
                ? null
                : Number(id_pedido);

            // normalizar pedidos
            const productosNormalizados = detalles.map(p => ({
                id_producto: p.id_producto,
                cantidad: Number(p.cantidad),
                precio: Number(p.precio ?? p.producto?.precio)
            }));

            console.log("NORMALIZADOS:", productosNormalizados);

            // Validación final
            for (const item of productosNormalizados) {
                if (!item.id_producto || !item.cantidad || !item.precio) {
                    throw new Error("Los productos deben tener id_producto, cantidad y precio");
                }
            }

            // 1) Crear venta
            const venta = await Venta.create(
                { fecha, persona, id_pedido: pedidoNormalizado, isPagado: pago },
                { transaction }
            );

            // 2) Crear detalles y actualizar stock
            for (const item of productosNormalizados) {
                await VentaDetalle.create(
                    {
                        id_venta: venta.id_venta,
                        id_producto: item.id_producto,
                        cantidad: item.cantidad,
                        precio: item.precio
                    },
                    { transaction }
                );

                // Stock
                await actualizarStockProducto(
                    item.id_producto,
                    item.cantidad,
                    "sub",
                    transaction
                );
            }

            await transaction.commit();

            return res.json({ ok: true, venta });

        } catch (error) {
            console.log("Error en crearVenta:", error);
            await transaction.rollback();

            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    },



    async eliminarVenta (req, res) {
        const transaction = await db.transaction()

        try {
            const { id_venta } = req.params
            
            const venta = await Venta.findByPk(id_venta, { transaction })

            if(!venta) {
                await transaction.rollback()
                return res.status(404).json({
                    ok: false,
                    message: "Venta no encontrada"
                })
            }

            // Buscar todos los detalles
            const detalles = await VentaDetalle.findAll({
                where: { id_venta },
                transaction
            });

            // Devolver stock por cada producto
            for (const det of detalles) {
                await actualizarStockProducto(
                    det.id_producto,
                    det.cantidad,
                    "add",
                    transaction
                );
            }

            // Eliminar detalles
            await VentaDetalle.destroy({
                where: { id_venta },
                transaction
            });

            // Eliminar venta
            await venta.destroy({ transaction });

            await transaction.commit();

            return res.json({
                ok: true,
                message: "Venta eliminada correctamente"
            });


        } catch (error) {
            console.log("Error en eliminarVenta:", error);
            await transaction.rollback()
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },


    async editarVenta(req, res) {
        const transaction = await db.transaction();

        try {
            const { id_venta } = req.params;
            const { fecha, persona, id_pedido, isPagado, detalles } = req.body;

            if (!Array.isArray(detalles)) {
                throw new Error("El campo 'detalles' debe ser un array");
            }

            // Normalizar pago
            const pago = ["true", "1", 1, true].includes(isPagado);

            // Obtener venta
            const venta = await Venta.findByPk(id_venta, { transaction });

            if (!venta) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    message: "Venta no encontrada"
                });
            }

            // Obtener detalles viejos en un mapa
            const detallesViejos = await VentaDetalle.findAll({
                where: { id_venta },
                transaction
            });

            const mapViejos = new Map();
            detallesViejos.forEach(d =>
                mapViejos.set(d.id_producto, d)
            );

            // Recorrer detalles nuevos
            for (const nuevo of detalles) {
                const viejo = mapViejos.get(nuevo.id_producto);

                if (!viejo) {
                    // 🔹 Producto nuevo → crear detalle y restar stock
                    await VentaDetalle.create({
                        id_venta,
                        id_producto: nuevo.id_producto,
                        cantidad: nuevo.cantidad,
                        precio: nuevo.precio
                    }, { transaction });

                    await actualizarStockProducto(
                        nuevo.id_producto,
                        nuevo.cantidad,
                        "sub",
                        transaction
                    );

                } else {
                    // 🔹 Producto ya existía → comprobar diferencia de cantidad
                    const diff = nuevo.cantidad - viejo.cantidad;

                    if (diff !== 0) {
                        if (diff > 0) {
                            await actualizarStockProducto(viejo.id_producto, diff, "sub", transaction);
                        } else {
                            await actualizarStockProducto(viejo.id_producto, Math.abs(diff), "add", transaction);
                        }
                    }

                    // Actualizar el detalle
                    await viejo.update({
                        cantidad: nuevo.cantidad,
                        precio: nuevo.precio
                    }, { transaction });

                    // Marcar como procesado
                    mapViejos.delete(nuevo.id_producto);
                }
            }

            // 🔹 Los detalles que quedaron en mapViejos están eliminados
            for (const det of mapViejos.values()) {
                // devolver stock
                await actualizarStockProducto(det.id_producto, det.cantidad, "add", transaction);

                // eliminar detalle
                await det.destroy({ transaction });
            }

            // Actualizar cabecera
            await venta.update(
                { fecha, persona, id_pedido, isPagado: pago },
                { transaction }
            );

            await transaction.commit();

            return res.json({
                ok: true,
                message: "Venta actualizada correctamente"
            });

        } catch (error) {
            console.log("Error en editarVenta optimizado:", error);
            await transaction.rollback();
            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }

}

export default ventaController;