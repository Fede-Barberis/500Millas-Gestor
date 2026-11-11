import { DataTypes } from "sequelize";
import db from "../config/database.js";

const ReciboPagoVenta = db.define("ReciboPagoVenta", {
    id_recibo_venta: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_recibo: { type: DataTypes.INTEGER, allowNull: false },
    id_venta: { type: DataTypes.INTEGER, allowNull: false },
    importe: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, { tableName: "recibos_pago_ventas", timestamps: false });

export default ReciboPagoVenta;
