import { Pedido, Producto, DetallePedido, Venta, VentaDetalle } from "../models/index.js"
import db from "../config/database.js"
import { crearVentaDesdePedido } from "../services/ventaServices.js";
import actualizarStockProducto from "../helpers/actualizarStockProducto.js";

const pedidoController = {
    
    async getPedidos (req, res) {
        try {
            const pedidos = await Pedido.findAll({
                include: [
                    {
                        model: DetallePedido,
                        include: [Producto],
                    },
                ],
                order: [["fecha_entrega", "DESC"]]
            })

            if(!pedidos) {
                return res.status(404).json({
                    ok: false,
                    message: "No se encontraron pedidos."
                })
            }

            return res.json(pedidos)

        } catch(error) {
            console.log("Error en getPedidos:", error);
            res.status(500).json({
                ok: false,
                error: error.mesagge
            })
        }
    },


    async crearPedido (req,res) {
        const transaction = await db.transaction();

        try {
            const { fecha_entrega, persona, detalles } = req.body;

            if (!fecha_entrega || !persona || !Array.isArray(detalles) || detalles.length === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    ok: false,
                    message: "Fecha, persona y al menos un producto son obligatorios"
                });
            }

            // normalizar pedidos
            const productosNormalizados = detalles.map(p => ({
                id_producto: p.id_producto,
                cantidad: Number(p.cantidad),
                precio_unitario: Number(p.precio_unitario)
            }));

            // Validación final
            for (const item of productosNormalizados) {
                const productoBD = await Producto.findByPk(item.id_producto, { transaction });

                if (!productoBD) {
                    throw new Error(`El producto con ID ${item.id_producto} no existe.`);
                }

                if (Number(item.cantidad) > Number(productoBD.stock)) {
                    throw new Error(
                        `Stock insuficiente para ${productoBD.nombre}. ` +
                        `Stock actual: ${productoBD.stock}, solicitado: ${item.cantidad}`
                    );
                }
            }

            if (new Date(fecha_entrega) < new Date()) {
                throw new Error("La fecha de entrega no puede ser anterior a hoy");
            }


            // 1) Crear pedido
            const pedido = await Pedido.create(
                { fecha_entrega, persona, estado: "pendiente" },
                { transaction }
            );

            // 2) Crear detalles y actualizar stock
            for (const item of productosNormalizados) {
                await DetallePedido.create(
                    {
                        id_pedido: pedido.id_pedido,
                        id_producto: item.id_producto,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio_unitario
                    },
                    { transaction }
                );
            }

            await transaction.commit();

            return res.json({ 
                ok: true, 
                message: "Pedido creado correctamente",
                pedido 
            });

        } catch (error) {
            await transaction.rollback();

            console.error("Error en crearCompraMp:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    },

    async eliminarPedido(req, res) {
        const transaction = await db.transaction();

        try {
            const { id_pedido } = req.params;

            const pedido = await Pedido.findByPk(id_pedido, { transaction });

            if (!pedido) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    message: "Pedido no encontrado"
                });
            }

            // Buscar detalles del pedido
            const detallesPedido = await DetallePedido.findAll({
                where: { id_pedido },
                transaction
            });

            // Devolver stock
            for (const det of detallesPedido) {
                await actualizarStockProducto(
                    det.id_producto,
                    det.cantidad,
                    "add",
                    transaction
                );
            }

            // Buscar si existe una venta asociada
            const venta = await Venta.findOne({
                where: { id_pedido },
                transaction
            });

            if (venta) {
                // Buscar detalles de la venta
                await VentaDetalle.destroy({
                    where: { id_venta: venta.id_venta },
                    transaction
                });

                // Eliminar venta
                await venta.destroy({ transaction });
            }

            // Eliminar detalles del pedido
            await DetallePedido.destroy({
                where: { id_pedido },
                transaction
            });

            // Eliminar el pedido
            await pedido.destroy({ transaction });

            await transaction.commit();

            return res.json({
                ok: true,
                message: "Pedido, detalles y venta eliminados correctamente"
            });

        } catch (error) {
            console.log("Error en eliminarPedido:", error);
            await transaction.rollback();
            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    },

    
    async editarPedido(req, res) {
        const transaction = await db.transaction();

        try {
            const { id_pedido } = req.params;
            const { fecha_entrega, persona, estado, detalles } = req.body;

            if (!Array.isArray(detalles) || detalles.length === 0) {
                throw new Error("El campo 'detalles' debe ser un array con al menos un ítem");
            }

            // 1) Obtener pedido
            const pedido = await Pedido.findByPk(id_pedido, { transaction });

            if (!pedido) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    message: "Pedido no encontrado"
                });
            }

            const estadoAnterior = pedido.estado;
            const pasaAEntregado = estadoAnterior !== "entregado" && estado === "entregado";

            // Normalizar detalles
            const detallesNorm = detalles.map(d => ({
                id_producto: d.id_producto,
                cantidad: Number(d.cantidad),
                precio_unitario: Number(d.precio_unitario)
            }));

            // 2) Validar stock SOLO si pasa a entregado
            if (pasaAEntregado) {
                for (const item of detallesNorm) {
                    const prod = await Producto.findByPk(item.id_producto, { transaction });

                    if (!prod) {
                        throw new Error(`El producto con ID ${item.id_producto} no existe.`);
                    }

                    if (item.cantidad > prod.stock) {
                        throw new Error(
                            `Stock insuficiente para ${prod.nombre}. Stock: ${prod.stock}, solicitado: ${item.cantidad}`
                        );
                    }
                }
            }

            // 3) Actualizar cabecera
            await pedido.update(
                { fecha_entrega, persona, estado },
                { transaction }
            );

            // 4) Reemplazar detalles
            await DetallePedido.destroy({
                where: { id_pedido },
                transaction
            });

            for (const det of detallesNorm) {
                await DetallePedido.create(
                    {
                        id_pedido,
                        id_producto: det.id_producto,
                        cantidad: det.cantidad,
                        precio_unitario: det.precio_unitario
                    },
                    { transaction }
                );
            }

            // 5) Si pasó a ENTREGADO → crear venta
            if (pasaAEntregado) {
                await crearVentaDesdePedido(id_pedido, transaction);
            }

            await transaction.commit();

            return res.json({
                ok: true,
                message: pasaAEntregado
                    ? "Pedido actualizado y venta generada automáticamente"
                    : "Pedido actualizado correctamente"
            });

        } catch (error) {
            console.log("Error en editarPedido:", error);
            await transaction.rollback();

            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }
}


export default pedidoController;