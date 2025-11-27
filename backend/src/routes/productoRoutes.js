import { Router } from "express";
import productoController from "../controllers/productoController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Todas las rutas del dashboard requieren autenticación
router.post("/", authenticateToken, productoController.crearProducto);

export default router;