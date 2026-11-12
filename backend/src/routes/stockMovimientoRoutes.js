import { Router } from "express";
import stockMovimientoController from "../controllers/stockMovimientoController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();
router.get("/", authenticateToken, stockMovimientoController.listar);
export default router;
