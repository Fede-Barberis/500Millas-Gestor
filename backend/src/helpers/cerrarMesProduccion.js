import { Op } from "sequelize";
import db from "../config/database.js";
import path from "path";


import {
    Produccion,
    DetalleProduccion,
    Producto,
    ReporteMensual,
    Venta,
    Pedido
} from "../models/index.js";

import generarPdfReporte from "./generarPdfReporte.js";

export async function cerrarMesProduccion(mes, año) {
    const t = await db.transaction();

    try {
        // ==============================
        // 1️⃣ Validaciones iniciales
        // ==============================
        const yaCerrado = await ReporteMensual.findOne({
            where: { mes, año },
            transaction: t
        });

        if (yaCerrado) {
            throw new Error(`El mes ${mes}/${año} ya fue cerrado`);
        }

        const ahora = new Date();
        const ultimoDiaMes = new Date(año, mes, 0, 23, 59, 59);

        if (ahora < ultimoDiaMes) {
            throw new Error(
                `No se puede cerrar el mes ${mes}/${año} antes de su finalización`
            );
        }

        const fechaInicio = new Date(año, mes - 1, 1, 0, 0, 0);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);

        // ==============================
        // 2️⃣ Producciones del mes
        // ==============================
        const producciones = await Produccion.findAll({
            where: {
                fecha: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            },
            include: [
                {
                    model: DetalleProduccion,
                    include: [Producto]
                }
            ],
            transaction: t
        });

        if (producciones.length === 0) {
            throw new Error(`No hay producciones para ${mes}/${año}`);
        }

        // ==============================
        // 3️⃣ Flatten de detalles
        // ==============================
        const detalles = [];

        producciones.forEach(p => {
            p.DetalleProduccions?.forEach(d => {
                detalles.push({
                    producto: d.Producto?.nombre,
                    cantidad: Number(d.cantidad || 0),
                    tapas: Number(d.tapas || 0)
                });
            });
        });

        // ==============================
        // 4️⃣ Totales generales
        // ==============================
        const totalProducciones = producciones.length;
        const totalTapasMes = detalles.reduce((sum, d) => sum + d.tapas, 0);

        // ==============================
        // 5️⃣ Tapas por producto (MES)
        // ==============================
        const porProductoMes = {};

        detalles.forEach(d => {
            if (!d.producto) return;

            if (!porProductoMes[d.producto]) {
                porProductoMes[d.producto] = { tapas: 0 };
            }

            porProductoMes[d.producto].tapas += d.tapas;
        });

        const tapasPorProducto = Object.entries(porProductoMes).map(
            ([producto, data]) => ({
                producto,
                tapas: data.tapas
            })
        );

        // ==============================
        // 6️⃣ Producción por tipo
        // ==============================
        let alfajoresProducidos = 0;
        let galletasMarinasSSProducidas = 0;
        let galletasMarinasCSProducidas = 0;

        detalles.forEach(d => {
            if (!d.producto) return;

            const nombre = d.producto.toLowerCase();

            if (nombre.includes("alfajor")) {
                alfajoresProducidos += d.cantidad;
            } else if (nombre.includes("s/s")) {
                galletasMarinasSSProducidas += d.cantidad;
            } else if (nombre.includes("c/s")) {
                galletasMarinasCSProducidas += d.cantidad;
            }
        });

        // ==============================
        // 7️⃣ Stocks actuales
        // ==============================
        const stocks = await Producto.findAll({
            attributes: [
                ['id_producto', 'id_producto'],
                'nombre',
                'stock'
            ],
            transaction: t
        });

        // ==============================
        // 8️⃣ Ventas y pedidos del mes
        // ==============================
        const totalVentas = await Venta.count({
            where: {
                fecha: { [Op.between]: [fechaInicio, fechaFin] }
            },
            transaction: t
        });

        const totalPedidos = await Pedido.count({
            where: {
                fecha_entrega: { [Op.between]: [fechaInicio, fechaFin] }
            },
            transaction: t
        });


        // ==============================
        // 🔟 Generar PDF
        // ==============================
        const archivoPdf = await generarPdfReporte({
            mes,
            año,
            totalProducciones,
            totalVentas,
            totalPedidos,

            alfajoresProducidos,
            galletasMarinasSSProducidas,
            galletasMarinasCSProducidas,

            stocks,

            totalTapasMes,
            tapasPorProducto,
        });

        // ==============================
        // 1️⃣1️⃣ Guardar reporte
        // ==============================
        const reporte = await ReporteMensual.create({
            mes,
            año,
            total_tapas: totalTapasMes,
            total_producciones: totalProducciones,
            archivo_pdf: path.basename(archivoPdf)
        }, { transaction: t });

        await t.commit();

        return {
            ok: true,
            cierre: {
                mes,
                año,
                totalProducciones,
                totalTapasMes,
                totalVentas,
                totalPedidos,
                archivoPdf
            },
            reporteId: reporte.idreporte
        };

    } catch (error) {
        await t.rollback();
        console.error("❌ Error en cerrarMesProduccion:", error);
        throw error;
    }
}
