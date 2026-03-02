import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import db  from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import produccionRoutes from './routes/produccionRoutes.js';
import productoRoutes from './routes/productoRoutes.js'
import materiaPrimaRoutes from './routes/materiaPrimaRoutes.js'
import ventaRoutes from './routes/ventaRoutes.js'
import pedidoRoutes from './routes/pedidoRoutes.js'
import reporteRoutes from './routes/reporteRoutes.js'
import { authenticateToken } from "./middlewares/authMiddlewares.js";
import { iniciarCierreMensualCron } from "./cron/cierreMensualCron.js";

dotenv.config();
const app = express();         
const PORT = process.env.PORT || 3000;

//* Middleware => funciones que se ejecutan antes de cada ruta
app.use(cors())            // Permite CORS para todas las rutas
app.use(express.json())    // Permite leer JSON en los requests

// 🚀 iniciar cron
iniciarCierreMensualCron();

//* Rutas de la api
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/produccion", produccionRoutes);
app.use("/api/producto", productoRoutes);
app.use("/api/materiaPrima", materiaPrimaRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/reportes", reporteRoutes);


// Ruta de prueba protegida
app.get("/api/me", authenticateToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

//* Ruta para probar conexion a BD
const start = async () => {
    try {
        await db.authenticate();
        console.log("✅ Conectado a DB (authenticate).");

        // if (process.env.DB_FORCE_SYNC === "true") {
        //     console.warn("⚠️ DB_FORCE_SYNC activo: recreando tablas");
        //     await db.sync({ force: true });
        //     console.warn("⚠️ DB sincronizada con FORCE");
        // }

        const shouldSyncModels =
            process.env.DB_SYNC_ON_START === "true" ||
            process.env.NODE_ENV !== "production";

        if (shouldSyncModels) {
            // En producción conviene manejar cambios de esquema con migraciones.
            await db.sync();
            console.log("✅ Modelos sincronizados.");
        } else {
            console.log("⏭️ db.sync omitido en producción.");
        }

        app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al iniciar:", error);
        process.exit(1);
    }
};

start();
