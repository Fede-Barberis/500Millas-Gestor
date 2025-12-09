import { 
    CompraMP,
    MateriaPrima,
} from "../models/index.js";

import db from "../config/database.js";

async function actualizarStockMP(id_materiaPrima, cantidad, operacion, transaction) {
    const mp = await MateriaPrima.findByPk(id_materiaPrima, { transaction });

    if (!mp) throw new Error("Materia prima no encontrada");

    const nuevoStock =
        operacion === "add"
            ? parseFloat(mp.stock) + parseFloat(cantidad)
            : parseFloat(mp.stock) - parseFloat(cantidad);

    await mp.update({ stock: nuevoStock }, { transaction });
}

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
            await actualizarStockMP(id_materiaPrima, cantidad, "add", transaction);

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
            await actualizarStockMP(
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

            // -----------------------------------------
            //  ACTUALIZACIÓN DEL STOCK
            // -----------------------------------------

            // Si cambia la materia prima
            if (oldMateria !== newMateria) {
                // Devolver la cantidad al stock del ítem viejo
                await actualizarStockMP(oldMateria, oldCantidad, "sub", transaction);

                // Sumar cantidad al nuevo ítem
                await actualizarStockMP(newMateria, newCantidad, "add", transaction);
            }
            else {
                // Si no cambia la materia prima, pero sí la cantidad
                if (oldCantidad !== newCantidad) {
                    const diferencia = newCantidad - oldCantidad;

                    if (diferencia > 0) {
                        await actualizarStockMP(newMateria, diferencia, "add", transaction);
                    } else {
                        await actualizarStockMP(newMateria, Math.abs(diferencia), "sub", transaction);
                    }
                }
            }

            // --------------------------------------------------
            //   Actualizar compra
            // --------------------------------------------------
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




// async crearMateriaPrima(req, res) {
//         try {
//             const { nombre, stock } = req.body;

//             // 1. Crear producción
//             const materiaPrima = await MateriaPrima.create({ nombre, stock });

//             res.json({
//                 ok: true,
//                 materiaPrima,
//                 message: "Materia prima creada correctamente"
//             });

//         } catch (error) {
//             console.error('Error en crearMateriaPrima:', error);
//             res.status(500).json({ 
//                 ok: false, 
//                 error: error.message 
//             });
//         }
//     },

//     async eliminarMateriaPrima (req, res) {
//         try {
//             const { id_materiaPrima } = req.params;
//             const materiaPrima = await MateriaPrima.findByPk(id_materiaPrima)

//             if (!materiaPrima) {
//                 return res.status(404).json({ 
//                     ok: false,
//                     error: "Materia prima no encontrada" 
//                 });
//             }

//             await materiaPrima.destroy(id_materiaPrima)
            
//             return res.json({ 
//                 ok: true,
//                 message: "Materia Prima eliminada",
//                 materiaPrima
//             });
//         } catch(error) {
//             console.log("Error en eliminarMateriaPrima:", error);
//             res.status(500).json({
//                 ok: false,
//                 error: error.message
//             })
//         }
//     },

//     async editarMateriaPrima (req, res) {
//         try {
//             const { id_materiaPrima } = req.params;
//             const materiaPrima = await MateriaPrima.findByPk(id_materiaPrima);

//             if (!materiaPrima) return res.status(404).json({ 
//                 ok: false, 
//                 error: "Materia prima no encontrada" 
//             });

//             await materiaPrima.update({
//                 nombre: req.body.nombre,
//                 stock: req.body.stock
//             });
            
//             res.json({ 
//                 ok: true,
//                 message: "Materia prima actualizada correctamente",
//                 materiaPrima
//             });

//         } catch(error) {
//             console.log("Error en editarMateriaPrima:", error);
//             res.status(500).json({
//                 ok: false,
//                 error: error.message
//             })
//         }
//     }