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
};
