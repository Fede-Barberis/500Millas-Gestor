import { DataTypes } from "sequelize";
import db from "../config/database.js";

const MateriaPrima = db.define('MateriaPrima', {
    id_materiaPrima: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: "materia_prima",
    timestamps: false
});

export default MateriaPrima;
