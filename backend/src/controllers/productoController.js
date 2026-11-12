import { 
    DetalleProduccion,
    Produccion,
    Producto,
    Venta, 
    VentaDetalle
} from "../models/index.js";

import { Op } from "sequelize";
import db from "../config/database.js";
import actualizarStockProducto from "../helpers/actualizarStockProducto.js";

const productoController =  {
    
    async crearProducto(req, res) {
        const transaction = await db.transaction();
        try {
            const { nombre, stock, tipoProducto } = req.body;
            const tipo_producto = String(tipoProducto || "").trim().toUpperCase();

            if (!["ALFAJOR", "GALLETAS"].includes(tipo_producto)) {
                await transaction.rollback();
                return res.status(400).json({ ok: false, error: "El tipo de producto debe ser ALFAJOR o GALLETAS" });
            }

            const stockInicial = Number(stock || 0);
            if (!Number.isInteger(stockInicial) || stockInicial < 0) throw new Error("El stock inicial debe ser un entero igual o mayor que cero");
            const producto = await Producto.create({ nombre, stock: 0, tipo_producto }, { transaction });
            if (stockInicial > 0) {
                await actualizarStockProducto(producto.id_producto, stockInicial, "add", transaction, {
                    tipo: "saldo_inicial", origenTipo: "producto", usuarioId: req.user?.userId,
                    observacion: "Stock inicial al crear el producto"
                });
            }
            await transaction.commit();
            producto.stock = stockInicial;

            res.json({
                ok: true,
                producto,
                message: "Producto creado correctamente"
            });

        } catch (error) {
            if (!transaction.finished) await transaction.rollback();
            console.error('Error en crearProducto:', error);
            res.status(500).json({ 
                ok: false, 
                error: error.message 
            });
        }
    },

    async eliminarProducto (req, res) {
        const transaction = await db.transaction();
        try {
            const { id_producto } = req.params;
            const producto = await Producto.findByPk(id_producto, { transaction, lock: transaction.LOCK.UPDATE })

            if (!producto) {
                await transaction.rollback();
                return res.status(404).json({ 
                    ok: false,
                    error: "Producto no encontrado" 
                });
            }

            if (Number(producto.stock) > 0) {
                await actualizarStockProducto(producto.id_producto, Number(producto.stock), "sub", transaction, {
                    tipo: "baja_producto", origenTipo: "producto", origenId: producto.id_producto,
                    usuarioId: req.user?.userId, observacion: "Stock retirado al dar de baja el producto"
                });
            }
            await producto.destroy({ transaction });
            await transaction.commit();
            
            return res.json({ 
                ok: true,
                message: "Producto eliminado",
                producto
            });
        } catch(error) {
            if (!transaction.finished) await transaction.rollback();
            console.log("Error en eliminarProducto:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },

    async editarProducto (req, res) {
        const transaction = await db.transaction();
        try {
            const { id_producto } = req.params;
            const producto = await Producto.findByPk(id_producto, { transaction, lock: transaction.LOCK.UPDATE });

            if (!producto) {
                await transaction.rollback();
                return res.status(404).json({
                ok: false, 
                error: "Producto no encontrado" 
                });
            }

            const tipo_producto = String(req.body.tipoProducto || "").trim().toUpperCase();
            if (!["ALFAJOR", "GALLETAS"].includes(tipo_producto)) {
                await transaction.rollback();
                return res.status(400).json({ ok: false, error: "El tipo de producto debe ser ALFAJOR o GALLETAS" });
            }

            const nuevoStock = Number(req.body.stock);
            if (!Number.isInteger(nuevoStock) || nuevoStock < 0) throw new Error("El stock debe ser un entero igual o mayor que cero");
            const diferenciaStock = nuevoStock - Number(producto.stock);
            if (diferenciaStock !== 0) {
                await actualizarStockProducto(producto.id_producto, Math.abs(diferenciaStock), diferenciaStock > 0 ? "add" : "sub", transaction, {
                    tipo: "ajuste_manual", origenTipo: "producto", origenId: producto.id_producto,
                    usuarioId: req.user?.userId, observacion: "Ajuste de stock desde la edición del producto"
                });
            }
            await producto.update({
                nombre: req.body.nombre,
                tipo_producto
            }, { transaction });
            await transaction.commit();
            
            res.json({ 
                ok: true,
                message: "Producto actualizado correctamente",
                producto
            });

        } catch(error) {
            if (!transaction.finished) await transaction.rollback();
            console.log("Errorn en editarProducto:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },


    async obtenerMovimientosProducto (req,res) {
        console.log("PARAMS RECIBIDOS:", req.params);

        try {
            const { id_producto } = req.params;

            const hoy = new Date();
            const haceUnaSemana = new Date();
            haceUnaSemana.setDate(hoy.getDate() - 7);

            const aumentos = await DetalleProduccion.count({
                where: {
                    id_producto,
                    
                },
                include: [
                    { 
                        model: Produccion ,
                        where: {
                            fecha: {
                                [Op.between]: [haceUnaSemana, hoy]
                            }
                        }
                    }
                ],
            });

            const disminuciones = await VentaDetalle.count({
                where: { id_producto },
                include: [
                    {
                        model: Venta,
                        required: true,
                        where: {
                            fecha: {
                                [Op.between]: [haceUnaSemana, hoy]
                            }
                        }
                    }
                ]
            });

            return res.json({
                periodo: "semanal",
                desde: haceUnaSemana,
                hasta: hoy,
                aumentos,
                disminuciones,
                movimientosTotales: aumentos + disminuciones
            });

        } catch (error) {
            console.log("Error en obtenerMoviminetosProductos:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    }
}


export default productoController;
