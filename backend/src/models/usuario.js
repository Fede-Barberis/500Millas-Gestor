import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Usuario = db.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {msg: "Debe ser un email valido."}
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fch_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "usuarios",
    timestamps: false
});


export default Usuario;