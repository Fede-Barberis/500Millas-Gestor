import { Venta, VentaDetalle, CompraMP, DetalleEmpleado, Producto, MateriaPrima, Alerta, Pedido, DetallePedido } from "../models/index.js";
import { Sequelize, Op } from "sequelize";

async function calcularTotalesPorMes(inicio, fin) {
    try {
        // Total ingresos (ventas del mes)
        const totalIngresos = await VentaDetalle.findOne({ 
            attributes: [
                [Sequelize.literal('SUM(VentaDetalle.precio * VentaDetalle.cantidad)'), 'total']
            ],
            include: [{
                model: Venta, 
                attributes: [],
                required: true, // Asegura un INNER JOIN para el filtro
                where: {
                    fecha: { [Op.between]: [inicio, fin] }
                }
            }],
            raw: true
        });

        // Manejar resultado nulo
        const ingresosVentas = parseFloat(totalIngresos?.total || 0);


        // Gastos materia prima
        const totalMp = await CompraMP.findOne({
            attributes: [[Sequelize.literal('SUM(precio * cantidad)'), 'total']],
            where: { fecha: { [Op.between]: [inicio, fin] } },
            raw: true
        });

        const gastosMp = parseFloat(totalMp?.total || 0);


        // Sueldos empleados
        const totalSueldos = await DetalleEmpleado.findOne({
            attributes: [[Sequelize.literal('SUM(precioHora * cantHoras)'), 'totalSueldos']],
            where: { fechaCobro: { [Op.between]: [inicio, fin] } },
            raw: true
        });

        const gastosSueldos = parseFloat(totalSueldos?.totalSueldos || 0);


        // Totales
        const totalGastos = gastosMp + gastosSueldos;
        const balance = ingresosVentas - totalGastos;
        const crecimiento = ingresosVentas > 0
            ? ((balance / ingresosVentas) * 100).toFixed(1)
            : 0;

        return { ingresosVentas, totalGastos, balance, crecimiento };

    } catch (error) {
        console.error("Error en calcularTotales:", error);
        throw error;
    }
}



