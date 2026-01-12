import { Router } from "express";
import reporteController from "../controllers/reporteController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Todas las rutas del dashboard requieren autenticación
router.post("/cerrar-mes", authenticateToken, reporteController.cerrarMes);
router.get("/", reporteController.listarReportes);
router.get("/:id", reporteController.descargarReporte);



export default router;
