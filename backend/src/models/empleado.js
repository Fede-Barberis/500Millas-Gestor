import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Empleado = db.define('Empleado', {
    id_empledo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(20),
        allowNull: false
    }
}, {
    tableName: "empleados",
    timestamps: false
});

export default Empleado;