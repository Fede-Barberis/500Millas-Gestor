import { DataTypes } from "sequelize";
import db from "../config/database.js";

const ConsumoExtra = db.define("ConsumoExtra", {
    id_consumo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_materiaPrima: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_receta: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cantidad_por_lote: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    lote_equivale: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: "consumos_extra",
    timestamps: false
});


export default ConsumoExtra;