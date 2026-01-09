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

    // Unidad real de stock (kg / unidad)
    unidad_base: {
        type: DataTypes.ENUM('kg', 'unidad'),
        allowNull: false,
        defaultValue: 'kg'
    },

    // Cuánto stock real suma UNA unidad comprada
    factor_conversion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1
    },

    // Stock SIEMPRE en unidad_base
    stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },

    stock_minimo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 10
    }

}, {
    tableName: "materia_prima",
    timestamps: false
});

export default MateriaPrima;

