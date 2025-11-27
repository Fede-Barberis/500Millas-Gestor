import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Produccion = db.define('Produccion', {
    id_produccion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    id_receta: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "produccion",
    timestamps: false
});

export default Produccion;