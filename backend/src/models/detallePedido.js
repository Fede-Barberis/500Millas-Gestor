import { DataTypes } from "sequelize";
import db from "../config/database.js";

const detallePedido = db.define('DetallePedido', {
    id_detallePedido: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
    },
}, {
    tableName: "detalle_pedidos",
    timestamps: false
})

export default detallePedido;