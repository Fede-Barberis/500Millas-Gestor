import { Router } from "express";
import materiaPrimaController from "../controllers/materiaPrimaController.js";
import { authenticateToken } from "../middlewares/authMiddlewares.js";

const router = Router();

// Todas las rutas del dashboard requieren autenticación
router.get("/", authenticateToken, materiaPrimaController.getMateriaPrima);
router.get("/compraMp", authenticateToken, materiaPrimaController.obtenerCompraMp);
router.post("/descontarStock", authenticateToken, materiaPrimaController.descontarStock);
router.post("/compraMp", authenticateToken, materiaPrimaController.crearCompraMp);
router.delete("/compraMp/:id_compra", authenticateToken, materiaPrimaController.eliminarCompraMp);
router.put("/compraMp/:id_compra", authenticateToken, materiaPrimaController.editarCompraMp);



export default router;
