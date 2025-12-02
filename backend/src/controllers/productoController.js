import { 
    DetalleProduccion,
    Produccion,
    Producto,
    Venta, 
} from "../models/index.js";

import { Op } from "sequelize";

const productoController =  {
    
    async crearProducto(req, res) {
        try {
            const { nombre, stock } = req.body;

            // 1. Crear producción
            const producto = await Producto.create({ nombre, stock });

            res.json({
                ok: true,
                producto,
                message: "Producto creado correctamente"
            });

        } catch (error) {
            console.error('Error en crearProducto:', error);
            res.status(500).json({ 
                ok: false, 
                error: error.message 
            });
        }
    },

    async eliminarProducto (req, res) {
        try {
            const { id_producto } = req.params;
            const producto = await Producto.findByPk(id_producto)

            if (!producto) {
                return res.status(404).json({ 
                    ok: false,
                    error: "Producto no encontrado" 
                });
            }

            await producto.destroy(id_producto)
            
            return res.json({ 
                ok: true,
                message: "Producto eliminado",
                producto
            });
        } catch(error) {
            console.log("Error en eliminarProducto:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },

    async editarProducto (req, res) {
        try {
            const { id_producto } = req.params;
            const producto = await Producto.findByPk(id_producto);

            if (!producto) return res.status(404).json({ 
                ok: false, 
                error: "Producto no encontrado" 
            });

            await producto.update({
                nombre: req.body.nombre,
                stock: req.body.stock
            });
            
            res.json({ 
                ok: true,
                message: "Producto actualizado correctamente",
                producto
            });

        } catch(error) {
            console.log("Errorn en editarProducto:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },


    async obtenerMovimientosProducto (req,res) {
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

            const disminuciones = await Venta.count({
                where: {
                    id_producto,
                    fecha: {
                        [Op.between]: [haceUnaSemana, hoy]
                    }
                }
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