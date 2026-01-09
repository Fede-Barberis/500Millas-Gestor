import { DataTypes } from "sequelize";
import db from "../config/database.js";

const DetalleProduccion = db.define("DetalleProduccion", {
    id_produccion: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    cantidad: { // cantidad real producida
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    tapas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0
    },
    fch_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    lote: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: "detalle_produccion",
    timestamps: false
});

export default DetalleProduccion;