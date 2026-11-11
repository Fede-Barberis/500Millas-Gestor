import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Remito = db.define("Remito", {
    id_remito: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_venta: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    numero_remito: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    fecha_emision: { type: DataTypes.DATEONLY, allowNull: false },
    documento: { type: DataTypes.JSON, allowNull: false }
}, { tableName: "remitos", timestamps: false });

export default Remito;
