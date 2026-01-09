import { 
    Producto, 
    Produccion, 
    DetalleProduccion, 
    Receta
} from "../models/index.js";

import db from "../config/database.js";

import actualizarStockProducto from "../helpers/actualizarStockProducto.js";
import { procesarReceta } from "../helpers/procesarReceta.js";
import procesarConsumoExtra from "../helpers/procesarConsumoExtra.js";

const produccionController = {

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

            res.json(producciones);
        } catch (error) {
            console.error("Error en getProduccion:", error);
            res.status(500).json({
                error: "Error al obtener los datos de producción",
                message: error.message
            });
        }
    },

    async getRecetas(req, res) {
        try {
            const recetas = await Receta.findAll();
            res.json(recetas);
        } catch (error) {
            console.error("Error en getRecetas:", error);
            res.status(500).json({
                error: "Error al obtener las recetas",
                message: error.message
            });
        }
    },

    async getProductos(req, res) {
        try {
            const productos = await Producto.findAll();
            res.json(productos);
        } catch (error) {
            console.error("Error en getProductos:", error);
            res.status(500).json({
                error: "Error al obtener los productos",
                message: error.message
            });
        }
    },

    
    async crearProduccion(req, res) {
        const t = await db.transaction();

        try {
            const { fecha, id_receta, detalles } = req.body;

            if (!Array.isArray(detalles) || detalles.length === 0) {
                throw new Error("Debes agregar al menos un producto");
            }

            // Crear producción
            const produccion = await Produccion.create(
                { fecha, id_receta },
                { transaction: t }
            );

            // Descontar receta base
            await procesarReceta(id_receta, "sub", t);

            // Crear detalles y actualizar stocks
            for (const det of detalles) {
                const { id_producto, cantidad, fch_vencimiento, lote } = det;
                
                const producto = await Producto.findByPk(id_producto);

                // Calcular tapas según tipo de producto
                const tapas = producto.nombre === "Alfajor" 
                    ? cantidad * 12 * 3 
                    : cantidad * 48;

                await DetalleProduccion.create({
                    id_produccion: produccion.id_produccion,
                    id_producto,
                    cantidad,
                    tapas,
                    fch_vencimiento,
                    lote
                }, { transaction: t });

                // Producto terminado
                await actualizarStockProducto(id_producto, cantidad, "add", t);

                // Consumos extra
                await procesarConsumoExtra(id_producto, cantidad, "sub", t);
            }

            await t.commit();

            res.json({
                ok: true,
                message: "Producción creada correctamente"
            });

        } catch (error) {
            await t.rollback();
            console.error("Error en crearProduccion:", error);
            res.status(500).json({ ok: false, error: error.message });
        }
    },


    async editarProduccion(req, res) {
        const { id } = req.params;
        const { fecha, id_receta, detalles } = req.body;
        const t = await db.transaction();

        try {
            if (!Array.isArray(detalles) || detalles.length === 0) {
                throw new Error("Debes agregar al menos un producto");
            }

            const produccion = await Produccion.findByPk(id, {
                include: [{ model: DetalleProduccion }],
                transaction: t
            });

            if (!produccion) {
                throw new Error("Producción no encontrada");
            }

            // Revertir stock
            await procesarReceta(produccion.id_receta, "add", t);

            for (const det of produccion.DetalleProduccions) {
                await actualizarStockProducto(det.id_producto, det.cantidad, "sub", t);
                await procesarConsumoExtra(det.id_producto, det.cantidad, "add", t);
            }

            // Limpiar y actualizar
            await DetalleProduccion.destroy({
                where: { id_produccion: id },
                transaction: t
            });

            await produccion.update({ fecha, id_receta }, { transaction: t });

            // Aplicar nuevo stock
            await procesarReceta(id_receta, "sub", t);

            for (const det of detalles) {
                const producto = det.Producto || await Producto.findByPk(det.id_producto);

                const tapas = producto.nombre === "Alfajor"
                    ? det.cantidad * 12 * 3
                    : det.cantidad * 48;

                await DetalleProduccion.create({
                    id_produccion: id,
                    id_producto: det.id_producto,
                    cantidad: det.cantidad,
                    lote: det.lote,
                    fch_vencimiento: det.fch_vencimiento,
                    tapas
                }, { transaction: t });

                await actualizarStockProducto(det.id_producto, det.cantidad, "add", t);
                await procesarConsumoExtra(det.id_producto, det.cantidad, "sub", t);
            }

            await t.commit();

            res.json({
                ok: true,
                message: "Producción actualizada correctamente"
            });

        } catch (error) {
            await t.rollback();
            console.error("Error en editarProduccion:", error);
            res.status(400).json({ ok: false, error: error.message });
        }
    },

    
    // Eliminar produccion
    async eliminarProduccion(req, res) {
        const { id } = req.params;
        const t = await db.transaction();

        try {
            const produccion = await Produccion.findByPk(id, {
                include: [{ model: DetalleProduccion }],
                transaction: t
            });

            if (!produccion) {
                throw new Error("Producción no encontrada");
            }

            // Revertir stocks
            await procesarReceta(produccion.id_receta, "add", t);

            for (const det of produccion.DetalleProduccions) {
                await actualizarStockProducto(det.id_producto, det.cantidad, "sub", t);
                await procesarConsumoExtra(det.id_producto, det.cantidad, "add", t);
            }

            // Eliminar registros
            await DetalleProduccion.destroy({
                where: { id_produccion: id },
                transaction: t
            });

            await produccion.destroy({ transaction: t });

            await t.commit();

            res.json({
                ok: true,
                message: "Producción eliminada correctamente"
            });

        } catch (error) {
            await t.rollback();
            console.error("Error en eliminarProduccion:", error);
            res.status(500).json({ ok: false, error: error.message });
        }
    },

    
    async obtenerProduccionCompleta(id, transaction) {
        return await Produccion.findByPk(id, {
            include: [
                { model: Receta },
                {
                    model: DetalleProduccion,
                    include: [Producto]
                }
            ],
            transaction
        });
    }
};

export default produccionController;
