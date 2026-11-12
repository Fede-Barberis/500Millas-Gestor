import { DataTypes } from "sequelize";
import db from "../config/database.js";

const StockMovimiento = db.define("StockMovimiento", {
    id_movimiento: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_producto: { type: DataTypes.INTEGER, allowNull: true },
    id_materiaPrima: { type: DataTypes.INTEGER, allowNull: true },
    articulo_nombre: { type: DataTypes.STRING(120), allowNull: false },
    clase_articulo: { type: DataTypes.STRING(20), allowNull: false },
    tipo: { type: DataTypes.STRING(40), allowNull: false },
    cantidad: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    stock_anterior: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    stock_nuevo: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    unidad: { type: DataTypes.STRING(20), allowNull: false },
    origen_tipo: { type: DataTypes.STRING(40), allowNull: true },
    origen_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    observacion: { type: DataTypes.STRING(255), allowNull: true },
    fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: "movimientos_stock", timestamps: false });

export default StockMovimiento;
