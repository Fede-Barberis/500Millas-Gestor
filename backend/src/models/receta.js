import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Receta = db.define('Receta', {
    id_receta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'recetas',
    timestamps: false
})

export default Receta;