// src/models/index.js
import db from "../config/database.js";
import Usuario from "./usuario.js";
import Producto from "./producto.js";

// Aquí podrías definir asociaciones entre modelos si las tenés.
// Ej: Producto.hasMany(Venta); Venta.belongsTo(Producto);

export {
    db,
    Usuario,
    Producto,
};
