import { Router } from 'express'
import ventaController from '../controllers/ventaController.js'
import { authenticateToken } from '../middlewares/authMiddlewares.js'

const router = Router();

router.get("/", authenticateToken, ventaController.obtenerVentas);
router.get("/recibos", authenticateToken, ventaController.obtenerRecibos);
router.post("/recibos", authenticateToken, ventaController.crearRecibo);
router.get("/remitos", authenticateToken, ventaController.obtenerRemitos);
router.post("/:id_venta/remito", authenticateToken, ventaController.generarRemito);
router.post("/", authenticateToken, ventaController.crearVenta);
router.delete("/:id_venta", authenticateToken, ventaController.eliminarVenta);
router.patch("/:id_venta/pago", authenticateToken, ventaController.cambiarEstadoPago);
router.put("/:id_venta", authenticateToken, ventaController.editarVenta);


export default router;
