import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Venta = db.define('Venta', {
    id_venta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    precio: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    persona: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: "ventas",
    timestamps: false
});

export default Venta;
