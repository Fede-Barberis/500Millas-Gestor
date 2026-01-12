import { DataTypes } from "sequelize";
import db from "../config/database.js";

const ReporteMensual = db.define("ReporteMensual", {
    id_reporte: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    año: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_tapas: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_producciones: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    archivo_pdf: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_generacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    estado: {
        type: DataTypes.ENUM("GENERADO", "ERROR"),
        defaultValue: "GENERADO"
    }
}, {
    tableName: "reportes_mensuales",
    timestamps: false
});

export default ReporteMensual;
