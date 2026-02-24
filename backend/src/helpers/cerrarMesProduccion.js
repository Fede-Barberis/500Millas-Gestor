import { Op } from "sequelize";
import db from "../config/database.js";
import path from "path";

import {
    Produccion,
    DetalleProduccion,
    Producto,
    ReporteMensual,
    Venta,
    Pedido,
    VentaDetalle,
    CompraMP
} from "../models/index.js";

import generarPdfReporte from "./generarPdfReporte.js";

function normalizarNombre(nombre = "") {
    return String(nombre).toLowerCase();
}

function esAlfajor(producto) {
    const n = normalizarNombre(producto?.producto || producto?.nombre);
    // Si el nombre indica galleta, no debe contarse como alfajor
    // aunque el tipo de producto venga mal cargado en DB.
    if (n.includes("galleta")) return false;
    return producto?.tipo_producto === "ALFAJOR" || n.includes("alfajor");
}

function esGalletaConSemilla(producto) {
    const n = normalizarNombre(producto?.producto || producto?.nombre);
    return n.includes("c/s") || n.includes("con semilla");
}

function esGalletaSinSemilla(producto) {
    const n = normalizarNombre(producto?.producto || producto?.nombre);
    return n.includes("s/s") || n.includes("sin semilla");
}

async function obtenerMetricasMes(mes, anio, transaction, strictProduccion = false) {
    const fechaInicio = new Date(anio, mes - 1, 1, 0, 0, 0);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const producciones = await Produccion.findAll({
        where: { fecha: { [Op.between]: [fechaInicio, fechaFin] } },
        include: [{ model: DetalleProduccion, include: [Producto] }],
        transaction
    });

    if (strictProduccion && producciones.length === 0) {
        throw new Error(`No hay producciones para ${mes}/${anio}`);
    }

    const porProducto = new Map();
    let totalTapasMes = 0;

    producciones.forEach((produccion) => {
        produccion.DetalleProduccions?.forEach((detalle) => {
            if (!detalle.Producto) return;

            const key = String(detalle.Producto.id_producto);
            const actual = porProducto.get(key) ?? {
                id_producto: detalle.Producto.id_producto,
                producto: detalle.Producto.nombre,
                tipo_producto: detalle.Producto.tipo_producto,
                cantidadProducida: 0,
                cantidadVendida: 0,
                cantidadTapas: 0,
                ingresos: 0
            };

            const cantidad = Number(detalle.cantidad || 0);
            const tapas = Number(detalle.tapas || 0);

            actual.cantidadProducida += cantidad;
            actual.cantidadTapas += tapas;
            totalTapasMes += tapas;
            porProducto.set(key, actual);
        });
    });

    const totalVentas = await Venta.count({
        where: { fecha: { [Op.between]: [fechaInicio, fechaFin] } },
        transaction
    });

    const totalPedidos = await Pedido.count({
        where: { fecha_entrega: { [Op.between]: [fechaInicio, fechaFin] } },
        transaction
    });

    const ventasDetalleMes = await VentaDetalle.findAll({
        include: [
            {
                model: Venta,
                attributes: ["id_venta", "fecha"],
                where: { fecha: { [Op.between]: [fechaInicio, fechaFin] } },
                required: true
            },
            {
                model: Producto,
                attributes: ["id_producto", "nombre", "tipo_producto"],
                required: true
            }
        ],
        transaction
    });

    ventasDetalleMes.forEach((detalle) => {
        const producto = detalle.Producto;
        if (!producto) return;

        const key = String(producto.id_producto);
        const actual = porProducto.get(key) ?? {
            id_producto: producto.id_producto,
            producto: producto.nombre,
            tipo_producto: producto.tipo_producto,
            cantidadProducida: 0,
            cantidadVendida: 0,
            cantidadTapas: 0,
            ingresos: 0
        };

        const cantidadVendida = Number(detalle.cantidad || 0);
        const precioUnitario = Number(detalle.precio || 0);

        actual.cantidadVendida += cantidadVendida;
        actual.ingresos += cantidadVendida * precioUnitario;
        porProducto.set(key, actual);
    });

    const resumenPorProducto = Array.from(porProducto.values()).sort((a, b) =>
        a.producto.localeCompare(b.producto)
    );

    const totalIngresos = resumenPorProducto.reduce((sum, item) => sum + item.ingresos, 0);
    const totalEgresosInsumos = Number(
        (await CompraMP.sum("precio", {
            where: { fecha: { [Op.between]: [fechaInicio, fechaFin] } },
            transaction
        })) || 0
    );
    const diferenciaMes = totalIngresos - totalEgresosInsumos;

    const docenasAlfajoresMes = resumenPorProducto
        .filter((p) => esAlfajor(p))
        .reduce((sum, p) => sum + Number(p.cantidadProducida || 0), 0);

    const docenasGalletasConSemillaMes = resumenPorProducto
        .filter((p) => esGalletaConSemilla(p))
        .reduce((sum, p) => sum + Number(p.cantidadProducida || 0), 0);

    const docenasGalletasSinSemillaMes = resumenPorProducto
        .filter((p) => esGalletaSinSemilla(p))
        .reduce((sum, p) => sum + Number(p.cantidadProducida || 0), 0);

    return {
        mes,
        anio,
        totalProducciones: producciones.length,
        totalTapasMes,
        totalVentas,
        totalPedidos,
        resumenPorProducto,
        totalIngresos,
        totalEgresosInsumos,
        diferenciaMes,
        docenasAlfajoresMes,
        docenasGalletasConSemillaMes,
        docenasGalletasSinSemillaMes
    };
}

