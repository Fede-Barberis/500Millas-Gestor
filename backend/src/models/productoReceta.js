import { DataTypes } from "sequelize";
import db from "../config/database.js";

const ProductoReceta = db.define('ProductoReceta', {
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    id_receta: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    cantidad_estimada: { // cantidad de unidades del producto por receta completa
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    }
}, {
    tableName: "producto_receta",
    timestamps: false
});

export default ProductoReceta;