import { DataTypes } from "sequelize";
import db from "../config/database.js";

const DetalleEmpleado = db.define('DetalleEmpleado', {
    id_detalle: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_empleado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precioHora: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cantHoras: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    fechaCobro: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: "detalle_empleados",
    timestamps: false
});

export default DetalleEmpleado;