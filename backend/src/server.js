import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import db  from './config/database.js';
import authRoutes from './routes/authRoutes.js'
import { authenticateToken } from "./middlewares/authMiddlewares.js";

dotenv.config();
const app = express();         
const PORT = process.env.PORT || 3000;

//* Middleware => funciones que se ejecutan antes de cada ruta
app.use(cors())            // Permite CORS para todas las rutas
app.use(express.json())    // Permite leer JSON en los requests


//* Rutas de la api
app.use("/api/auth", authRoutes);

// Ruta de prueba protegida
app.get("/api/me", authenticateToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

//* Ruta para probar conexion a BD
const start = async () => {
    try {
        await db.authenticate();
        console.log("✅ Conectado a DB (authenticate).");

        // Sincronizar modelos. Usá alter:true en desarrollo para que actualice sin borrar datos.
        await db.sync({ alter: true });
        console.log("✅ Modelos sincronizados.");

        app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al iniciar:", error);
        process.exit(1);
    }
};

start();