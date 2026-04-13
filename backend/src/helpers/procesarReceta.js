import { RecetaMateriaPrima, MateriaPrima } from "../models/index.js";
import actualizarStockMateriaPrima from "./actualizarStockMateriaPrima.js";
import { Op, where, fn, col } from "sequelize";

const DESPERDICIO_MATERIA_PRIMA = [
    { nombre: "Harina", cantidad: 3 },
    { nombre: "Dulce de Leche", cantidad: 1 }
];

export async function procesarReceta(id_receta, operacion, transaction) {
    const ingredientes = await RecetaMateriaPrima.findAll({
        where: { id_receta },
        transaction
    });

    for (const ing of ingredientes) {
        await actualizarStockMateriaPrima(
            ing.id_materiaPrima,
            ing.cantidad_necesaria,
            operacion,
            transaction
        );
    }

    const nombresDesperdicio = DESPERDICIO_MATERIA_PRIMA.map(item => item.nombre.toLowerCase());

    const desperdicios = await MateriaPrima.findAll({
        where: where(
            fn("LOWER", col("nombre")),
            { [Op.in]: nombresDesperdicio }
        ),
        transaction
    });

    if (desperdicios.length !== DESPERDICIO_MATERIA_PRIMA.length) {
        const encontrados = desperdicios.map(d => d.nombre.toLowerCase());
        const faltantes = DESPERDICIO_MATERIA_PRIMA
            .map(item => item.nombre.toLowerCase())
            .filter(nombre => !encontrados.includes(nombre));
        console.warn(
            `No se encontraron materias primas de desperdicio: ${faltantes.join(', ')}. ` +
            `Verifica que existan en la tabla materia_prima.`
        );
    }

    for (const desperdicio of desperdicios) {
        const configured = DESPERDICIO_MATERIA_PRIMA.find(
            item => item.nombre.toLowerCase() === desperdicio.nombre.toLowerCase()
        );

        if (configured) {
            await actualizarStockMateriaPrima(
                desperdicio.id_materiaPrima,
                configured.cantidad,
                operacion,
                transaction
            );
        }
    }
}
