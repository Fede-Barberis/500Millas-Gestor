import { Router } from 'express'
import ventaController from '../controllers/ventaController.js'
import { authenticateToken } from '../middlewares/authMiddlewares.js'

const router = Router();

router.get("/", authenticateToken, ventaController.obtenerVentas);
router.post("/", authenticateToken, ventaController.crearVenta);
router.delete("/:id_venta", authenticateToken, ventaController.eliminarVenta);
router.put("/:id_venta", authenticateToken, ventaController.editarVenta);


export default router;