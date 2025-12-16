import { Router } from 'express'
import pedidoController from "../controllers/pedidoController.js";
import { authenticateToken } from '../middlewares/authMiddlewares.js';

const router = Router()

router.get("/", authenticateToken, pedidoController.getPedidos)
router.post("/", authenticateToken, pedidoController.crearPedido);
router.delete("/:id_pedido", authenticateToken, pedidoController.eliminarPedido);
router.put("/:id_pedido", authenticateToken, pedidoController.editarPedido);




export default router;