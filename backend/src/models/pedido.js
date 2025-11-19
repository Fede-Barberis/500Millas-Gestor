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
    }
}, {
    tableName: "pedidos",
    timestamps: false
})

export default Pedido;