import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Venta = db.define("Venta", {
    id_venta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    persona: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isPagado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    tableName: "ventas",
    timestamps: false
});

export default Venta;
