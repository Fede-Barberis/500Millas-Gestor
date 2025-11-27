import { DataTypes } from "sequelize";
import db from "../config/database.js";

const RecetaMateriaPrima = db.define('RecetaMateriaPrima', {
        id_receta: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    id_materiaPrima: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    cantidad_necesaria: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    }
}, {
    tableName: "receta_materiaPrima",
    timestamps: false
});

export default RecetaMateriaPrima;