import { Op } from "sequelize";
import { StockMovimiento, Producto, MateriaPrima, Usuario } from "../models/index.js";

const stockMovimientoController = {
    async listar(req, res) {
        try {
            const pagina = Math.max(1, Number.parseInt(req.query.pagina, 10) || 1);
            const limite = Math.min(100, Math.max(1, Number.parseInt(req.query.limite, 10) || 50));
            const where = {};
            const { clase, tipo, desde, hasta, buscar } = req.query;

            if (["producto", "materia_prima"].includes(clase)) where.clase_articulo = clase;
            if (tipo) where.tipo = tipo;
            if (desde || hasta) {
                where.fecha = {};
                if (desde) where.fecha[Op.gte] = new Date(`${desde}T00:00:00`);
                if (hasta) where.fecha[Op.lte] = new Date(`${hasta}T23:59:59.999`);
            }
            if (buscar?.trim()) {
                const termino = `%${buscar.trim()}%`;
                where[Op.or] = [
                    { articulo_nombre: { [Op.like]: termino } },
                    { observacion: { [Op.like]: termino } },
                    { origen_tipo: { [Op.like]: termino } },
                    { origen_id: Number.isNaN(Number(buscar)) ? -1 : Number(buscar) }
                ];
            }

            const resultado = await StockMovimiento.findAndCountAll({
                where,
                include: [
                    { model: Producto, as: "Producto", attributes: ["id_producto", "nombre"], required: false },
                    { model: MateriaPrima, as: "MateriaPrima", attributes: ["id_materiaPrima", "nombre"], required: false },
                    { model: Usuario, as: "Usuario", attributes: ["id", "name"], required: false }
                ],
                order: [["fecha", "DESC"], ["id_movimiento", "DESC"]],
                limit: limite,
                offset: (pagina - 1) * limite,
                distinct: true
            });

            return res.json({ movimientos: resultado.rows, total: resultado.count, pagina, limite, paginas: Math.ceil(resultado.count / limite) });
        } catch (error) {
            console.error("Error al listar movimientos de stock:", error);
            return res.status(500).json({ ok: false, error: "No se pudo cargar el historial de movimientos" });
        }
    }
};

export default stockMovimientoController;
