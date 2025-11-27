import { 
    Producto, 
} from "../models/index.js";

import db from "../config/database.js";

const productoController =  {
    
    async crearProducto(req, res) {
        try {
            const { nombre, stock, imagen } = req.body;

            // 1. Crear producción
            const producto = await Producto.create({ nombre, stock, imagen }, { transaction: t });

            res.json({
                ok: true,
                producto,
                message: "Producto creado correctamente"
            });

        } catch (error) {
            console.error('Error en crearProducto:', error);
            res.status(500).json({ ok: false, error: error.message });
        }
    },
}

export default productoController;