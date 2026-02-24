import cron from "node-cron";
import { cerrarMesProduccion } from "../helpers/cerrarMesProduccion.js";

function obtenerMesAnterior(fecha = new Date()) {
    const anterior = new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1);
    return {
        mes: anterior.getMonth() + 1,
        anio: anterior.getFullYear()
    };
}

async function intentarCierreMensualAutomatico() {
    const ahora = new Date();

    // Se intenta el cierre durante el dia 1 de cada mes.
    if (ahora.getDate() !== 1) return;

    const { mes, anio } = obtenerMesAnterior(ahora);

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
    // Fallback interno: corre diario 00:05 para cerrar el mes anterior.
    cron.schedule("5 0 * * *", async () => {
        await intentarCierreMensualAutomatico();
    });

    // Catch-up al boot para evitar perder el cierre si hubo downtime.
    void intentarCierreMensualAutomatico();
}
