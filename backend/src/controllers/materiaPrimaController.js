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

            const compraMp = await CompraMP.create(
                {fecha, id_materiaPrima, cantidad, lote, fch_vencimiento, precio, isPagado: pago},
                { transaction }
            );

            // Sumar stock
            await actualizarStockMateriaPrima(id_materiaPrima, cantidad, "add", transaction);

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
            const compraMp = await CompraMP.findByPk(id_compra, { transaction });

            if (!compraMp) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    error: "Compra no encontrada"
                });
            }

            // Restar stock
            await actualizarStockMateriaPrima(
                compraMp.id_materiaPrima,
                compraMp.cantidad,
                "sub",
                transaction
            );

            // Eliminar compra
            await CompraMP.destroy({ where: { id_compra }, transaction });

            await transaction.commit();

            res.json({
                ok: true,
                message: "Compra eliminada",
                compraMp
            });

        } catch (error) {
            await transaction.rollback();
            console.error("Error en eliminarCompraMp:", error);

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    },


    async editarCompraMp(req, res) {
        const transaction = await db.transaction();

        try {
            const { id_compra } = req.params;
            const { fecha, id_materiaPrima, cantidad, lote, fch_vencimiento, precio, isPagado } = req.body;

            // Obtener compra actual
            const compraMp = await CompraMP.findByPk(id_compra, { transaction });

            if (!compraMp) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    error: "Compra no encontrada"
                });
            }

            // Normalizar estado de pago
            const pago = ["true", "1", 1, true].includes(isPagado);

            // Guardamos datos antiguos
            const oldCantidad = parseFloat(compraMp.cantidad);
            const oldMateria = compraMp.id_materiaPrima;

            const newCantidad = parseFloat(cantidad);
            const newMateria = id_materiaPrima;


            // Actualizar stock

            // Si cambia la materia prima
            if (oldMateria !== newMateria) {
                // Devolver la cantidad al stock del ítem viejo
                await actualizarStockMateriaPrima(oldMateria, oldCantidad, "sub", transaction);

                // Sumar cantidad al nuevo ítem
                await actualizarStockMateriaPrima(newMateria, newCantidad, "add", transaction);
            }
            else {
                // Si no cambia la materia prima, pero sí la cantidad
                if (oldCantidad !== newCantidad) {
                    const diferencia = newCantidad - oldCantidad;

                    if (diferencia > 0) {
                        await actualizarStockMateriaPrima(newMateria, diferencia, "add", transaction);
                    } else {
                        await actualizarStockMateriaPrima(newMateria, Math.abs(diferencia), "sub", transaction);
                    }
                }
            }

            //   Actualizar compra
            
            await compraMp.update(
                {
                    fecha,
                    id_materiaPrima: newMateria,
                    cantidad: newCantidad,
                    lote,
                    fch_vencimiento,
                    precio,
                    isPagado: pago
                },
                { transaction }
            );

            await transaction.commit();

            res.json({
                ok: true,
                message: "Compra actualizada correctamente",
                compraMp
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

