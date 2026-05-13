import cron from "node-cron";
import { cerrarMesProduccion } from "../helpers/cerrarMesProduccion.js";

function obtenerMesAnterior(fecha = new Date()) {
    const anterior = new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1);
    return {
        mes: anterior.getMonth() + 1,
        anio: anterior.getFullYear()
    };
}

function esDiaFinalDelMes(fecha = new Date()) {
    const diaActual = fecha.getDate();
    const diaFinalDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
    return diaActual === diaFinalDelMes;
}

async function intentarCierreMensualAutomatico() {
    const ahora = new Date();

    // Se intenta el cierre durante el último día del mes
    if (!esDiaFinalDelMes(ahora)) return;

    // Obtener el mes actual (que es el que se va a cerrar)
    const mes = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();

    try {
        console.log(`[CRON] Intentando cierre automatico de ${mes}/${anio}`);
        await cerrarMesProduccion(mes, anio);
        console.log(`[CRON] Produccion ${mes}/${anio} cerrada correctamente`);
    } catch (error) {
        if (error.message?.includes("ya fue cerrado")) {
            console.log(`[CRON] Produccion ${mes}/${anio} ya estaba cerrada`);
            return;
        }

        console.error("[CRON] Error en cierre mensual automatico:", error.message);
    }
}

export function iniciarCierreMensualCron() {
    // Se ejecuta a las 12:00 PM UTC todos los días para cerrar el mes si es el último día
    cron.schedule("0 12 * * *", async () => {
        await intentarCierreMensualAutomatico();
    });

    // Catch-up al boot para evitar perder el cierre si hubo downtime.
    void intentarCierreMensualAutomatico();
}