const dashboardController = {
    async getStats(req, res) {
        try {
            const now = new Date();

            // Rango del mes actual
            const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
            const finMesActual = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Rango del mes anterior
            const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);

            // Calcular ambos
            const [actual, anterior] = await Promise.all([
                calcularTotalesPorMes(inicioMesActual, finMesActual),
                calcularTotalesPorMes(inicioMesAnterior, finMesAnterior),
            ]);

            // Cálculo de crecimiento (comparación % mes a mes)
            const crecimientoIngresos =
                anterior.ingresosVentas > 0
                ? ((actual.ingresosVentas - anterior.ingresosVentas) / anterior.ingresosVentas) * 100
                : 0;

            const crecimientoGastos =
                anterior.totalGastos > 0
                ? ((actual.totalGastos - anterior.totalGastos) / anterior.totalGastos) * 100
                : 0;

            const crecimientoBalance =
                anterior.balance !== 0
                ? ((actual.balance - anterior.balance) / Math.abs(anterior.balance)) * 100
                : 0;
                

            res.json({
                total_ingresos: actual.ingresosVentas,
                total_gastos: actual.totalGastos,
                balance: actual.balance,
                crecimiento: actual.crecimiento,
                crecimiento_ingresos: crecimientoIngresos.toFixed(1),
                crecimiento_gastos: crecimientoGastos.toFixed(1),
                crecimiento_balance: crecimientoBalance.toFixed(1),
            });
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            res.status(500).json({ error: "Error al obtener estadísticas del dashboard" });
        }
    },

    async getDataChart(req, res) {
        try {
            // Ingresos por mes
            const ingresosPorMes = await VentaDetalle.findAll({
                attributes: [
                    [Sequelize.fn('MONTH', Sequelize.col('Ventum.fecha')), 'mes'], // Referencia a la fecha en Venta
                    [Sequelize.literal('SUM(VentaDetalle.precio * VentaDetalle.cantidad)'), 'total']
                ],
                include: [{
                    model: Venta,
                    attributes: [],
                    required: true // Necesario para el filtro de fecha (aunque no está en este fragmento) y para que funcione la agrupación
                }],
                group: [Sequelize.fn('MONTH', Sequelize.col('Ventum.fecha'))], // Agrupar por mes de Venta
                order: [[Sequelize.literal('mes'), 'ASC']],
                raw: true,
                subQuery: false
            });



            // Egresos por mes (materia prima)
            const egresosMP = await CompraMP.findAll({
                attributes: [
                    [Sequelize.fn('MONTH', Sequelize.col('fecha')), 'mes'],
                    [Sequelize.literal('SUM(precio * cantidad)'), 'total']
                ],
                group: ['mes'],
                order: [[Sequelize.literal('mes'), 'ASC']]
            });

            // Egresos por mes (sueldos)
            const egresosSueldos = await DetalleEmpleado.findAll({
                attributes: [
                    [Sequelize.fn('MONTH', Sequelize.col('fechaCobro')), 'mes'],
                    [Sequelize.literal('SUM(precioHora * cantHoras)'), 'total']
                ],
                group: ['mes'],
                order: [[Sequelize.literal('mes'), 'ASC']]
            });

            // Crear arreglo de meses (1–12)
            const meses = Array.from({ length: 12 }, (_, i) => i + 1);

            const data = meses.map(mes => {
                // Acceder directamente a 'mes' y 'total' del objeto plano
                const ingreso = ingresosPorMes.find(i => i.mes == mes); 
                const egresoMP = egresosMP.find(e => e.mes == mes);
                const egresoSueldo = egresosSueldos.find(e => e.mes == mes);

                // Acceder directamente a 'total' 
                const totalIngresos = parseFloat(ingreso?.total || 0);
                const totalMP = parseFloat(egresoMP?.total || 0);
                const totalSueldos = parseFloat(egresoSueldo?.total || 0);

                return {
                    mes,
                    ingresos: totalIngresos,
                    egresos: totalMP + totalSueldos
                };
            });

            // Convertir número de mes a nombre abreviado
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
            // Query params
            const { month, year } = req.query;

            if(!month || !year){
                res.status(400).json({
                    error: "Debe especificarse 'month' y 'year'"
                })
            }

            const mes = parseInt(month, 10)
            const anio = parseInt(year, 10)

            if(isNaN(mes) || mes < 1 > 12) {
                res.status(400).json({ error: "El parametro 'month' debe ser un numero entre 1 y 12" })
            }

            if (isNaN(anio) || anio < 2000) {
                return res.status(400).json({ error: "El parámetro 'year' no es válido" });
            }


            const ventasPorProducto = await VentaDetalle.findAll({ // Cambiado de Venta a VentaDetalle
                attributes: [
                    [Sequelize.col('Producto.nombre'), 'name'], // Obtener el nombre del producto directamente
                    [Sequelize.literal('SUM(VentaDetalle.cantidad)'), 'value']
                ],
                where: { // El filtro de fecha debe ir en el include de Venta
                    // [Op.and]: [ ... ] // Se elimina el filtro here
                },
                include: [
                    {
                        model: Venta, // Incluir Venta para filtrar por fecha
                        attributes: [],
                        required: true,
                        where: {
                            [Op.and]: [
                                Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('fecha')), mes),
                                Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('fecha')), anio)
                            ]
                        }
                    },
                    {
                        model: Producto, // Incluir Producto para obtener el nombre
                        attributes: [],
                        required: true,
                    }
                ],
                group: ['Producto.nombre'], // Agrupar por nombre/ID del Producto
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


    async getAlertas (req, res) {
        try {
            const hoy = new Date();
            const limiteVencimiento = new Date();
            limiteVencimiento.setDate(hoy.getDate() + 7);
            
            //* ---- Buscar condiciones ----
            
            // Productos con menos de 10 unidades
            const productosBajoStock = await Producto.findAll({
                where: {
                    stock: { [Op.lt]: 10}
                },
                attributes: ["nombre", "stock"],
            });

            // Materias primas con poco stock
            const mpBajoStock = await MateriaPrima.findAll({
                where: {
                    stock: { [Op.lt]: 10 },
                },
                attributes: ["nombre", "stock"],
            });

            // Materia prima por vencer (en los próximos 7 días)
            const mpVencimiento = await CompraMP.findAll({
                where: {
                    fch_vencimiento: {
                        [Op.lte]: limiteVencimiento, // Incluye vencidas y por vencer
                    },
                },
                attributes: ["id_compra", "fch_vencimiento"],
                include: [
                    {
                        model: MateriaPrima,
                        attributes: ["nombre"],
                    },
                ],
            });

            // pagos adeudados
            const pagosPendientes = await CompraMP.findAll({
                where: {
                    isPagado: false
                },
                attributes: ["id_compra", "precio", "fecha", "cantidad"],
                include: [
                    {
                        model: MateriaPrima,
                        attributes: ["nombre"],
                    },
                ],
            })

            //* ---- Generar alertas dinámicamente ----
            const alertas = [];

            productosBajoStock.forEach(p => {
                alertas.push({
                    tipo: "producto",
                    nivel: "warning",
                    mensaje: `Stock bajo del producto "${p.nombre}" : ${p.stock} unidades`,
                });
            });

            mpBajoStock.forEach(mp => {
                alertas.push({
                    tipo: "materia_prima",
                    nivel: "danger",
                    mensaje: `Stock bajo de materia prima "${mp.nombre}" : ${mp.stock} unidades`,
                });
            });

            // Materias primas vencidas o por vencer
            mpVencimiento.forEach(compra => {
                const nombreMp = compra.MateriaPrima?.nombre || "Desconocida";
                const fecha = new Date(compra.fch_vencimiento);
                const fechaFormateada = fecha.toLocaleDateString("es-AR");

                const vencida = fecha < hoy; // true si ya venció

                alertas.push({
                    tipo: "vencimiento",
                    nivel: vencida ? "expired" : "warning",  
                    mensaje: vencida
                        ? `Materia prima "${nombreMp}" venció el ${fechaFormateada}`
                        : `Materia prima "${nombreMp}" vence el ${fechaFormateada}`,
                });
            });

            pagosPendientes.forEach(p => {
                alertas.push({
                    tipo: "compra_mp",
                    nivel: "warning",
                    mensaje: `Falta pagar compra (${p.fecha}) ${p.MateriaPrima.nombre}. ||  Total a pagar: ${(p.precio * p.cantidad)}`,
                });
            });


            //* ---- Guardar solo las nuevas ----
            for (const alerta of alertas) {
                const yaExiste = await Alerta.findOne({
                    where: { mensaje: alerta.mensaje },
                });

                if (!yaExiste) {
                    await Alerta.create(alerta);
                }
            }

            //* ---- Obtener solo las no leídas ----
            const alertasNoLeidas = await Alerta.findAll({
                where: { is_leida: false },
                order: [["createdAt", "DESC"]],
            });

            return res.json({ alertas: alertasNoLeidas });

        } catch (error) {
            console.log("Error en getAlertas: ",error);
            res.status(500).json({
                error: "Error al obtener alertas",
                message: error.message
            })
        }
    },


    async marcarComoLeida (req, res) {
        try {
            const { id } = req.params;

            const alerta = await Alerta.findByPk(id);

            if (!alerta) {
                return res.status(404).json({ message: "Alerta no encontrada" });
            }

            alerta.is_leida = true;
            await alerta.save();

            res.json({
                message: "Alerta marcada como leída",
                alerta,
            });
        } catch (error) {
            console.error("Error al marcar alerta como leída:", error);
            res.status(500).json({
                error: "Error al actualizar la alerta",
                message: error.message,
            });
        }
    },


    async getPedidos (req, res) {
        try{
            const pedidos = await Pedido.findAll({
                attributes: ["id_pedido", "fecha_entrega", "persona"],
                order:[["fecha_entrega", "ASC"]],
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
            console.log("Error en obteener detalles peidos:", error);
            return res.status(500).json({
                error: "Error al obtener detalles del pedido",
                message: error.message
            })
        }
    }
};

export default dashboardController;