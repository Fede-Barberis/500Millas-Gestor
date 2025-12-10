import { DataTypes } from "sequelize";
import db from "../config/database.js";

const VentaDetalle = db.define("VentaDetalle", {
    id_detalle: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_venta: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
}, {
    tableName: "venta_detalle",
    timestamps: false
});



export default VentaDetalle;
