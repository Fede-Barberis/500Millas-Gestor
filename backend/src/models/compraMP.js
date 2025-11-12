import { DataTypes } from "sequelize";
import db from "../config/database.js";

const CompraMP = db.define('CompraMP', {
    id_compra: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    id_materiaPrima: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lote: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    fch_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    isPagado: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    tableName: "comprar_mp",
    timestamps: false
});

export default CompraMP;