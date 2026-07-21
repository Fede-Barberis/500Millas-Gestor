import { Producto, Venta, VentaDetalle } from '../models/index.js'
import actualizarStockProducto from "../helpers/actualizarStockProducto.js"
import db from "../config/database.js";


const ventaController = {
    
    async obtenerVentas (req, res) {
        try {
            const ventas = await Venta.findAll({
                include: [
                {
                    model: VentaDetalle,
                    include: [
                        { model: Producto }
                    ]
                }
            ],
            order: [
                ["id_venta", "DESC"]
            ]
            })
            return res.json(ventas)

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

    async obtenerRemito(req, res) {
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

            return res.json({ ok: true, remito });
        } catch (error) {
            console.log("Error en obtenerRemito:", error);
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