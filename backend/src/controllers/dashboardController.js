import { Venta, VentaDetalle, CompraMP, Producto, MateriaPrima, Pedido, DetallePedido, ReciboPagoVenta } from "../models/index.js";
import { Sequelize, Op } from "sequelize";

const interpretarPagado = (valor) => {
    if (typeof valor === "string") return ["1", "true", "si", "sí", "yes", "y"].includes(valor.trim().toLowerCase());
    return valor === true || valor === 1;
};

const diasDesdeFecha = (fecha) => {
    if (!fecha) return 0;
    const [year, month, day] = String(fecha).slice(0, 10).split("-").map(Number);
    const fechaUTC = Date.UTC(year, month - 1, day);
    const ahora = new Date();
    const hoyUTC = Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    return Math.max(0, Math.floor((hoyUTC - fechaUTC) / 86400000));
};

async function calcularTotalesPorMes(inicio, fin) {
    try {
        // INGRESOS (ventas pagadas)
        const ingresos = await VentaDetalle.findOne({
            attributes: [[
            Sequelize.fn(
                'SUM',
                Sequelize.literal('precio * cantidad')
            ),
            'total'
            ]],
            include: [{
                model: Venta,
                attributes: [],
                required: true,
                where: {
                    fecha: { [Op.between]: [inicio, fin] },
                    isPagado: true
                }
            }],
            raw: true
        });
    
        const ingresosVentas = parseFloat(ingresos?.total || 0);
    
        // EGRESOS (compras MP pagadas)
        const gastos = await CompraMP.findOne({
            attributes: [[
            Sequelize.fn(
                'SUM',
                Sequelize.literal('precio')
            ),
            'total'
            ]],
            where: {
                fecha: { [Op.between]: [inicio, fin] },
                isPagado: true
            },
            raw: true
        });
    
        const totalGastos = parseFloat(gastos?.total || 0);
    
        const balance = ingresosVentas - totalGastos;
    
        return { ingresosVentas, totalGastos, balance };
    
        } catch (error) {
        console.error("Error en calcularTotalesPorMes:", error);
        throw error;
        }
}


