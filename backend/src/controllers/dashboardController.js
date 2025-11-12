import { Venta, CompraMP, DetalleEmpleado, Producto } from "../models/index.js";
import { Sequelize, Op } from "sequelize";

async function calcularTotalesPorMes(inicio, fin) {
    try {
        // Total ingresos (ventas del mes)
        const totalIngresos = await Venta.findOne({
            attributes: [[Sequelize.literal('SUM(precio * cantidad)'), 'total']],
            where: {
                fecha: {
                    [Op.between]: [inicio, fin],
                },
            },
        });

        const ingresosVentas = parseFloat(totalIngresos?.dataValues.total || 0);

        // Gastos materia prima del mes
        const totalMp = await CompraMP.findOne({
            attributes: [[Sequelize.literal('SUM(precio * cantidad)'), 'total']],
            where: {
                fecha: {
                    [Op.between]: [inicio, fin],
                },
            },
        });

        const gastosMp = parseFloat(totalMp?.dataValues.total || 0);

        // Gastos sueldos
        const totalSueldos = await DetalleEmpleado.findOne({
            attributes: [[Sequelize.literal('SUM(precioHora * cantHoras)'), 'totalSueldos']],
            where: {
                fechaCobro: {
                    [Op.between]: [inicio, fin],
                },
            },
        });

        const gastosSueldos = parseFloat(totalSueldos?.dataValues.totalSueldos || 0);

        // Totales
        const totalGastos = gastosMp + gastosSueldos;
        const balance = ingresosVentas - totalGastos;
        const crecimiento = ingresosVentas > 0 ? ((balance / ingresosVentas) * 100).toFixed(1) : 0;

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
            const ingresosPorMes = await Venta.findAll({
                attributes: [
                    [Sequelize.fn('MONTH', Sequelize.col('fecha')), 'mes'],
                    [Sequelize.literal('SUM(precio * cantidad)'), 'total']
                ],
                group: ['mes'],
                order: [[Sequelize.literal('mes'), 'ASC']]
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
                const ingreso = ingresosPorMes.find(i => i.dataValues.mes == mes);
                const egresoMP = egresosMP.find(e => e.dataValues.mes == mes);
                const egresoSueldo = egresosSueldos.find(e => e.dataValues.mes == mes);

                const totalIngresos = parseFloat(ingreso?.dataValues.total || 0);
                const totalMP = parseFloat(egresoMP?.dataValues.total || 0);
                const totalSueldos = parseFloat(egresoSueldo?.dataValues.total || 0);

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


            const ventasPorProducto = await Venta.findAll({
            attributes: [
                'id_producto',
                [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'totalVendidos']
            ],
            where: {
                [Sequelize.Op.and]: [
                Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('fecha')), mes),
                Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('fecha')), anio)
                ]  
            },
            include: [
                {
                model: Producto,
                attributes: ['nombre'],
                required: false
                }
            ],
            group: ['Venta.id_producto', 'Producto.id'],
            order: [[Sequelize.literal('totalVendidos'), 'DESC']]
            });

            const data = ventasPorProducto.map(v => ({
            name: v.Producto?.nombre || 'Desconocido',
            value: parseFloat(v.dataValues.totalVendidos)
            }));

            return res.json(data);
        } catch (error) {
            console.error("Error al obtener datos del pie chart:", error);
            res.status(500).json({ error: "Error al generar gráfico de productos vendidos" });
        }
    }
};

export default dashboardController;