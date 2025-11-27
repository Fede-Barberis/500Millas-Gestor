import { 
    Producto, 
    Produccion, 
    DetalleProduccion, 
    MateriaPrima, 
    RecetaMateriaPrima,
    ConsumoExtra,
    Receta
} from "../models/index.js";

import db from "../config/database.js";

const produccionController =  {
    
    // =============================================================================
    // OBTENER DATOS
    // =============================================================================

    async getProduccion(req, res) {
        try {
            const producciones = await Produccion.findAll({
                include: [
                    { model: Receta },
                    { 
                        model: DetalleProduccion,
                        include: [Producto]
                    }
                ],
                order: [["fecha", "DESC"]]
            });

            return res.json(producciones);
        } catch(error) {
            console.log("Error en getProduccion:", error);
            res.status(500).json({
                error: "Error al obtener los datos de producción",
                message: error.message
            });
        }
    },

    async getRecetas(req, res) {
        try {
            const recetas = await Receta.findAll();
            return res.json(recetas);
        } catch(error) {
            console.log("Error en getRecetas:", error);
            res.status(500).json({
                error: "Error al obtener las recetas",
                message: error.message
            });
        }
    },

    async getProductos(req, res) {
        try {
            const productos = await Producto.findAll();
            return res.json(productos);
        } catch(error) {
            console.log("Error en getProductos:", error);
            res.status(500).json({
                error: "Error al obtener los productos",
                message: error.message
            });
        }
    },

    // =============================================================================
    // FUNCIONES AUXILIARES - STOCK DE MATERIA PRIMA
    // =============================================================================

    async descontarStockMateriaPrima(id_materiaPrima, cantidad, transaction) {
        const mp = await MateriaPrima.findByPk(id_materiaPrima, { transaction });

        if (!mp) throw new Error("Materia prima no encontrada");

        if (parseFloat(mp.stock) < cantidad) {
            throw new Error(`Stock insuficiente de ${mp.nombre}. Necesita ${cantidad}, hay ${mp.stock}`);
        }

        await mp.update(
            { stock: parseFloat(mp.stock) - cantidad },
            { transaction }
        );
    },

    async devolverStockMateriaPrima(id_materiaPrima, cantidad, transaction) {
        const mp = await MateriaPrima.findByPk(id_materiaPrima, { transaction });
        
        if (!mp) throw new Error("Materia prima no encontrada");

        await mp.update(
            { stock: parseFloat(mp.stock) + cantidad },
            { transaction }
        );
    },

    // =============================================================================
    // FUNCIONES AUXILIARES - INGREDIENTES DE RECETA
    // =============================================================================

    async descontarIngredientesDeReceta(id_receta, transaction) {
        const ingredientes = await RecetaMateriaPrima.findAll({
            where: { id_receta },
            transaction
        });

        for (const ing of ingredientes) {
            const total = parseFloat(ing.cantidad_necesaria);
            await produccionController.descontarStockMateriaPrima(ing.id_materiaPrima, total, transaction);
        }
    },

    async devolverIngredientesDeReceta(id_receta, transaction) {
        const ingredientes = await RecetaMateriaPrima.findAll({
            where: { id_receta },
            transaction
        });

        for (const ing of ingredientes) {
            const total = parseFloat(ing.cantidad_necesaria);
            await produccionController.devolverStockMateriaPrima(ing.id_materiaPrima, total, transaction);
        }
    },

    // =============================================================================
    // FUNCIONES AUXILIARES - CONSUMOS EXTRA (POR PRODUCTO)
    // =============================================================================

    async procesarConsumosExtra(id_producto, cantidad, transaction) {
        const extras = await ConsumoExtra.findAll({
            where: { id_producto },
            transaction
        });

        for (const ext of extras) {
            // Dulce de leche → proporcional a cantidad
            if (ext.id_materiaPrima) {
                const total = cantidad * parseFloat(ext.cantidad_por_lote) / ext.lote_equivale;
                await produccionController.descontarStockMateriaPrima(ext.id_materiaPrima, total, transaction);
            }

            // Glasee → receta completa por lote
            if (ext.id_receta) {
                const lotes = Math.ceil(cantidad / ext.lote_equivale);
                const ingredientes = await RecetaMateriaPrima.findAll({
                    where: { id_receta: ext.id_receta },
                    transaction
                });

                for (const ing of ingredientes) {
                    const total = lotes * parseFloat(ing.cantidad_necesaria);
                    await produccionController.descontarStockMateriaPrima(ing.id_materiaPrima, total, transaction);
                }
            }
        }
    },

    async devolverConsumosExtra(id_producto, cantidad, transaction) {
        const extras = await ConsumoExtra.findAll({
            where: { id_producto },
            transaction
        });

        for (const ext of extras) {
            // Dulce de leche → proporcional a cantidad
            if (ext.id_materiaPrima) {
                const total = cantidad * parseFloat(ext.cantidad_por_lote) / ext.lote_equivale;
                await produccionController.devolverStockMateriaPrima(ext.id_materiaPrima, total, transaction);
            }

            // Glasee → receta completa por lote
            if (ext.id_receta) {
                const lotes = Math.ceil(cantidad / ext.lote_equivale);
                const ingredientes = await RecetaMateriaPrima.findAll({
                    where: { id_receta: ext.id_receta },
                    transaction
                });

                for (const ing of ingredientes) {
                    const total = lotes * parseFloat(ing.cantidad_necesaria);
                    await produccionController.devolverStockMateriaPrima(ing.id_materiaPrima, total, transaction);
                }
            }
        }
    },

    // =============================================================================
    // CREAR PRODUCCIÓN
    // =============================================================================

    async crearProduccion(req, res) {
        const t = await db.transaction();

        try {
            const { fecha, id_receta, detalles } = req.body;

            // 1. Crear producción
            const produccion = await Produccion.create({ fecha, id_receta }, { transaction: t });

            // 2. Descontar receta base una sola vez
            await produccionController.descontarIngredientesDeReceta(id_receta, t);

            // 3. Crear detalles de producción y procesar consumos extra
            for (const det of detalles) {
                const { id_producto, cantidad, fch_vencimiento, lote } = det;

                await DetalleProduccion.create({
                    id_produccion: produccion.id_produccion,
                    id_producto,
                    cantidad,
                    fch_vencimiento,
                    lote
                }, { transaction: t });

                // Actualizar stock del producto
                const prod = await Producto.findByPk(id_producto, { transaction: t });
                
                if (!prod) {
                    throw new Error(`Producto ${id_producto} no encontrado`);
                }

                await prod.update({ 
                    stock: parseFloat(prod.stock) + parseFloat(cantidad) 
                }, { transaction: t });

                // Procesar consumos extra
                await produccionController.procesarConsumosExtra(id_producto, cantidad, t);
            }

            await t.commit();

            const produccionConDetalles = await Produccion.findByPk(produccion.id_produccion, {
                include: [
                    {
                        model: DetalleProduccion,
                        include: [Producto]
                    }
                ]
            });

            res.json({
                ok: true,
                produccion: produccionConDetalles,
                message: "Producción creada correctamente"
            });

        } catch (error) {
            await t.rollback();
            console.error('Error en crearProduccion:', error);
            res.status(500).json({ ok: false, error: error.message });
        }
    },

    // =============================================================================
    // EDITAR PRODUCCIÓN
    // =============================================================================

    async editarProduccion(req, res) {
        const { id } = req.params;
        const { fecha, id_receta, detalles } = req.body;

        const t = await db.transaction();

        try {
            // Buscar producción existente
            const produccion = await Produccion.findByPk(id, {
                include: [{ model: DetalleProduccion }],
                transaction: t
            });

            if (!produccion) {
                throw new Error("Producción no encontrada");
            }

            const detallesAntiguos = produccion.DetalleProduccions || [];

            // -----------------------------------
            // PASO 1: DEVOLVER STOCKS ANTIGUOS
            // -----------------------------------
            
            // 1.1 Devolver ingredientes de la receta anterior
            await produccionController.devolverIngredientesDeReceta(produccion.id_receta, t);

            // 1.2 Devolver productos terminados y consumos extra
            for (const old of detallesAntiguos) {
                // Devolver producto terminado
                const prod = await Producto.findByPk(old.id_producto, { transaction: t });
                
                if (!prod) {
                    throw new Error(`Producto ${old.id_producto} no encontrado`);
                }

                await prod.update(
                    { stock: parseFloat(prod.stock) - parseFloat(old.cantidad) },
                    { transaction: t }
                );

                // Devolver consumos extra
                await produccionController.devolverConsumosExtra(old.id_producto, old.cantidad, t);
            }

            // -----------------------------------
            // PASO 2: LIMPIAR Y ACTUALIZAR
            // -----------------------------------
            
            // 2.1 Eliminar detalles antiguos
            await DetalleProduccion.destroy({
                where: { id_produccion: id },
                transaction: t
            });

            // 2.2 Actualizar cabecera de producción
            await produccion.update({ fecha, id_receta }, { transaction: t });

            // -----------------------------------
            // PASO 3: APLICAR NUEVOS STOCKS
            // -----------------------------------
            
            if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
                throw new Error('Debes agregar al menos un producto');
            }

            // 3.1 Descontar ingredientes de la nueva receta
            await produccionController.descontarIngredientesDeReceta(id_receta, t);

            // 3.2 Crear nuevos detalles y actualizar stocks
            for (const d of detalles) {
                await DetalleProduccion.create({
                    id_produccion: id,
                    id_producto: d.id_producto,
                    cantidad: d.cantidad,
                    lote: d.lote,
                    fch_vencimiento: d.fch_vencimiento
                }, { transaction: t });

                // Sumar producto terminado al stock
                const prod = await Producto.findByPk(d.id_producto, { transaction: t });
                
                if (!prod) {
                    throw new Error(`Producto ${d.id_producto} no encontrado`);
                }

                await prod.update(
                    { stock: parseFloat(prod.stock) + parseFloat(d.cantidad) },
                    { transaction: t }
                );

                // Procesar consumos extra
                await produccionController.procesarConsumosExtra(d.id_producto, d.cantidad, t);
            }

            await t.commit();
            
            res.json({ 
                ok: true,
                message: "Producción actualizada correctamente" 
            });

        } catch (err) {
            await t.rollback();
            console.error('Error en editarProducción:', err);
            res.status(400).json({ 
                ok: false, 
                error: err.message 
            });
        }
    },

    // =============================================================================
    // ELIMINAR PRODUCCIÓN
    // =============================================================================

    async eliminarProduccion(req, res) {
        const { id } = req.params;
        const t = await db.transaction();

        try {
            const produccion = await Produccion.findByPk(id, {
                include: [
                    { model: Receta },
                    { 
                        model: DetalleProduccion,
                        include: [Producto]
                    }
                ],
                transaction: t
            });

            if (!produccion) {
                await t.rollback();
                return res.status(404).json({ 
                    ok: false,
                    error: "Producción no encontrada" 
                });
            }

            const detalles = produccion.DetalleProduccions || [];

            // -----------------------------------
            // PASO 1: DEVOLVER STOCKS
            // -----------------------------------

            // 1.1 Devolver receta base
            await produccionController.devolverIngredientesDeReceta(produccion.id_receta, t);

            // 1.2 Devolver productos terminados y consumos extra
            for (const det of detalles) {
                // Devolver producto terminado
                const prod = await Producto.findByPk(det.id_producto, { transaction: t });
                
                if (!prod) {
                    throw new Error(`Producto ${det.id_producto} no encontrado`);
                }

                await prod.update(
                    { stock: parseFloat(prod.stock) - parseFloat(det.cantidad) },
                    { transaction: t }
                );

                // Devolver consumos extra (DDL / Glasee)
                await produccionController.devolverConsumosExtra(det.id_producto, det.cantidad, t);
            }

            // -----------------------------------
            // PASO 2: ELIMINAR REGISTROS
            // -----------------------------------

            // 2.1 Borrar detalles
            await DetalleProduccion.destroy({
                where: { id_produccion: id },
                transaction: t
            });

            // 2.2 Borrar producción
            await produccion.destroy({ transaction: t });

            await t.commit();
            
            return res.json({ 
                ok: true,
                message: "Producción eliminada y stocks revertidos correctamente"
            });

        } catch(error) {
            await t.rollback();
            console.error("Error en eliminarProduccion:", error);
            res.status(500).json({
                ok: false,
                error: "Error al eliminar la producción",
                message: error.message
            });
        }
    },

    // =============================================================================
    // FUNCIÓN AUXILIAR - OBTENER PRODUCCIÓN COMPLETA
    // =============================================================================

    async obtenerProduccionCompleta(id, transaction) {
        return await Produccion.findByPk(id, {
            include: [
                { model: Receta },
                { 
                    model: DetalleProduccion, 
                    include: [{ model: Producto }]
                }
            ],
            transaction
        });
    },
};

export default produccionController;