export async function cerrarMesProduccion(mes, anio) {
    const t = await db.transaction();

    try {
        const yaCerrado = await ReporteMensual.findOne({
            where: { mes, año: anio },
            transaction: t
        });

        if (yaCerrado) throw new Error(`El mes ${mes}/${anio} ya fue cerrado`);

        const ahora = new Date();
        const ultimoDiaMes = new Date(anio, mes, 0, 23, 59, 59);
        if (ahora < ultimoDiaMes) {
            throw new Error(`No se puede cerrar el mes ${mes}/${anio} antes de su finalización`);
        }

        const metricasMesActual = await obtenerMetricasMes(mes, anio, t, true);

        let acumuladoAlfajoresUnidades = 0;
        let acumuladoGalletasConSemillaUnidades = 0;
        let acumuladoGalletasSinSemillaUnidades = 0;
        let acumuladoTapas = 0;

        const resumenMensualAcumulado = [];
        for (let mesIdx = 1; mesIdx <= mes; mesIdx += 1) {
            const m = await obtenerMetricasMes(mesIdx, anio, t, false);

            acumuladoAlfajoresUnidades += m.docenasAlfajoresMes * 12;
            acumuladoGalletasConSemillaUnidades += m.docenasGalletasConSemillaMes * 12;
            acumuladoGalletasSinSemillaUnidades += m.docenasGalletasSinSemillaMes * 12;
            acumuladoTapas += m.totalTapasMes;

            resumenMensualAcumulado.push({
                mes: mesIdx,
                docenasAlfajoresMes: m.docenasAlfajoresMes,
                alfajoresUnidadesMes: m.docenasAlfajoresMes * 12,
                docenasGalletasConSemillaMes: m.docenasGalletasConSemillaMes,
                galletasConSemillaUnidadesMes: m.docenasGalletasConSemillaMes * 12,
                docenasGalletasSinSemillaMes: m.docenasGalletasSinSemillaMes,
                galletasSinSemillaUnidadesMes: m.docenasGalletasSinSemillaMes * 12,
                tapasMes: m.totalTapasMes,
                alfajoresUnidadesAcumulado: acumuladoAlfajoresUnidades,
                galletasConSemillaUnidadesAcumulado: acumuladoGalletasConSemillaUnidades,
                galletasSinSemillaUnidadesAcumulado: acumuladoGalletasSinSemillaUnidades,
                tapasAcumulado: acumuladoTapas
            });
        }

        const archivoPdf = await generarPdfReporte({
            mes,
            anio,
            resumenPorProducto: metricasMesActual.resumenPorProducto,
            totalIngresos: metricasMesActual.totalIngresos,
            totalEgresosInsumos: metricasMesActual.totalEgresosInsumos,
            diferenciaMes: metricasMesActual.diferenciaMes,
            resumenMensualAcumulado
        });

        const reporte = await ReporteMensual.create({
            mes,
            año: anio,
            total_tapas: metricasMesActual.totalTapasMes,
            total_producciones: metricasMesActual.totalProducciones,
            archivo_pdf: path.basename(archivoPdf)
        }, { transaction: t });

        await t.commit();

        return {
            ok: true,
            cierre: {
                mes,
                anio,
                totalProducciones: metricasMesActual.totalProducciones,
                totalTapasMes: metricasMesActual.totalTapasMes,
                totalVentas: metricasMesActual.totalVentas,
                totalPedidos: metricasMesActual.totalPedidos,
                totalIngresos: metricasMesActual.totalIngresos,
                totalEgresosInsumos: metricasMesActual.totalEgresosInsumos,
                diferenciaMes: metricasMesActual.diferenciaMes,
                archivoPdf
            },
            reporteId: reporte.id_reporte
        };
    } catch (error) {
        await t.rollback();
        console.error("Error en cerrarMesProduccion:", error);
        throw error;
    }
}
