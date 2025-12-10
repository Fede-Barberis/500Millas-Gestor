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
import RecetaMateriaPrima from "./recetaMateriaPrima.js";
import Produccion from "./produccion.js";
import DetalleProduccion from "./detalleProduccion.js";
import Receta from "./receta.js";
import ProductoReceta from "./productoReceta.js";
import ConsumoExtra from "./consumoExtra.js";
import VentaDetalle from "./detalleVenta.js";

// Definir asociaciones entre modelos

// Producto -> Venta (Un producto puede tener muchas ventas)
Producto.hasMany(VentaDetalle, { foreignKey: 'id_producto' });
VentaDetalle.belongsTo(Producto, { foreignKey: 'id_producto' });

Venta.hasMany(VentaDetalle, { foreignKey: "id_venta" });
VentaDetalle.belongsTo(Venta, { foreignKey: "id_venta" });

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



// Receta → RecetaMateriaPrima
Receta.hasMany(RecetaMateriaPrima, { foreignKey: "id_receta" });
RecetaMateriaPrima.belongsTo(Receta, { foreignKey: "id_receta" });

// MateriaPrima → RecetaMateriaPrima
MateriaPrima.hasMany(RecetaMateriaPrima, { foreignKey: "id_materiaPrima" });
RecetaMateriaPrima.belongsTo(MateriaPrima, { foreignKey: "id_materiaPrima" });

// Relación MANY-TO-MANY explícita (opcional pero recomendable)
Receta.belongsToMany(MateriaPrima, {
    through: RecetaMateriaPrima,
    foreignKey: "id_receta",
    otherKey: "id_materiaPrima"
});

MateriaPrima.belongsToMany(Receta, {
    through: RecetaMateriaPrima,
    foreignKey: "id_materiaPrima",
    otherKey: "id_receta"
});


// Receta → Producto
Receta.hasMany(ProductoReceta, { foreignKey: "id_receta" });
ProductoReceta.belongsTo(Receta, { foreignKey: "id_receta" });

Producto.hasOne(ProductoReceta, { foreignKey: "id_producto" });
ProductoReceta.belongsTo(Producto, { foreignKey: "id_producto" });

// Receta → Producción
Receta.hasMany(Produccion, { foreignKey: "id_receta" });
Produccion.belongsTo(Receta, { foreignKey: "id_receta" });

// Producción → Detalle de producción
Produccion.hasMany(DetalleProduccion, { foreignKey: "id_produccion" });
DetalleProduccion.belongsTo(Produccion, { foreignKey: "id_produccion" });

Producto.hasMany(DetalleProduccion, { foreignKey: "id_producto" });
DetalleProduccion.belongsTo(Producto, { foreignKey: "id_producto" });



Producto.hasMany(ConsumoExtra, { foreignKey: "id_producto" });
ConsumoExtra.belongsTo(Producto, { foreignKey: "id_producto" });

MateriaPrima.hasMany(ConsumoExtra, { foreignKey: "id_materiaPrima" });
ConsumoExtra.belongsTo(MateriaPrima, { foreignKey: "id_materiaPrima" });

Receta.hasMany(ConsumoExtra, { foreignKey: "id_receta" });
ConsumoExtra.belongsTo(Receta, { foreignKey: "id_receta" });



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
    DetallePedido,
    Receta,
    RecetaMateriaPrima,
    ProductoReceta,
    Produccion,
    DetalleProduccion,
    ConsumoExtra,
    VentaDetalle
};
