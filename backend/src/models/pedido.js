import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Pedido = db.define ('Pedido', {
    id_pedido: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fecha_entrega: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    persona: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'entregado'),
        allowNull: false,
        defaultValue: 'pendiente'
    }
}, {
    tableName: "pedidos",
    timestamps: false
})

export default Pedido;