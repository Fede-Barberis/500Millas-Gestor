import { Producto, Venta, VentaDetalle, ReciboPago, ReciboPagoVenta, Remito } from '../models/index.js'
import actualizarStockProducto from "../helpers/actualizarStockProducto.js"
import db from "../config/database.js";

const interpretarPagado = (valor) => {
    if (typeof valor === "string") return ["1", "true", "si", "sí", "yes", "y"].includes(valor.trim().toLowerCase());
    return valor === true || valor === 1;
};


const ventaController = {

    async obtenerRecibos(req, res) {
        try {
            const recibos = await ReciboPago.findAll({
                include: [{ model: ReciboPagoVenta, include: [{ model: Venta, include: [{ model: VentaDetalle }] }] }],
                order: [["id_recibo", "DESC"]]
            });
            return res.json(recibos.map((recibo) => ({
                ...recibo.toJSON(),
                numero: `REC-${String(recibo.id_recibo).padStart(6, "0")}`,
                emisor: {
                    razonSocial: process.env.EMPRESA_RAZON_SOCIAL || "Alfajores 500 Millas",
                    cuit: process.env.EMPRESA_CUIT || null,
                    domicilio: process.env.EMPRESA_DOMICILIO || null,
                    telefono: process.env.EMPRESA_TELEFONO || null,
                    email: process.env.EMPRESA_EMAIL || null
                }
            })));
        } catch (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
    },

    async obtenerRemitos(req, res) {
        try {
            const remitos = await Remito.findAll({
                include: [{ model: Venta, attributes: ["id_venta", "persona", "fecha"] }],
                order: [["id_remito", "DESC"]]
            });
            return res.json(remitos.map((item) => ({
                ...item.documento,
                id_remito: item.id_remito,
                idVenta: item.id_venta,
                numeroRemito: item.numero_remito,
                fechaEmision: item.fecha_emision,
                cliente: item.Venta?.persona
            })));
        } catch (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
    },

    async crearRecibo(req, res) {
        const transaction = await db.transaction();
        try {
            const { ventas: ids, pagos, fecha_pago, fecha_emision, medio_pago, observaciones } = req.body;
            const solicitudesPago = Array.isArray(pagos) ? pagos : (Array.isArray(ids) ? ids.map((id_venta) => ({ id_venta })) : []);
            if (solicitudesPago.length === 0 || !fecha_pago || !medio_pago) {
                await transaction.rollback();
                return res.status(400).json({ ok: false, message: "Selecciona ventas e indica fecha y medio de pago" });
            }
            const ventaIds = [...new Set(solicitudesPago.map((item) => Number(item.id_venta)))];
            if (ventaIds.some((id) => !Number.isInteger(id) || id <= 0)) {
                await transaction.rollback();
                return res.status(400).json({ ok: false, message: "La selección contiene ventas inválidas" });
            }
            const seleccionadas = await Venta.findAll({
                where: { id_venta: ventaIds },
                include: [{ model: VentaDetalle }],
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (seleccionadas.length !== ventaIds.length) throw new Error("Una o más ventas ya no están disponibles");
            const cliente = seleccionadas[0].persona.trim();
            if (seleccionadas.some((v) => v.persona.trim().toLowerCase() !== cliente.toLowerCase())) {
                throw new Error("Un recibo solo puede incluir ventas del mismo cliente");
            }
            const pagosPrevios = await ReciboPagoVenta.findAll({ where: { id_venta: ventaIds }, transaction });
            const porVenta = new Map();
            pagosPrevios.forEach((p) => porVenta.set(p.id_venta, (porVenta.get(p.id_venta) || 0) + Number(p.importe)));
            const importes = seleccionadas.map((venta) => {
                if (interpretarPagado(venta.isPagado)) throw new Error(`La venta #${venta.id_venta} ya figura pagada`);
                const total = venta.VentaDetalles.reduce((sum, d) => sum + Number(d.precio) * Number(d.cantidad), 0);
                const restante = Math.round((total - (porVenta.get(venta.id_venta) || 0)) * 100) / 100;
                if (restante <= 0) throw new Error(`La venta #${venta.id_venta} no tiene saldo pendiente`);
                const solicitado = solicitudesPago.find((item) => Number(item.id_venta) === venta.id_venta);
                const importe = solicitado.importe == null ? restante : Math.round(Number(solicitado.importe) * 100) / 100;
                if (!Number.isFinite(importe) || importe <= 0 || importe > restante) throw new Error(`Importe inválido para la venta #${venta.id_venta}; el máximo es ${restante.toFixed(2)}`);
                return { venta, restante, importe };
            });
            const total = importes.reduce((sum, item) => sum + item.importe, 0);
            const recibo = await ReciboPago.create({
                fecha_pago, fecha_emision: fecha_emision || new Date().toLocaleDateString("en-CA"), cliente, medio_pago,
                observaciones: observaciones?.trim() || null, total
            }, { transaction });
            for (const { venta, restante, importe } of importes) {
                await ReciboPagoVenta.create({ id_recibo: recibo.id_recibo, id_venta: venta.id_venta, importe }, { transaction });
                await venta.update({ isPagado: importe >= restante }, { transaction });
            }
            await transaction.commit();
            return res.status(201).json({ ok: true, recibo: { ...recibo.toJSON(), numero: `REC-${String(recibo.id_recibo).padStart(6, "0")}`, emisor: { razonSocial: process.env.EMPRESA_RAZON_SOCIAL || "Alfajores 500 Millas", cuit: process.env.EMPRESA_CUIT || null, domicilio: process.env.EMPRESA_DOMICILIO || null, telefono: process.env.EMPRESA_TELEFONO || null, email: process.env.EMPRESA_EMAIL || null }, detalle: importes.map(({ venta, importe }) => ({ id_venta: venta.id_venta, fecha: venta.fecha, total: venta.VentaDetalles.reduce((s, d) => s + Number(d.precio) * Number(d.cantidad), 0), importe })) } });
        } catch (error) {
            if (!transaction.finished) await transaction.rollback();
            return res.status(400).json({ ok: false, error: error.message });
        }
    },
    
    async obtenerVentas (req, res) {
        try {
            const ventas = await Venta.findAll({
                include: [
                {
                    model: VentaDetalle,
                    include: [
                        { model: Producto }
                    ]
                },
                { model: Remito, attributes: ["numero_remito", "id_remito"] }
            ],
            order: [
                ["id_venta", "DESC"]
            ]
            })
            const pagos = await ReciboPagoVenta.findAll({
                where: { id_venta: ventas.map((venta) => venta.id_venta) },
                include: [{ model: ReciboPago, attributes: ["id_recibo", "fecha_pago"] }],
                order: [["id_recibo_venta", "ASC"]]
            });
            const pagosPorVenta = new Map();
            pagos.forEach((pago) => {
                const idVenta = Number(pago.id_venta);
                if (!pagosPorVenta.has(idVenta)) pagosPorVenta.set(idVenta, []);
                pagosPorVenta.get(idVenta).push(pago);
            });
            return res.json(ventas.map((venta) => {
                const json = venta.toJSON();
                const total = (json.VentaDetalles || []).reduce((sum, d) => sum + Number(d.precio || 0) * Number(d.cantidad || 0), 0);
                const pagosVenta = pagosPorVenta.get(Number(json.id_venta)) || [];
                const abonado = pagosVenta.reduce((sum, p) => sum + Number(p.importe || 0), 0);
                json.total = total;
                json.total_pagado = abonado;
                json.saldo_pendiente = interpretarPagado(json.isPagado) ? 0 : Math.max(0, Math.round((total - abonado) * 100) / 100);
                json.recibos_asociados = pagosVenta.map((p) => {
                    const idRecibo = p.ReciboPago?.id_recibo ?? p.id_recibo;
                    return {
                    id_recibo: idRecibo,
                    numero: idRecibo ? `REC-${String(idRecibo).padStart(6, "0")}` : null,
                    fecha_pago: p.ReciboPago?.fecha_pago,
                    importe: p.importe
                    };
                });
                json.remito_asociado = json.Remito ? {
                    id_remito: json.Remito.id_remito,
                    numero: json.Remito.numero_remito
                } : null;
                delete json.Remito;
                return json;
            }))

        } catch(error) {
            console.log("Error en obtenerVentas:", error);
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },
    
    async crearVenta(req, res) {
        const transaction = await db.transaction();

        try {
            const { fecha, persona, id_pedido, tipo, isPagado, detalles } = req.body;

            const tiposValidos = ["venta", "donacion", "cajas_negras", "consumo_propio"];
            const tipoNormalizado = tiposValidos.includes(tipo) ? tipo : "venta";

            if (!fecha || !persona || !Array.isArray(detalles) || detalles.length === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    ok: false,
                    message: "Fecha, persona y al menos un producto son obligatorios"
                });
            }

            // Normalizar pago
            let pago = ["true", "1", 1, true].includes(isPagado);

            // Normalizar pedido
            const pedidoNormalizado =
            id_pedido === "" || id_pedido === null || id_pedido === undefined
                ? null
                : Number(id_pedido);

            // Determinar si el movimiento es gratuito (solo donación y consumo propio)
            const esGratis = ["donacion", "consumo_propio"].includes(tipoNormalizado);
            if (esGratis) pago = true;

            // normalizar detalles
            const productosNormalizados = detalles.map(p => ({
                id_producto: p.id_producto,
                cantidad: Number(p.cantidad),
                precio: esGratis ? 0 : Number(p.precio ?? p.producto?.precio)
            }));

            // Validación final
            for (const item of productosNormalizados) {
                const productoBD = await Producto.findByPk(item.id_producto, { transaction });

                if (!productoBD) {
                    throw new Error(`El producto con ID ${item.id_producto} no existe.`);
                }

                if (Number(item.cantidad) > Number(productoBD.stock)) {
                    throw new Error(
                        `Stock insuficiente para ${productoBD.nombre}. ` +
                        `Stock actual: ${productoBD.stock}, solicitado: ${item.cantidad}`
                    );
                }
            }


            // Crear venta
            const venta = await Venta.create(
                { fecha, persona, id_pedido: pedidoNormalizado, tipo: tipoNormalizado, isPagado: pago },
                { transaction }
            );

            // Crear detalles y actualizar stock
            for (const item of productosNormalizados) {
                await VentaDetalle.create(
                    {
                        id_venta: venta.id_venta,
                        id_producto: item.id_producto,
                        cantidad: item.cantidad,
                        precio: item.precio
                    },
                    { transaction }
                );

                // Stock
                await actualizarStockProducto(
                    item.id_producto,
                    item.cantidad,
                    "sub",
                    transaction
                );
            }

            await transaction.commit();

            return res.json({ ok: true, venta });

        } catch (error) {
            console.log("Error en crearVenta:", error);
            await transaction.rollback();

            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    },


    async eliminarVenta (req, res) {
        const transaction = await db.transaction()

        try {
            const { id_venta } = req.params
            
            const venta = await Venta.findByPk(id_venta, { transaction })

            if(!venta) {
                await transaction.rollback()
                return res.status(404).json({
                    ok: false,
                    message: "Venta no encontrada"
                })
            }

            const pagosAsociados = await ReciboPagoVenta.count({ where: { id_venta }, transaction });
            if (pagosAsociados > 0) {
                await transaction.rollback();
                return res.status(409).json({ ok: false, message: "No se puede eliminar una venta que ya tiene pagos asociados a recibos" });
            }
            const remitoAsociado = await Remito.count({ where: { id_venta }, transaction });
            if (remitoAsociado > 0) {
                await transaction.rollback();
                return res.status(409).json({ ok: false, message: "No se puede eliminar una venta con un remito emitido y archivado" });
            }

            // Buscar todos los detalles
            const detalles = await VentaDetalle.findAll({
                where: { id_venta },
                transaction
            });

            // Devolver stock por cada producto
            for (const det of detalles) {
                await actualizarStockProducto(
                    det.id_producto,
                    det.cantidad,
                    "add",
                    transaction
                );
            }

            // Eliminar detalles
            await VentaDetalle.destroy({
                where: { id_venta },
                transaction
            });

            // Eliminar venta
            await venta.destroy({ transaction });

            await transaction.commit();

            return res.json({
                ok: true,
                message: "Venta eliminada correctamente"
            });


        } catch (error) {
            console.log("Error en eliminarVenta:", error);
            await transaction.rollback()
            res.status(500).json({
                ok: false,
                error: error.message
            })
        }
    },


    async cambiarEstadoPago(req, res) {
        const transaction = await db.transaction();

        try {
            const { id_venta } = req.params;
            const { isPagado } = req.body;

            const pago = ["true", "1", 1, true].includes(isPagado);

            const venta = await Venta.findByPk(id_venta, { transaction });

            if (!venta) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    message: "Venta no encontrada"
                });
            }

            const pagosAsociados = await ReciboPagoVenta.count({ where: { id_venta }, transaction });
            if (pagosAsociados > 0 && !pago) {
                await transaction.rollback();
                return res.status(409).json({ ok: false, message: "La venta tiene pagos en recibos y no puede volver a estado pendiente manualmente" });
            }
            if (pagosAsociados > 0 && pago) {
                const [detallesVenta, pagosVenta] = await Promise.all([
                    VentaDetalle.findAll({ where: { id_venta }, transaction }),
                    ReciboPagoVenta.findAll({ where: { id_venta }, transaction })
                ]);
                const totalVenta = detallesVenta.reduce((sum, d) => sum + Number(d.precio) * Number(d.cantidad), 0);
                const totalAbonado = pagosVenta.reduce((sum, p) => sum + Number(p.importe), 0);
                if (totalAbonado + 0.005 < totalVenta) {
                    await transaction.rollback();
                    return res.status(409).json({ ok: false, message: "La venta mantiene saldo pendiente; registra el saldo restante con un recibo" });
                }
            }

            await venta.update({ isPagado: pago }, { transaction });
            await transaction.commit();

            return res.json({
                ok: true,
                venta
            });
        } catch (error) {
            console.log("Error en cambiarEstadoPago:", error);
            await transaction.rollback();
            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    },

    async generarRemito(req, res) {
        try {
            const { id_venta } = req.params;

            const venta = await Venta.findByPk(id_venta, {
                include: [
                    {
                        model: VentaDetalle,
                        include: [{ model: Producto }]
                    }
                ]
            });

            if (!venta) {
                return res.status(404).json({
                    ok: false,
                    message: "Venta no encontrada"
                });
            }

            const remitoExistente = await Remito.findOne({ where: { id_venta } });
            if (remitoExistente) {
                return res.json({ ok: true, remito: remitoExistente.documento });
            }

            const tipoRemito = ["donacion", "consumo_propio", "cajas_negras"].includes(venta.tipo)
                ? "X (Interno)"
                : "R (Oficial)";

            const emisor = {
                razonSocial: process.env.EMPRESA_RAZON_SOCIAL || "500 Millas S.R.L.",
                cuit: process.env.EMPRESA_CUIT || "20-12345678-9",
                domicilio: process.env.EMPRESA_DOMICILIO || "Av. Ejemplo 1234, Ciudad Autónoma de Buenos Aires",
                telefono: process.env.EMPRESA_TELEFONO || "011-4000-0000",
                email: process.env.EMPRESA_EMAIL || "contacto@500millas.com"
            };

            const receptor = {
                nombre: venta.persona || "No especificado",
                idPedido: venta.id_pedido ?? "-",
                tipoMovimiento: venta.tipo,
                estadoPago: venta.isPagado ? "Pagado" : "Pendiente"
            };

            const productos = venta.VentaDetalles.map((detalle, index) => ({
                linea: index + 1,
                nombre: detalle.Producto?.nombre || "N/A",
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precio,
                subtotal: detalle.cantidad * detalle.precio
            }));

            const remito = {
                idVenta: venta.id_venta,
                numeroRemito: `R-${venta.id_venta}`,
                tipoRemito,
                fechaEmision: venta.fecha,
                emisor,
                receptor,
                productos,
                total: productos.reduce((sum, item) => sum + item.subtotal, 0),
                firmaReceptor: "_______________________________",
                observaciones: "Documento generado para traslado. Verificar datos antes de imprimir.",
                aclaraciones: [
                    "Remito R (Oficial) requiere papel preimpreso autorizado con CAI para traslados fuera del predio.",
                    "Remito X (Interno) es válido para traslados dentro del mismo predio y no requiere CAI.",
                    "Imprimir respetando márgenes de 5mm para que los datos digitales se alineen con el formulario físico."
                ]
            };

            const nuevoRemito = await Remito.create({
                id_venta: venta.id_venta,
                numero_remito: remito.numeroRemito,
                fecha_emision: remito.fechaEmision,
                documento: remito
            });
            remito.id_remito = nuevoRemito.id_remito;

            return res.json({ ok: true, remito });
        } catch (error) {
            console.log("Error en generarRemito:", error);
            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    },

    async editarVenta(req, res) {
        const transaction = await db.transaction();

        try {
            const { id_venta } = req.params;
            const { fecha, persona, id_pedido, tipo, isPagado, detalles } = req.body;

            const tiposValidos = ["venta", "donacion", "cajas_negras", "consumo_propio"];
            const tipoNormalizado = tiposValidos.includes(tipo) ? tipo : "venta";

            if (!Array.isArray(detalles)) {
                throw new Error("El campo 'detalles' debe ser un array");
            }

            // Normalizar pago
            let pago = ["true", "1", 1, true].includes(isPagado);
            const esGratis = ["donacion", "consumo_propio"].includes(tipoNormalizado);
            if (esGratis) pago = true;

            // Obtener venta
            const venta = await Venta.findByPk(id_venta, { transaction });

            if (!venta) {
                await transaction.rollback();
                return res.status(404).json({
                    ok: false,
                    message: "Venta no encontrada"
                });
            }

            const pagosAsociados = await ReciboPagoVenta.count({ where: { id_venta }, transaction });
            if (pagosAsociados > 0) {
                await transaction.rollback();
                return res.status(409).json({ ok: false, message: "No se puede editar una venta con pagos registrados; conserva la trazabilidad del recibo" });
            }

            // Obtener detalles viejos en un mapa
            const detallesViejos = await VentaDetalle.findAll({
                where: { id_venta },
                transaction
            });

            const mapViejos = new Map();
            detallesViejos.forEach(d =>
                mapViejos.set(d.id_producto, d)
            );

            // Recorrer detalles nuevos
            for (const nuevo of detalles) {
                const viejo = mapViejos.get(nuevo.id_producto);

                const detallePrecio = esGratis ? 0 : Number(nuevo.precio);

                if (!viejo) {
                    // 🔹 Producto nuevo → crear detalle y restar stock
                    await VentaDetalle.create({
                        id_venta,
                        id_producto: nuevo.id_producto,
                        cantidad: nuevo.cantidad,
                        precio: detallePrecio
                    }, { transaction });

                    await actualizarStockProducto(
                        nuevo.id_producto,
                        nuevo.cantidad,
                        "sub",
                        transaction
                    );

                } else {
                    // Producto ya existía → comprobar diferencia de cantidad
                    const diff = nuevo.cantidad - viejo.cantidad;

                    if (diff !== 0) {
                        if (diff > 0) {
                            await actualizarStockProducto(viejo.id_producto, diff, "sub", transaction);
                        } else {
                            await actualizarStockProducto(viejo.id_producto, Math.abs(diff), "add", transaction);
                        }
                    }

                    // Actualizar el detalle
                    await viejo.update({
                        cantidad: nuevo.cantidad,
                        precio: detallePrecio
                    }, { transaction });

                    // Marcar como procesado
                    mapViejos.delete(nuevo.id_producto);
                }
            }

            // Los detalles que quedaron en mapViejos están eliminados
            for (const det of mapViejos.values()) {
                // devolver stock
                await actualizarStockProducto(det.id_producto, det.cantidad, "add", transaction);

                // eliminar detalle
                await det.destroy({ transaction });
            }

            // Actualizar cabecera
            await venta.update(
                { fecha, persona, id_pedido, tipo: tipoNormalizado, isPagado: pago },
                { transaction }
            );

            await transaction.commit();

            return res.json({
                ok: true,
                message: "Venta actualizada correctamente"
            });

        } catch (error) {
            console.log("Error en editarVenta optimizado:", error);
            await transaction.rollback();
            return res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    }
}

export default ventaController;