const dashboardController = {
    async getCuentasPorCobrar(req, res) {
        try {
            const ventas = await Venta.findAll({
                attributes: ["id_venta", "fecha", "persona", "isPagado"],
                include: [{ model: VentaDetalle }],
                order: [["fecha", "ASC"], ["id_venta", "ASC"]]
            });
            const pagos = await ReciboPagoVenta.findAll({
                where: { id_venta: ventas.map((venta) => venta.id_venta) },
                attributes: ["id_venta", "importe"]
            });
            const abonadoPorVenta = new Map();
            pagos.forEach((pago) => {
                const idVenta = Number(pago.id_venta);
                abonadoPorVenta.set(idVenta, (abonadoPorVenta.get(idVenta) || 0) + Number(pago.importe || 0));
            });

            const pendientes = [];
            ventas.forEach((venta) => {
                if (interpretarPagado(venta.isPagado)) return;
                const total = (venta.VentaDetalles || []).reduce((sum, detalle) => sum + Number(detalle.precio || 0) * Number(detalle.cantidad || 0), 0);
                const saldo = Math.max(0, Math.round((total - (abonadoPorVenta.get(Number(venta.id_venta)) || 0)) * 100) / 100);
                if (saldo <= 0) return;
                pendientes.push({
                    id_venta: venta.id_venta,
                    persona: String(venta.persona || "Sin cliente").trim(),
                    fecha: venta.fecha,
                    saldo,
                    dias: diasDesdeFecha(venta.fecha)
                });
            });

            const porCliente = new Map();
            pendientes.forEach((venta) => {
                const llave = venta.persona.toLocaleLowerCase("es-AR");
                if (!porCliente.has(llave)) porCliente.set(llave, { cliente: venta.persona, saldo: 0, cantidad_ventas: 0, ventas: [] });
                const cliente = porCliente.get(llave);
                cliente.saldo = Math.round((cliente.saldo + venta.saldo) * 100) / 100;
                cliente.cantidad_ventas += 1;
                cliente.ventas.push(venta);
            });
            const clientes = [...porCliente.values()].map((cliente) => {
                const masAntigua = cliente.ventas.reduce((oldest, venta) => !oldest || venta.dias > oldest.dias ? venta : oldest, null);
                return { ...cliente, dias_mas_antigua: masAntigua?.dias || 0, ventas: undefined };
            }).sort((a, b) => b.saldo - a.saldo);
            const deudaMasAntigua = pendientes.reduce((oldest, venta) => !oldest || venta.dias > oldest.dias ? venta : oldest, null);

            return res.json({
                deuda_total: Math.round(pendientes.reduce((sum, venta) => sum + venta.saldo, 0) * 100) / 100,
                ventas_pendientes: pendientes.length,
                clientes_con_saldo: clientes.length,
                deuda_mas_antigua: deudaMasAntigua,
                clientes: clientes.slice(0, 5)
            });
        } catch (error) {
            console.error("Error en getCuentasPorCobrar:", error);
            return res.status(500).json({ error: "No se pudieron calcular las cuentas por cobrar", message: error.message });
        }
    },

    async getStats(req, res) {
        try {
            const now = new Date();

            const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
            const finMesActual = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0, 23, 59, 59, 999
            );

            const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const finMesAnterior = new Date(
                now.getFullYear(),
                now.getMonth(),
                0, 23, 59, 59, 999
            );

            const actual = await calcularTotalesPorMes(inicioMesActual, finMesActual);
            const anterior = await calcularTotalesPorMes(inicioMesAnterior, finMesAnterior);


            // CRECIMIENTOS (%)
            const crecimientoIngresos = anterior.ingresosVentas > 0
                ? ((actual.ingresosVentas - anterior.ingresosVentas) / anterior.ingresosVentas) * 100
                : 0;

            const crecimientoGastos = anterior.totalGastos > 0
                ? ((actual.totalGastos - anterior.totalGastos) / anterior.totalGastos) * 100
                : 0;

            const crecimientoBalance = anterior.balance !== 0
                ? ((actual.balance - anterior.balance) / Math.abs(anterior.balance)) * 100
                : 0;

            const rentabilidad = actual.ingresosVentas > 0
                ? ((actual.balance / actual.ingresosVentas) * 100)
                : 0;
            

            res.json({
                total_ingresos: actual.ingresosVentas,
                total_gastos: actual.totalGastos,
                balance: actual.balance,

                rentabilidad: rentabilidad.toFixed(1),

                crecimiento_ingresos: crecimientoIngresos.toFixed(1),
                crecimiento_gastos: crecimientoGastos.toFixed(1),
                crecimiento_balance: crecimientoBalance.toFixed(1),
            });

        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            res.status(500).json({
                error: "Error al obtener estadísticas del dashboard"
            });
        }
    },
    

    async getDataChart(req, res) {
        try {
            const year = new Date().getFullYear();

            // INGRESOS por mes (ventas pagadas)
            const ingresosPorMes = await VentaDetalle.findAll({
                attributes: [
                    [Sequelize.fn('MONTH', Sequelize.col('Ventum.fecha')), 'mes'],
                    [Sequelize.fn('YEAR', Sequelize.col('Ventum.fecha')), 'anio'],
                    [Sequelize.literal('SUM(VentaDetalle.precio * VentaDetalle.cantidad)'), 'total']
                ],
                include: [{
                    model: Venta,
                    attributes: [],
                    where: {
                        isPagado: true,
                        fecha: {
                            [Op.between]: [
                                `${year}-01-01`,
                                `${year}-12-31`
                            ]
                        }
                    },
                    required: true
                }],
                group: ['anio', 'mes'],
                order: [
                    [Sequelize.literal('anio'), 'ASC'],
                    [Sequelize.literal('mes'), 'ASC']
                ],
                raw: true
            });
            
    
            // EGRESOS por mes (compras MP PAGADAS)
            const egresosMP = await CompraMP.findAll({
                attributes: [
                    [Sequelize.fn('MONTH', Sequelize.col('fecha')), 'mes'],
                    [Sequelize.fn('YEAR', Sequelize.col('fecha')), 'anio'],
                    [Sequelize.literal('SUM(precio)'), 'total']
                ],
                where: {
                    isPagado: true,
                    fecha: {
                        [Op.between]: [
                            `${year}-01-01`,
                            `${year}-12-31`
                        ]
                    }
                },
                group: ['anio', 'mes'],
                order: [
                    [Sequelize.literal('anio'), 'ASC'],
                    [Sequelize.literal('mes'), 'ASC']
                ],
                raw: true
            });
            
    
            // Meses 1–12
            const meses = Array.from({ length: 12 }, (_, i) => i + 1);
    
            const data = meses.map(mes => {
                const ingreso = ingresosPorMes.find(i => i.mes == mes);
                const egreso = egresosMP.find(e => e.mes == mes);
    
                return {
                    mes,
                    ingresos: parseFloat(ingreso?.total || 0),
                    egresos: parseFloat(egreso?.total || 0)
                };
            });
    
            // Nombre de meses
            const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
            const dataConNombres = data.map(d => ({
                ...d,
                mes: nombresMeses[d.mes - 1]
            }));
    
            res.json(dataConNombres);
    
        } catch (error) {
            console.error("Error al obtener estadísticas del gráfico:", error);
            res.status(500).json({
                error: "Error al obtener estadísticas del gráfico",
                message: error.message
            });
        }
    },


    async getPieDataChart (req, res) {
        try {
            const { month, year } = req.query;

            if(!month || !year){
                return res.status(400).json({
                    error: "Debe especificarse 'month' y 'year'"
                })
            }

            const mes = parseInt(month, 10)
            const anio = parseInt(year, 10)

            if (isNaN(mes) || mes < 1 || mes > 12){
                res.status(400).json({ error: "El parametro 'month' debe ser un numero entre 1 y 12" })
            }

            if (isNaN(anio) || anio < 2000) {
                return res.status(400).json({ error: "El parámetro 'year' no es válido" });
            }


            const ventasPorProducto = await VentaDetalle.findAll({ 
                attributes: [
                    [Sequelize.col('Producto.nombre'), 'name'], // Obtener el nombre del producto directamente
                    [Sequelize.literal('SUM(VentaDetalle.cantidad)'), 'value']
                ],
                include: [
                    {
                        model: Venta, 
                        attributes: [],
                        required: true,
                        where: {
                            [Op.and]: [
                                Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('fecha')), mes),
                                Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('fecha')), anio),
                                // { isPagado: true }
                            ]
                        }
                    },
                    {
                        model: Producto, 
                        attributes: [],
                        required: true,
                    }
                ],
                group: ['Producto.nombre'],
                order: [[Sequelize.literal('value'), 'DESC']],
                raw: true
            });

            // El mapeo final se simplifica ya que los nombres de las columnas son `name` y `value`
            const data = ventasPorProducto.map(v => ({
                name: v.name || 'Desconocido',
                value: parseFloat(v.value)
            }));

            return res.json(data);
        } catch (error) {
            console.error("Error al obtener datos del pie chart:", error);
            res.status(500).json({ 
                error: "Error al generar gráfico de productos vendidos",
                message: error.message
            });
        }
    },


    async getAlertas(req, res) {
        try {
            const hoy = new Date();
            const limiteVencimiento = new Date();
            limiteVencimiento.setDate(hoy.getDate() + 7);

            const alertas = [];

            // Productos bajo stock
            const productosBajoStock = await Producto.findAll({
            where: { stock: { [Op.lt]: 10 } },
            attributes: ["nombre", "stock"],
            });

            productosBajoStock.forEach(p => {
            alertas.push({
                id: `producto-${p.nombre}`,
                tipo: "producto",
                nivel: "warning",
                mensaje: `Stock bajo del producto "${p.nombre}" (${p.stock})`,
            });
            });

            // Materia prima bajo stock
            const mpBajoStock = await MateriaPrima.findAll({
            where: { stock: { [Op.lt]: 10 } },
            attributes: ["nombre", "stock"],
            });

            mpBajoStock.forEach(mp => {
            alertas.push({
                tipo: "materia_prima",
                nivel: "danger",
                mensaje: `Stock bajo de materia prima "${mp.nombre}" (${mp.stock})`,
            });
            });

            // Vencimientos
            const mpVencimiento = await CompraMP.findAll({
            where: {
                fch_vencimiento: { [Op.lte]: limiteVencimiento },
            },
            include: [{
                model: MateriaPrima,
                attributes: ["nombre"],
            }],
            });

            mpVencimiento.forEach(compra => {
            const fecha = new Date(compra.fch_vencimiento);
            const vencida = fecha < hoy;

            alertas.push({
                tipo: "vencimiento",
                nivel: vencida ? "expired" : "warning",
                mensaje: vencida
                ? `Materia prima "${compra.MateriaPrima.nombre}" vencida`
                : `Materia prima "${compra.MateriaPrima.nombre}" por vencer`,
            });
            });

            // Pagos pendientes
            const pagosPendientes = await CompraMP.findAll({
            where: { isPagado: false },
            include: [{ model: MateriaPrima, attributes: ["nombre"] }],
            });

            pagosPendientes.forEach(p => {
                alertas.push({
                    tipo: "pago",
                    nivel: "warning",
                    mensaje: `Compra impaga de ${p.MateriaPrima.nombre} ($${p.precio})`,
                });
            });

            // Pedidos vencidos NO entregados
            const pedidosVencidos = await Pedido.findAll({
                where: {
                    fecha_entrega: { [Op.lt]: hoy },
                    estado: { [Op.ne]: "entregado" }
                },
                attributes: ["id_pedido", "fecha_entrega", "persona"]
            });

            pedidosVencidos.forEach(p => {
                alertas.push({
                    id: `pedido-vencido-${p.id_pedido}`,
                    tipo: "pedido",
                    nivel: "expired",
                    mensaje: `Pedido de ${p.persona} vencido (fecha ${new Date(p.fecha_entrega).toLocaleDateString("es-AR")})`,
                });
            });


            // Pedidos próximos a entregar (3 días)
            const limiteProximo = new Date();
            limiteProximo.setDate(hoy.getDate() + 3);

            const pedidosProximos = await Pedido.findAll({
                where: {
                    fecha_entrega: {
                        [Op.between]: [hoy, limiteProximo]
                    },
                    estado: { [Op.ne]: "entregado" }
                },
                attributes: ["id_pedido", "fecha_entrega", "persona"]
            });

            pedidosProximos.forEach(p => {
                alertas.push({
                    id: `pedido-proximo-${p.id_pedido}`,
                    tipo: "pedido",
                    nivel: "warning",
                    mensaje: `Pedido de ${p.persona} se entrega pronto (${new Date(p.fecha_entrega).toLocaleDateString("es-AR")})`,
                });
            });

            return res.json({
                total: alertas.length,
                alertas
            });

        } catch (error) {
            console.error("Error en getAlertas:", error);
            res.status(500).json({
            error: "Error al obtener alertas",
            message: error.message
            });
        }
    },



    async getPedidos (req, res) {
        try{
            const pedidos = await Pedido.findAll({
                attributes: ["id_pedido", "fecha_entrega", "persona"],
                order: [["fecha_entrega", "ASC"]],
            });

            return res.json( pedidos );
        } catch (error) {
            console.log("Error en getPedidos:", error);
            return res.status(500).json({
                error: "Error al obtener la lista de pedidos",
                message: error.message
            })
        }
    },


    async getDetallePedido (req, res) {
        try {
            const { id } = req.params;

            const pedido = await Pedido.findByPk(id, {
                include: [
                    {
                        model: DetallePedido,
                        include: [Producto],
                    },
                ],    
            });

            if(!pedido){ 
                return res.status(404).json({
                    error: "Pedido no encontrado"
                })
            }

            return res.json(pedido);
        } catch (error) {
            console.log("Error en obteener detalles pedidos:", error);
            return res.status(500).json({
                error: "Error al obtener detalles del pedido",
                message: error.message
            })
        }
    }
};

export default dashboardController;
