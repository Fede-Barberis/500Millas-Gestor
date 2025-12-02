import { Router } from "express";
import productoController from "../controllers/productoController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Todas las rutas del dashboard requieren autenticación
router.post("/", authenticateToken, productoController.crearProducto);
router.put("/producto/:id_producto", authenticateToken, productoController.editarProducto);
router.delete("/producto/:id_producto", authenticateToken, productoController.eliminarProducto);
router.get("/:id_producto/movimientos", authenticateToken, productoController.obtenerMovimientosProducto);



export default router;