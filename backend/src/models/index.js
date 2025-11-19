// src/models/index.js
import db from "../config/database.js";
import Usuario from "./usuario.js";
import Producto from "./producto.js";
import Venta from "./venta.js";
import MateriaPrima from "./materiaPrima.js";
import CompraMP from "./compraMP.js";
import Empleado from "./empleado.js";
import DetalleEmpleado from "./detalleEmpleado.js";
import Alerta from "./alerta.js";
import Pedido from "./pedido.js";
import DetallePedido from "./detallePedido.js";

// Definir asociaciones entre modelos

// Producto -> Venta (Un producto puede tener muchas ventas)
Producto.hasMany(Venta, { foreignKey: 'id_producto' });
Venta.belongsTo(Producto, { foreignKey: 'id_producto' });

// MateriaPrima -> CompraMP (Una materia prima puede tener muchas compras)
MateriaPrima.hasMany(CompraMP, { foreignKey: 'id_materiaPrima' });
CompraMP.belongsTo(MateriaPrima, { foreignKey: 'id_materiaPrima' });

// Empleado -> DetalleEmpleado (Un empleado puede tener muchos pagos)
Empleado.hasMany(DetalleEmpleado, { foreignKey: 'id_empleado' });
DetalleEmpleado.belongsTo(Empleado, { foreignKey: 'id_empleado' });

// Pedido -> DetallePedido (Un pedido puede tener muchos detalles de pedido)
Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });

// Producto -> DetallePedido (Un producto puede estar en muchos detalles de pedido)
Producto.hasMany(DetallePedido, { foreignKey: 'id_producto' });
DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });


export {
    db,
    Usuario,
    Producto,
    Venta,
    MateriaPrima,
    CompraMP,
    Empleado,
    DetalleEmpleado,
    Alerta,
    Pedido,
    DetallePedido
};
