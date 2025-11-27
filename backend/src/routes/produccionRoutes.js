import { Router } from "express";
import produccionController from "../controllers/produccionController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Todas las rutas del dashboard requieren autenticación
router.get("/produccion", authenticateToken, produccionController.getProduccion);
router.get("/recetas", authenticateToken, produccionController.getRecetas);
router.get("/productos", authenticateToken, produccionController.getProductos);
router.post("/produccion", authenticateToken, produccionController.crearProduccion);
router.delete("/produccion/:id", authenticateToken, produccionController.eliminarProduccion);
router.put("/produccion/:id", authenticateToken, produccionController.editarProduccion);



export default router;
