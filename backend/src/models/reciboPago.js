import { DataTypes } from "sequelize";
import db from "../config/database.js";

const ReciboPago = db.define("ReciboPago", {
    id_recibo: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fecha_pago: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_emision: { type: DataTypes.DATEONLY, allowNull: false },
    cliente: { type: DataTypes.STRING(100), allowNull: false },
    medio_pago: { type: DataTypes.STRING(40), allowNull: false },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, { tableName: "recibos_pago", timestamps: false });

export default ReciboPago;
