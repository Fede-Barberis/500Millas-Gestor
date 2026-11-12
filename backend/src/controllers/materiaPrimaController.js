import {  CompraMP, MateriaPrima } from "../models/index.js";
import db from "../config/database.js";
import actualizarStockMateriaPrima from "../helpers/actualizarStockMateriaPrima.js";


const materiaPrimaController =  {
    
    async getMateriaPrima (req, res) {
        try {
            const materiaPrimas = await MateriaPrima.findAll()

            return res.json(materiaPrimas);
        } catch (error) {
            console.error('Error en getMateriaPrima:', error);
            res.status(500).json({ 
                ok: false, 
                error: error.message 
            });
        }
    },

    async obtenerCompraMp (req, res) {
        try {
            const mp = await CompraMP.findAll({
                include: [
                    { model: MateriaPrima },
                ],
                order: [["fecha", "DESC"]]
            })

            return res.json(mp);
        } catch (error) {
            console.error('Error en obtenerCompraMp:', error);
            res.status(500).json({ 
                ok: false, 
                error: error.message 
            });
        }
    },

    async descontarStock(req, res) {
        const transaction = await db.transaction();

        try {
            const idMateriaPrima = Number(req.body.id_materiaPrima);
            const cantidad = Number(req.body.cantidad);
            const observacion = String(req.body.observacion || "").trim();

            if (!Number.isInteger(idMateriaPrima) || idMateriaPrima <= 0 || !Number.isFinite(cantidad) || cantidad <= 0 || !observacion || observacion.length > 255) {
                await transaction.rollback();
                return res.status(400).json({ ok: false, error: "Seleccioná una materia prima, ingresá una cantidad válida y explicá el motivo del ajuste" });
            }

            if (Math.abs(cantidad * 100 - Math.round(cantidad * 100)) > 1e-8) {
                await transaction.rollback();
                return res.status(400).json({ ok: false, error: "La cantidad puede tener como máximo dos decimales" });
            }

            const mp = await MateriaPrima.findByPk(idMateriaPrima, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!mp) {
                await transaction.rollback();
                return res.status(404).json({ ok: false, error: "Materia prima no encontrada" });
            }

            if (mp.unidad_base === "unidad" && !Number.isInteger(cantidad)) {
                await transaction.rollback();
                return res.status(400).json({ ok: false, error: "La cantidad debe ser un número entero para esta materia prima" });
            }

            if (Number(mp.stock) < cantidad) {
                await transaction.rollback();
                return res.status(409).json({ ok: false, error: `Stock insuficiente. Disponible: ${mp.stock} ${mp.unidad_base}` });
            }

            await actualizarStockMateriaPrima(idMateriaPrima, cantidad, "sub", transaction, {
                tipo: "ajuste_manual", origenTipo: "ajuste_manual", usuarioId: req.user?.userId, observacion
            });
            const stockRestante = Number(mp.stock) - cantidad;
            await transaction.commit();

            return res.json({
                ok: true,
                message: "Stock descontado correctamente",
                materiaPrima: { id_materiaPrima: idMateriaPrima, stock: stockRestante, unidad_base: mp.unidad_base }
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Error al descontar stock de materia prima:", error);
            const esStockInsuficiente = error.message?.startsWith("Stock insuficiente");
            return res.status(esStockInsuficiente ? 409 : 500).json({
                ok: false,
                error: esStockInsuficiente ? "El stock cambió y ya no alcanza para ese descuento. Actualizá la pantalla e intentá de nuevo." : error.message
            });
        }
    },

    async crearCompraMp(req, res) {
        const transaction = await db.transaction();

        try {
            const { fecha, id_materiaPrima, cantidad, lote, fch_vencimiento, precio, isPagado } = req.body;

            if(!fecha || !id_materiaPrima || !cantidad || !fch_vencimiento || !precio ) {
                await transaction.rollback();
                return res.status(400).json({
                    ok: false,
                    message: "Todos los campos marcados son obligatorios"
                });
            }

            const pago = ["true", "1", 1, true].includes(isPagado);

            const mp = await MateriaPrima.findByPk(id_materiaPrima, { transaction });
            if (!mp) throw new Error("Materia prima no encontrada");

            const cantidadBase = Number(cantidad) * Number(mp.factor_conversion);

            const compraMp = await CompraMP.create(
                {fecha, id_materiaPrima, cantidad, lote, fch_vencimiento, precio, isPagado: pago},
                { transaction }
            );

            // Sumar stock
            await actualizarStockMateriaPrima(id_materiaPrima, cantidadBase, "add", transaction, {
                tipo: "compra_mp", origenTipo: "compra_mp", origenId: compraMp.id_compra, usuarioId: req.user?.userId
            });

            await transaction.commit();

            res.json({
                ok: true,
                compraMp,
                message: "Compra creada correctamente"
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


    async eliminarCompraMp(req, res) {
        const transaction = await db.transaction();
    
        try {
            const { id_compra } = req.params;
    
            const compraMp = await CompraMP.findByPk(id_compra, {
                include: [{ model: MateriaPrima }],
                transaction
            });
    
            if (!compraMp) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    error: "Compra no encontrada"
                });
            }
    
            const factor = Number(compraMp.MateriaPrima.factor_conversion);
            const cantidadBase = Number(compraMp.cantidad) * factor;
    
            if (compraMp.MateriaPrima.stock < cantidadBase) {
                await transaction.rollback();
                return res.status(409).json({
                    ok: false,
                    error: "No se puede eliminar la compra porque parte del stock ya fue consumido"
                });
            }
    
            // RESTAR EN UNIDAD BASE
            await actualizarStockMateriaPrima(
                compraMp.id_materiaPrima,
                cantidadBase,
                "sub",
                transaction,
                { tipo: "anulacion_compra_mp", origenTipo: "compra_mp", origenId: compraMp.id_compra, usuarioId: req.user?.userId }
            );
    
            await CompraMP.destroy({ where: { id_compra }, transaction });
    
            await transaction.commit();
    
            res.json({
                ok: true,
                message: "Compra eliminada",
                compraMp
            });
    
        } catch (error) {
            await transaction.rollback();
            res.status(500).json({ ok: false, error: error.message });
        }
    },
    

    async editarCompraMp(req, res) {
        const transaction = await db.transaction();
    
        try {
            const { id_compra } = req.params;
            const {
                fecha,
                id_materiaPrima,
                cantidad,
                lote,
                fch_vencimiento,
                precio,
                isPagado
            } = req.body;
    
            const compra = await CompraMP.findByPk(id_compra, {
                include: [{ model: MateriaPrima }],
                transaction
            });
    
            if (!compra) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    error: "Compra no encontrada"
                });
            }
    
            const pago = ["true", "1", 1, true].includes(isPagado);
    
            // ---------- DATOS VIEJOS ----------
            const oldCantidad = Number(compra.cantidad);
            const oldMateriaId = compra.id_materiaPrima;
            const oldFactor = Number(compra.MateriaPrima.factor_conversion);
            const oldCantidadBase = oldCantidad * oldFactor;
    
            // ---------- DATOS NUEVOS ----------
            const newCantidad = Number(cantidad);
            const newMateriaId = Number(id_materiaPrima);
    
            const newMateria = await MateriaPrima.findByPk(newMateriaId, { transaction });
            if (!newMateria) throw new Error("Materia prima no encontrada");
    
            const newFactor = Number(newMateria.factor_conversion);
            const newCantidadBase = newCantidad * newFactor;
    
            // ---------- AJUSTE DE STOCK ----------
            if (oldMateriaId === newMateriaId) {
                // Misma materia prima
                const diferencia = newCantidadBase - oldCantidadBase;
    
                if (diferencia > 0) {
                    await actualizarStockMateriaPrima(
                        newMateriaId,
                        diferencia,
                        "add",
                        transaction,
                        { tipo: "edicion_compra_mp", origenTipo: "compra_mp", origenId: compra.id_compra, usuarioId: req.user?.userId }
                    );
                } else if (diferencia < 0) {
                    await actualizarStockMateriaPrima(
                        newMateriaId,
                        Math.abs(diferencia),
                        "sub",
                        transaction,
                        { tipo: "edicion_compra_mp", origenTipo: "compra_mp", origenId: compra.id_compra, usuarioId: req.user?.userId }
                    );
                }
            } else {
                // Cambia la materia prima
                await actualizarStockMateriaPrima(
                    oldMateriaId,
                    oldCantidadBase,
                    "sub",
                    transaction,
                    { tipo: "edicion_compra_mp", origenTipo: "compra_mp", origenId: compra.id_compra, usuarioId: req.user?.userId }
                );
    
                await actualizarStockMateriaPrima(
                    newMateriaId,
                    newCantidadBase,
                    "add",
                    transaction,
                    { tipo: "edicion_compra_mp", origenTipo: "compra_mp", origenId: compra.id_compra, usuarioId: req.user?.userId }
                );
            }
    
            await compra.update({
                fecha,
                id_materiaPrima: newMateriaId,
                cantidad: newCantidad,
                lote,
                fch_vencimiento,
                precio,
                isPagado: pago
            }, { transaction });
    
            await transaction.commit();
    
            res.json({
                ok: true,
                message: "Compra actualizada correctamente",
                compra
            });
    
        } catch (error) {
            await transaction.rollback();
            console.error("Error en editarCompraMp:", error);
    
            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }
    
}

export default materiaPrimaController;

