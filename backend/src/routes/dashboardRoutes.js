import { Router } from "express";
import dashboardController from "../controllers/dashboardController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Todas las rutas del dashboard requieren autenticación
router.get("/stats", authenticateToken, dashboardController.getStats);
router.get("/areaChart", authenticateToken, dashboardController.getDataChart);
router.get("/pieChart", authenticateToken, dashboardController.getPieDataChart);

export default router;
