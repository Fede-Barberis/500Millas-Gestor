import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Alerta = db.define('Alerta',{
    id_alerta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nivel: {
        type: DataTypes.ENUM("info", "warning", "danger", "success", "expired"),
        defaultValue: "info",
    },
    mensaje: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }, 
},{
    tableName: "alertas"
});


export default Alerta;