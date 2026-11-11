export function interpretarVentaPagada(valor) {
    if (typeof valor === "string") return ["1", "true", "si", "sí", "yes", "y"].includes(valor.trim().toLowerCase());
    return valor === true || valor === 1;
}

export function obtenerTotalVenta(venta) {
    const totalApi = Number(venta?.total);
    const detalles = venta?.VentaDetalles || venta?.detalles || [];
    const totalDetalles = detalles.reduce((sum, detalle) => sum + Number(detalle.precio || 0) * Number(detalle.cantidad || 0), 0);
    return Number.isFinite(totalApi) && (totalApi > 0 || totalDetalles === 0) ? totalApi : totalDetalles;
}

export function obtenerSaldoVenta(venta) {
    if (interpretarVentaPagada(venta?.isPagado)) return 0;
    const total = obtenerTotalVenta(venta);
    const abonadoApi = Number(venta?.total_pagado);
    const abonadoRecibos = (venta?.recibos_asociados || []).reduce((sum, recibo) => sum + Number(recibo.importe || 0), 0);
    const abonado = Number.isFinite(abonadoApi) && abonadoApi > 0 ? abonadoApi : abonadoRecibos;
    const saldoCalculado = Math.max(0, Math.round((total - abonado) * 100) / 100);
    const saldoApi = Number(venta?.saldo_pendiente);
    return Number.isFinite(saldoApi) && saldoApi > 0 ? Math.min(saldoApi, saldoCalculado) : saldoCalculado;
}
