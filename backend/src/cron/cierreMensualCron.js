import cron from "node-cron";
import { cerrarMesProduccion } from "../helpers/cerrarMesProduccion.js";

export function iniciarCierreMensualCron() {
    cron.schedule("55 23 * * *", async () => {
        try {
            const ahora = new Date();

            const año = ahora.getFullYear();
            const mes = ahora.getMonth() + 1;

            // 🔍 Verificar si HOY es el último día del mes
            const mañana = new Date(ahora);
            mañana.setDate(ahora.getDate() + 1);

            const esUltimoDia = mañana.getDate() === 1;

            if (!esUltimoDia) return;

            console.log(`📊 Cerrando producción ${mes}/${año}`);

            await cerrarMesProduccion(mes, año);

            console.log(`✅ Producción ${mes}/${año} cerrada correctamente`);

        } catch (error) {
            console.error("❌ Error en cierre mensual automático:", error.message);
        }
    });
}
