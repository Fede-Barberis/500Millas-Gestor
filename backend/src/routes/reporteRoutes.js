import { Router } from "express";
import reporteController from "../controllers/reporteController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Cierre manual con auth de usuario
router.post("/cerrar-mes", authenticateToken, reporteController.cerrarMes);
// Cierre automático por scheduler externo (token por header x-cron-secret)
router.post("/cerrar-mes-cron", reporteController.cerrarMesCron);
router.get("/cerrar-mes-cron", reporteController.cerrarMesCron);
router.get("/", reporteController.listarReportes);
router.get("/:id", reporteController.descargarReporte);



export default router;
